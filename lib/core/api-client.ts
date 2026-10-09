"use client";

import {
  clearClientAuthSessionCookie,
  clearLocalAuthSession,
  getLocalAuthSession,
  setAuthNotice,
  setClientAuthSessionCookie,
  setLocalAuthSession,
  type LocalAuthSession,
} from "@/lib/auth-session";
import { getDataCacheStats, invalidateDataCache } from "@/lib/core/data-cache";
import { requestOrchestrator, type RequestPriority } from "@/lib/core/request-orchestrator";
import { mapBackendUserToAuthUser, type BackendAuthUser } from "@/modules/auth/types/auth";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { AppPermission } from "@/types/rbac";

type ApiClientError = {
  code: string;
  message: string;
  status: number;
  retryable: boolean;
};

type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
      meta: {
        status: number;
        durationMs: number;
        fromCache: false;
      };
    }
  | {
      success: false;
      error: ApiClientError;
      meta: {
        status: number;
        durationMs: number;
        fromCache: false;
      };
    };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  auth?: "auto" | "none";
  skipRefresh?: boolean;
  retryNetworkError?: boolean;
  timeoutMs?: number;
  dedupe?: boolean;
  priority?: RequestPriority;
  cacheTtlMs?: number;
  staleWhileRevalidateMs?: number;
  cacheKey?: string;
  background?: boolean;
};

type RequestMetric = {
  at: number;
  durationMs: number;
  failed: boolean;
};

type ApiPerformanceSnapshot = {
  requestsPerMinute: number;
  averageLatencyMs: number;
  failedRequests: number;
  activeRequests: number;
  queuedRequests: number;
  authRefreshCount: number;
  p95LatencyMs: number;
  cacheHitRatio: number;
  duplicateRequestsPrevented: number;
  backgroundRefreshes: number;
  circuitOpenEndpoints: number;
  slowEndpointCount: number;
  backendMode: "healthy" | "watch" | "degraded";
};

export class ApiRequestError extends Error {
  code: string;
  status: number;
  retryable: boolean;
  path: string;

  constructor(error: ApiClientError, path: string) {
    super(error.message);
    this.name = error.retryable ? "SentraRecoverableApiError" : "SentraApiRequestError";
    this.code = error.code;
    this.status = error.status;
    this.retryable = error.retryable;
    this.path = path;
  }
}

function resolveApiBaseUrl() {
  const explicitBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (explicitBase) {
    return explicitBase;
  }

  const legacyBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim();
  const isProduction =
    process.env.NEXT_PUBLIC_APP_ENV === "production" || process.env.NODE_ENV === "production";

  if (!isProduction) {
    if (backendBase) {
      return backendBase;
    }

    if (legacyBase && !legacyBase.includes("localhost:4000/api/v1")) {
      return legacyBase;
    }

    return "http://127.0.0.1:8000";
  }

  return explicitBase || legacyBase || backendBase || "/api";
}

const API_BASE_URL = resolveApiBaseUrl();
const DEFAULT_TIMEOUT_MS = 12_000;
const NETWORK_RETRY_DELAY_MS = 1_000;
const SESSION_EXPIRY_SKEW_MS = 90_000;
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const GET_RETRY_BACKOFF_MS = [1_000, 3_000, 10_000, 30_000] as const;
const MAX_SAFE_GET_RETRIES = GET_RETRY_BACKOFF_MS.length;
const CIRCUIT_FAILURE_THRESHOLD = 4;
const CIRCUIT_COOLDOWN_MS = 30_000;
const SLOW_ENDPOINT_THRESHOLD_MS = 2_000;
const LIVE_DELAYED_MESSAGE = "Live data temporarily syncing. Showing verified state.";

const performanceListeners = new Set<() => void>();
const requestMetrics: RequestMetric[] = [];
const circuitBreakers = new Map<string, { failures: number; openedUntil: number; lastError: string }>();
const slowEndpointLog = new Map<string, { count: number; maxDurationMs: number; lastAt: number }>();

let activeRequests = 0;
let authRefreshCount = 0;
let refreshPromise: Promise<boolean> | null = null;

function notifyPerformanceListeners() {
  for (const listener of performanceListeners) {
    listener();
  }
}

function trackRequestMetric(metric: RequestMetric) {
  requestMetrics.push(metric);
  const cutoff = Date.now() - 60_000;
  while (requestMetrics.length > 0 && requestMetrics[0] && requestMetrics[0].at < cutoff) {
    requestMetrics.shift();
  }
  notifyPerformanceListeners();
}

function normalizePath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedBase === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
}

function createRequestKey(url: string, method: string, body: unknown) {
  return `${method}:${url}:${body ? JSON.stringify(body) : ""}`;
}

function createCircuitKey(path: string, method: string) {
  const normalizedPath = path.split("?")[0] ?? path;
  return `${method}:${normalizedPath}`;
}

function getRetryDelayMs(attempt: number, status?: number) {
  const baseDelay = GET_RETRY_BACKOFF_MS[Math.min(attempt, GET_RETRY_BACKOFF_MS.length - 1)] ?? 30_000;
  return status === 429 ? Math.max(baseDelay, 3_000) : baseDelay;
}

function canRetryRequest(path: string, options: RequestOptions, status?: number) {
  const method = options.method ?? "GET";
  if (method !== "GET") {
    return false;
  }
  if (path.includes("/auth/") || options.retryNetworkError === false) {
    return false;
  }
  return status === undefined || TRANSIENT_STATUSES.has(status);
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"))
  );
}

function getCircuit(circuitKey: string) {
  const circuit = circuitBreakers.get(circuitKey);
  if (!circuit) {
    return null;
  }
  if (circuit.openedUntil > 0 && circuit.openedUntil <= Date.now()) {
    circuit.openedUntil = 0;
    circuit.failures = Math.max(0, circuit.failures - 1);
  }
  return circuit;
}

function recordCircuitSuccess(circuitKey: string) {
  circuitBreakers.delete(circuitKey);
}

function recordCircuitFailure(circuitKey: string, message: string) {
  const circuit = circuitBreakers.get(circuitKey) ?? {
    failures: 0,
    openedUntil: 0,
    lastError: "",
  };
  circuit.failures += 1;
  circuit.lastError = message;
  if (circuit.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuit.openedUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
  }
  circuitBreakers.set(circuitKey, circuit);
}

function trackSlowEndpoint(circuitKey: string, durationMs: number) {
  if (durationMs < SLOW_ENDPOINT_THRESHOLD_MS) {
    return;
  }
  const current = slowEndpointLog.get(circuitKey) ?? {
    count: 0,
    maxDurationMs: 0,
    lastAt: 0,
  };
  current.count += 1;
  current.maxDurationMs = Math.max(current.maxDurationMs, durationMs);
  current.lastAt = Date.now();
  slowEndpointLog.set(circuitKey, current);
}

function getDefaultCacheTtlMs(path: string, method: string) {
  if (method !== "GET") {
    return 0;
  }

  if (path.includes("/auth/") || path.includes("/rbac/")) {
    return 0;
  }

  if (path.includes("/soc/live") || path.includes("/geo/live")) {
    return 15_000;
  }
  if (path.includes("/aicouncil/") || path.includes("/ai/live") || path.includes("/ai/recommendations") || path.includes("/ai/council")) {
    return 15_000;
  }
  if (path.includes("/ai/weak-signals") || path.includes("/ai/swarm") || path.includes("/ai/cascade")) {
    return 30_000;
  }
  if (path.includes("/predictions/")) {
    return path.includes("/predictions/resources") || path.includes("/predictions/communications")
      ? 45_000
      : 30_000;
  }
  if (path.includes("/incidents")) {
    return 30_000;
  }
  if (
    path.includes("/mlops/") ||
    path.includes("/ml/") ||
    path.includes("/autonomy/") ||
    path.includes("/cloud/") ||
    path.includes("/board/") ||
    path.includes("/data/") ||
    path.includes("/developers/") ||
    path.includes("/integrations/") ||
    path.includes("/twin/") ||
    path.includes("/security/") ||
    path.includes("/platform/") ||
    path.includes("/marketplace/") ||
    path.includes("/channel/") ||
    path.includes("/demo/") ||
    path.includes("/launch/") ||
    path.includes("/submission/") ||
    path.includes("/site/") ||
    path.includes("/behavior/") ||
    path.includes("/ai/predict") ||
    path.includes("/ai/scenarios") ||
    path.includes("/ai/resources") ||
    path.includes("/ai/facility-brain") ||
    path.includes("/ai/comms") ||
    path.includes("/ai/confidence") ||
    path.includes("/ai/copilot") ||
    path.includes("/ai/behavior")
  ) {
    return 45_000;
  }
  if (
    path.includes("/ai/agents") ||
    path.includes("/ai/debate") ||
    path.includes("/ai/campaign") ||
    path.includes("/ai/negotiation")
  ) {
    return 60_000;
  }
  if (path.includes("/ai/supremacy-score")) {
    return 30_000;
  }
  if (
    path.includes("/ai/memory-advanced") ||
    path.includes("/ai/policies") ||
    path.includes("/ai/trust")
  ) {
    return 60_000;
  }
  if (path.includes("/environment/live") || path.includes("/osint/live")) {
    return 30_000;
  }
  if (path.includes("/audit/live")) {
    return 45_000;
  }
  if (
    path.includes("/analytics") ||
    path.includes("/boardroom") ||
    path.includes("/forecast") ||
    path.includes("/history")
  ) {
    return 60_000;
  }
  if (path.includes("/health") || path.includes("/detections") || path.includes("/incidents")) {
    return 12_000;
  }
  return 30_000;
}

function getDefaultPriority(path: string): RequestPriority {
  if (
    path.includes("/auth/") ||
    path.includes("/rbac/") ||
    path.includes("/ai/live") ||
    path.includes("/ai/weak-signals") ||
    path.includes("/ai/supremacy-score") ||
    path.includes("/soc/live") ||
    path.includes("/autonomy/run") ||
    path.includes("/cloud/") ||
    path.includes("/board/") ||
    path.includes("/data/") ||
    path.includes("/developers/") ||
    path.includes("/integrations/") ||
    path.includes("/twin/live") ||
    path.includes("/platform/") ||
    path.includes("/marketplace/") ||
    path.includes("/channel/") ||
    path.includes("/demo/") ||
    path.includes("/launch/") ||
    path.includes("/submission/") ||
    path.includes("/site/") ||
    path.includes("/operations")
  ) {
    return path.includes("/auth/") || path.includes("/incidents") || path.includes("/autonomy/run")
      ? "critical"
      : "normal";
  }
  if (path.includes("/geo") || path.includes("/field") || path.includes("/hardware") || path.includes("/facility")) {
    return "high";
  }
  if (path.includes("/history") || path.includes("/export") || path.includes("/analytics")) {
    return path.includes("/history") || path.includes("/export") ? "background" : "low";
  }
  return "normal";
}

function getDefaultTimeoutMs(path: string, priority: RequestPriority) {
  if (priority === "critical") {
    return 6_000;
  }
  if (priority === "high") {
    return 8_000;
  }
  if (priority === "low" || path.includes("/history") || path.includes("/analytics")) {
    return 15_000;
  }
  if (priority === "background") {
    return 18_000;
  }
  return DEFAULT_TIMEOUT_MS;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isJsonResponse(response: Response) {
  return (response.headers.get("content-type") ?? "").includes("application/json");
}

function toApiError(
  status: number,
  message: string,
  code = "API_REQUEST_FAILED",
  retryable = status >= 500 || status === 429,
): ApiClientError {
  return {
    code,
    message,
    status,
    retryable,
  };
}

function updateStoresFromSession(session: LocalAuthSession) {
  const mappedUser = mapBackendUserToAuthUser({
    id: session.user.uid,
    email: session.user.email ?? "",
    name: session.user.displayName ?? session.user.email ?? "Sentra Operator",
    role: session.user.role === "guest" ? "guest_viewer" : session.user.role,
    permissions: session.user.permissions as AppPermission[] | undefined,
    accessible_modules: session.user.accessibleModules,
    tenant_id: session.user.tenantId,
    organization_name: session.user.organizationName,
    organization_slug: session.user.organizationSlug,
    org_role: session.user.orgRole,
    plan: session.user.plan,
    last_login: null,
  });

  useAuthStore.getState().setSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
    accessTokenIssuedAt: session.accessTokenIssuedAt,
    tokenRefreshedAt: session.tokenRefreshedAt,
    user: mappedUser,
  });

  useUserStore.getState().setCurrentUser({
    userId: mappedUser.uid,
    email: mappedUser.email ?? "",
    displayName: mappedUser.displayName ?? mappedUser.email ?? "Sentra Operator",
    roles: [mappedUser.role],
  });
}

function applyAuthPayload(payload: {
  access_token: string;
  refresh_token: string | null;
  expires_in: number;
  user: BackendAuthUser;
}) {
  const now = new Date();
  const session: LocalAuthSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessTokenExpiresAt: new Date(now.getTime() + payload.expires_in * 1000).toISOString(),
    accessTokenIssuedAt: now.toISOString(),
    tokenRefreshedAt: now.toISOString(),
    user: {
      uid: payload.user.id,
      email: payload.user.email,
      displayName: payload.user.name,
      phoneNumber: null,
      photoURL: null,
      providerId: "password",
      role: payload.user.role,
      permissions: payload.user.permissions ?? [],
      accessibleModules: payload.user.accessible_modules ?? [],
      tenantId: payload.user.tenant_id ?? null,
      organizationName: payload.user.organization_name ?? null,
      organizationSlug: payload.user.organization_slug ?? null,
      orgRole: payload.user.org_role ?? null,
      plan: payload.user.plan ?? null,
    },
  };

  setLocalAuthSession(session);
  setClientAuthSessionCookie();
  updateStoresFromSession(session);
}

function clearAuthState() {
  clearLocalAuthSession();
  clearClientAuthSessionCookie();
  useAuthStore.getState().clearSession();
  useUserStore.getState().setCurrentUser(null);
}

function redirectToLogin(message = "Session expired. Please sign in again.") {
  if (typeof window === "undefined") {
    return;
  }

  setAuthNotice(message);
  const target = `${window.location.origin}/login?reason=session-expired`;
  if (window.location.href !== target) {
    window.location.replace(target);
  }
}

function willSessionExpireSoon() {
  const session = getLocalAuthSession();
  if (!session?.accessTokenExpiresAt) {
    return false;
  }

  if (session.accessToken?.startsWith("demo-token-")) {
    return false;
  }

  const expiresAt = new Date(session.accessTokenExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return expiresAt - Date.now() <= SESSION_EXPIRY_SKEW_MS;
}

async function performFetch(
  url: string,
  options: RequestOptions,
  useAuthorization = true,
): Promise<Response> {
  const headers = new Headers(options.headers ?? {});
  const method = options.method ?? "GET";
  const session = getLocalAuthSession();

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (useAuthorization && options.auth !== "none" && !headers.has("Authorization") && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort(
      typeof DOMException === "undefined"
        ? undefined
        : new DOMException("SENTRA_REQUEST_TIMEOUT", "AbortError"),
    );
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  activeRequests += 1;
  notifyPerformanceListeners();

  try {
    return await fetch(url, {
      method,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      body:
        options.body !== undefined
          ? typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body)
          : undefined,
    });
  } finally {
    window.clearTimeout(timeout);
    activeRequests = Math.max(0, activeRequests - 1);
    notifyPerformanceListeners();
  }
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  if (!isJsonResponse(response)) {
    const text = await response.text();
    throw toApiError(
      response.status,
      text.includes("<html")
        ? "Backend returned HTML instead of JSON."
        : text || "Backend returned a non-JSON response.",
      "NON_JSON_RESPONSE",
      false,
    );
  }

  return (await response.json()) as T;
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = getLocalAuthSession();
    if (!session?.refreshToken) {
      return false;
    }

    if (session.accessToken?.startsWith("demo-token-") || session.refreshToken?.startsWith("demo-refresh-")) {
      return true;
    }

    try {
      const response = await performFetch(
        normalizePath("/auth/refresh"),
        {
          method: "POST",
          body: {
            refresh_token: session.refreshToken,
          },
          auth: "none",
          skipRefresh: true,
          retryNetworkError: false,
        },
        false,
      );

      if (!response.ok) {
        return false;
      }

      const payload = await parseResponseBody<{
        access_token: string;
        refresh_token: string | null;
        expires_in: number;
        user: BackendAuthUser;
      }>(response);
      authRefreshCount += 1;
      applyAuthPayload(payload);
      notifyPerformanceListeners();
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions = {},
  attempt = 0,
): Promise<ApiEnvelope<T>> {
  const startedAt = performance.now();
  const url = normalizePath(path);
  const method = options.method ?? "GET";
  const circuitKey = createCircuitKey(path, method);
  const circuit = getCircuit(circuitKey);

  if (method === "GET" && circuit?.openedUntil && circuit.openedUntil > Date.now()) {
    const durationMs = Math.round(performance.now() - startedAt);
    trackRequestMetric({
      at: Date.now(),
      durationMs,
      failed: true,
    });
    return {
      success: false,
      error: toApiError(
        503,
        `Temporarily using cached/stale data while ${path} recovers.`,
        "CIRCUIT_OPEN",
        true,
      ),
      meta: {
        status: 503,
        durationMs,
        fromCache: false,
      },
    };
  }

  try {
    const response = await performFetch(url, options);

    if (response.status === 401 && options.auth !== "none" && !options.skipRefresh && attempt === 0) {
      const currentSession = getLocalAuthSession();
      const isDemoToken = Boolean(
        currentSession?.accessToken?.startsWith("demo-token-") ||
        currentSession?.refreshToken?.startsWith("demo-refresh-"),
      );

      // Demo sessions should never be redirected to login on background 401s
      if (isDemoToken) {
        const durationMs = Math.round(performance.now() - startedAt);
        trackRequestMetric({
          at: Date.now(),
          durationMs,
          failed: true,
        });
        return {
          success: false,
          error: toApiError(401, "Protected data temporarily unavailable in demo mode.", "AUTH_UNAUTHORIZED", false),
          meta: {
            status: 401,
            durationMs,
            fromCache: false,
          },
        };
      }

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return executeRequest<T>(path, options, attempt + 1);
      }

      // ONLY redirect to login if this request was an explicit auth verification route (/auth/me, /auth/refresh)
      // Never wipe the session and redirect for background data polls (e.g. /geo/live, /soc/live, /operations/*)
      const isAuthVerificationPath = path.startsWith("/auth/") && path !== "/auth/login";
      if (isAuthVerificationPath) {
        clearAuthState();
        redirectToLogin();
      }

      const durationMs = Math.round(performance.now() - startedAt);
      trackRequestMetric({
        at: Date.now(),
        durationMs,
        failed: true,
      });
      return {
        success: false,
        error: toApiError(401, "Session expired or unauthorized.", "AUTH_EXPIRED", false),
        meta: {
          status: 401,
          durationMs,
          fromCache: false,
        },
      };
    }

    if (!response.ok) {
      const payload = isJsonResponse(response)
        ? await response.json().catch(() => null)
        : { detail: await response.text().catch(() => "Request failed") };
      const durationMs = Math.round(performance.now() - startedAt);
      const message =
        payload && typeof payload === "object" && "detail" in payload && typeof payload.detail === "string"
          ? payload.detail
          : `Request failed with ${response.status}`;

      if (attempt < MAX_SAFE_GET_RETRIES && canRetryRequest(path, options, response.status)) {
        await delay(getRetryDelayMs(attempt, response.status));
        return executeRequest<T>(path, options, attempt + 1);
      }

      const recoverableGetFailure = canRetryRequest(path, options, response.status);
      const clientMessage = recoverableGetFailure ? LIVE_DELAYED_MESSAGE : message;
      recordCircuitFailure(circuitKey, message);
      trackSlowEndpoint(circuitKey, durationMs);
      trackRequestMetric({
        at: Date.now(),
        durationMs,
        failed: true,
      });
      return {
        success: false,
        error: toApiError(response.status, clientMessage, "API_REQUEST_FAILED", recoverableGetFailure),
        meta: {
          status: response.status,
          durationMs,
          fromCache: false,
        },
      };
    }

    const data = await parseResponseBody<T>(response);
    const durationMs = Math.round(performance.now() - startedAt);
    recordCircuitSuccess(circuitKey);
    trackSlowEndpoint(circuitKey, durationMs);
    trackRequestMetric({
      at: Date.now(),
      durationMs,
      failed: false,
    });
    return {
      success: true,
      data,
      meta: {
        status: response.status,
        durationMs,
        fromCache: false,
      },
    };
  } catch (error) {
    if (attempt < MAX_SAFE_GET_RETRIES && canRetryRequest(path, options)) {
      await delay(getRetryDelayMs(attempt));
      return executeRequest<T>(path, { ...options, retryNetworkError: false }, attempt + 1);
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const aborted = isAbortError(error);
    trackRequestMetric({
      at: Date.now(),
      durationMs,
      failed: true,
    });
    const message = aborted
      ? LIVE_DELAYED_MESSAGE
      : error instanceof Error
      ? error.message
      : "Unable to reach the backend service.";
    if (!aborted) {
      recordCircuitFailure(circuitKey, message);
    }
    trackSlowEndpoint(circuitKey, durationMs);
    return {
      success: false,
      error: toApiError(503, message, aborted ? "REQUEST_ABORTED" : "NETWORK_ERROR"),
      meta: {
        status: 503,
        durationMs,
        fromCache: false,
      },
    };
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}) {
    const method = options.method ?? "GET";
    const url = normalizePath(path);
    const key = options.cacheKey ?? createRequestKey(url, method, options.body);

    if (method === "GET") {
      const priority = options.priority ?? getDefaultPriority(path);
      const cacheTtlMs = options.cacheTtlMs ?? getDefaultCacheTtlMs(path, method);
      return requestOrchestrator.request<ApiEnvelope<T>>({
        key,
        priority,
        ttlMs: cacheTtlMs,
        staleWhileRevalidateMs: options.staleWhileRevalidateMs ?? Math.max(cacheTtlMs * 8, 30_000),
        background: options.background,
        dedupe: options.dedupe,
        cacheable: (envelope) => envelope.success,
        execute: () =>
          executeRequest<T>(path, {
            ...options,
            timeoutMs: options.timeoutMs ?? getDefaultTimeoutMs(path, priority),
          }),
      });
    }

    const envelope = await executeRequest<T>(path, options);
    if (envelope.success) {
      invalidateDataCache();
    }
    return envelope;
  },

  async requestData<T>(path: string, options: RequestOptions = {}) {
    const envelope = await this.request<T>(path, options);
    if (!envelope.success) {
      if ((options.method ?? "GET") === "GET" && envelope.error.retryable) {
        return {
          stale: true,
          message: LIVE_DELAYED_MESSAGE,
        } as T;
      }
      throw new ApiRequestError(envelope.error, path);
    }
    return envelope.data;
  },

  async fetchResponse(path: string, options: RequestOptions = {}, attempt = 0): Promise<Response> {
    try {
      const response = await performFetch(normalizePath(path), options);

      if (response.status === 401 && options.auth !== "none" && !options.skipRefresh && attempt === 0) {
        const currentSession = getLocalAuthSession();
        const isDemoToken = Boolean(
          currentSession?.accessToken?.startsWith("demo-token-") ||
          currentSession?.refreshToken?.startsWith("demo-refresh-"),
        );
        if (!isDemoToken) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            return this.fetchResponse(path, options, attempt + 1);
          }

          if (path.startsWith("/auth/") && path !== "/auth/login") {
            clearAuthState();
            redirectToLogin();
          }
        }
      }

      return response;
    } catch (error) {
      if (attempt === 0 && options.retryNetworkError !== false) {
        await delay(NETWORK_RETRY_DELAY_MS);
        return this.fetchResponse(path, { ...options, retryNetworkError: false }, attempt + 1);
      }
      throw error;
    }
  },

  async ensureSession(force = false) {
    if (!force && !willSessionExpireSoon()) {
      return true;
    }
    return refreshAccessToken();
  },

  clearAuthAndRedirect(message?: string) {
    const session = getLocalAuthSession();
    if (session?.accessToken?.startsWith("demo-token-")) {
      return;
    }
    clearAuthState();
    redirectToLogin(message);
  },

  subscribePerformance(listener: () => void) {
    performanceListeners.add(listener);
    return () => {
      performanceListeners.delete(listener);
    };
  },
};

export function getApiPerformanceSnapshot(): ApiPerformanceSnapshot {
  const cutoff = Date.now() - 60_000;
  const recent = requestMetrics.filter((metric) => metric.at >= cutoff);
  const failedRequests = recent.filter((metric) => metric.failed).length;
  const latencies = recent.map((metric) => metric.durationMs).sort((left, right) => left - right);
  const averageLatencyMs =
    recent.length > 0
      ? Math.round(recent.reduce((sum, metric) => sum + metric.durationMs, 0) / recent.length)
      : 0;
  const p95Index = latencies.length > 0 ? Math.min(latencies.length - 1, Math.ceil(latencies.length * 0.95) - 1) : 0;
  const orchestratorStats = requestOrchestrator.getStats();
  const cacheStats = getDataCacheStats();

  const backendMode =
    failedRequests >= 8
      ? "degraded"
      : failedRequests >= 3 || averageLatencyMs >= 2_500
      ? "watch"
      : "healthy";

  return {
    requestsPerMinute: recent.length,
    averageLatencyMs,
    failedRequests,
    activeRequests: Math.max(activeRequests, orchestratorStats.activeRequests),
    queuedRequests: orchestratorStats.queuedRequests,
    authRefreshCount,
    p95LatencyMs: latencies[p95Index] ?? 0,
    cacheHitRatio: cacheStats.hitRatio,
    duplicateRequestsPrevented: orchestratorStats.duplicateRequestsPrevented,
    backgroundRefreshes: orchestratorStats.backgroundRefreshes,
    circuitOpenEndpoints: [...circuitBreakers.values()].filter(
      (circuit) => circuit.openedUntil > Date.now(),
    ).length,
    slowEndpointCount: slowEndpointLog.size,
    backendMode,
  };
}
