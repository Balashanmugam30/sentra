import type {
  ApiResult,
  AuthChangePasswordResponse,
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthMeResponse,
  BootstrapAdminPayload,
  BootstrapAdminResponse,
  ChangePasswordPayload,
  FirebaseLoginPayload,
  LoginPayload,
  RefreshPayload,
} from "@/lib/auth/types";
import { getLocalAuthSession } from "@/lib/auth-session";
import { apiClient, LIVE_DELAYED_MESSAGE } from "@/lib/core/api-client";

async function authRequest<T>(
  path: string,
  init: {
    method?: "GET" | "POST";
    body?: unknown;
    skipRefresh?: boolean;
    auth?: "auto" | "none";
    timeoutMs?: number;
  } = {},
): Promise<ApiResult<T>> {
  const envelope = await apiClient.request<T>(`/auth${path}`, {
    method: init.method ?? "GET",
    body: init.body,
    auth: init.auth ?? "auto",
    skipRefresh: init.skipRefresh ?? false,
    timeoutMs: init.timeoutMs ?? 45_000,
  });

  if (envelope.success) {
    return { ok: true, data: envelope.data };
  }

  const rawDetail = envelope.error.message;
  const detail =
    rawDetail === LIVE_DELAYED_MESSAGE || rawDetail?.includes("temporarily syncing")
      ? "Authentication server is initializing. Please try again in a few moments."
      : rawDetail;

  return {
    ok: false,
    error: {
      type: "about:blank",
      title: "Authentication request failed",
      status: envelope.error.status,
      code: envelope.error.code,
      detail,
    },
  };
}

export function bootstrapAdmin(payload: BootstrapAdminPayload) {
  return authRequest<BootstrapAdminResponse>("/bootstrap-admin", {
    method: "POST",
    body: payload,
    auth: "none",
    skipRefresh: true,
  });
}

export function login(payload: LoginPayload) {
  return authRequest<AuthLoginResponse>("/login", {
    method: "POST",
    body: payload,
    auth: "none",
    skipRefresh: true,
  });
}

export function loginWithFirebase(payload: FirebaseLoginPayload) {
  return authRequest<AuthLoginResponse>("/firebase", {
    method: "POST",
    body: payload,
    auth: "none",
    skipRefresh: true,
  });
}

export function getCurrentUser() {
  return authRequest<AuthMeResponse>("/me", {
    skipRefresh: true,
  });
}

export function refreshSession(payload?: RefreshPayload) {
  const storedSession = getLocalAuthSession();
  return authRequest<AuthLoginResponse>("/refresh", {
    method: "POST",
    body: payload ?? { refresh_token: storedSession?.refreshToken ?? undefined },
    skipRefresh: true,
    auth: "none",
  });
}

export function logout(payload?: RefreshPayload) {
  const storedSession = getLocalAuthSession();
  return authRequest<AuthLogoutResponse>("/logout", {
    method: "POST",
    body: payload ?? { refresh_token: storedSession?.refreshToken ?? undefined },
    skipRefresh: true,
  });
}

export function changePassword(payload: ChangePasswordPayload) {
  return authRequest<AuthChangePasswordResponse>("/change-password", {
    method: "POST",
    body: payload,
  });
}
