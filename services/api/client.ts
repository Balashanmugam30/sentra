"use client";

import { appConfig, featureFlags } from "@/config";
import { logger } from "@/lib/logger";
import { logRequestLifecycle } from "@/lib/request-logger";
import { generateTraceId } from "@/lib/trace";
import { useAnalyticsStore } from "@/store/analytics-store";
import type { ApiError } from "@/types/api";

import { normalizeApiError, normalizeApiSuccess, type ApiResponse } from "./response";
import type { InterceptorContext, RequestOptions } from "./types";

type RequestInterceptor = (context: InterceptorContext) => Promise<InterceptorContext> | InterceptorContext;
type ResponseInterceptor = (response: Response) => Promise<Response> | Response;
type ErrorObserver = (error: ApiError, context: { method: string; url: string }) => void;

class ApiClient {
  private accessTokenResolver: (() => string | null) | null = null;
  private readonly requestInterceptors = new Set<RequestInterceptor>();
  private readonly responseInterceptors = new Set<ResponseInterceptor>();
  private errorObserver: ErrorObserver | null = null;

  private normalizeClientError(
    error: unknown,
    fallback: {
      code: string;
      detail: string;
      status: number;
      title?: string;
      metadata?: Record<string, unknown>;
    },
  ): ApiError {
    const message = error instanceof Error ? error.message : fallback.detail;
    const extractedCode =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : fallback.code;

    return {
      type: "about:blank",
      title: fallback.title ?? "Request failed",
      status: fallback.status,
      code: extractedCode,
      message: message || fallback.detail,
      detail: message || fallback.detail,
      retryable: fallback.status >= 500 || fallback.status === 429,
      ...(fallback.metadata ? { metadata: fallback.metadata } : {}),
    };
  }

  constructor(private readonly baseUrl: string) {
    this.requestInterceptors.add((context) => {
      const headers = new Headers(context.init.headers);
      const traceId = generateTraceId();

      headers.set("Content-Type", "application/json");
      headers.set("X-Request-Id", traceId);

      if (!headers.has("Authorization")) {
        const token = this.accessTokenResolver?.();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return {
        ...context,
        init: {
          ...context.init,
          headers,
        },
      };
    });

    this.responseInterceptors.add((response) => {
      if (featureFlags.analytics) {
        useAnalyticsStore.getState().trackResponseHeaders(response.url, response.headers);
      }

      return response;
    });
  }

  setAccessTokenResolver(resolver: () => string | null) {
    this.accessTokenResolver = resolver;
  }

  setErrorObserver(observer: ErrorObserver) {
    this.errorObserver = observer;
  }

  async request<TResponse, TBody = unknown>(
    path: string,
    options: RequestOptions<TBody> = {},
  ): Promise<ApiResponse<TResponse>> {
    const method = options.method ?? "GET";
    const url = `${this.baseUrl}${path}`;
    const retryCount = options.retry ?? 2;

    try {
      let context: InterceptorContext = {
        url,
        init: {
          method,
          signal: options.signal,
          headers: options.headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        },
      };

      for (const interceptor of this.requestInterceptors) {
        context = await interceptor(context);
      }

      const startedAt = performance.now();
      const response = await this.executeWithRetry(context, retryCount);
      let interceptedResponse = response;

      for (const interceptor of this.responseInterceptors) {
        interceptedResponse = await interceptor(interceptedResponse);
      }

      logRequestLifecycle({
        method,
        url,
        traceId: context.init.headers instanceof Headers ? context.init.headers.get("X-Request-Id") ?? "" : "",
        status: interceptedResponse.status,
        durationMs: Math.round(performance.now() - startedAt),
      });

      if (!interceptedResponse.ok) {
        const payload = (await interceptedResponse.json().catch(() => null)) as ApiError | null;
        const fallbackPayload: ApiError = payload ?? {
          type: "about:blank",
          title: "Request failed",
          status: interceptedResponse.status,
          code: "HTTP_ERROR",
          message: "Unexpected API error.",
          detail: "Unexpected API error.",
          retryable: interceptedResponse.status >= 500 || interceptedResponse.status === 429,
        };

        if (interceptedResponse.status === 429) {
          useAnalyticsStore.getState().trackRateLimit(path, fallbackPayload);
        }

        logger.warn("API responded with an error", {
          url,
          status: interceptedResponse.status,
          code: fallbackPayload.code,
        });

        if (!options.skipErrorObserver) {
          this.errorObserver?.(fallbackPayload, {
            method,
            url,
          });
        }

        return normalizeApiError(fallbackPayload);
      }

      const data = (await interceptedResponse.json().catch(() => null)) as TResponse;
      return normalizeApiSuccess(data);
    } catch (error) {
      const fallbackPayload = this.normalizeClientError(error, {
        code: "REQUEST_FAILURE",
        detail: "Request failed.",
        status: 500,
        title: "Client request failed",
        metadata: {
          method,
          url,
        },
      });

      logger.error("API client request failed", {
        method,
        url,
        error: fallbackPayload,
      });

      if (!options.skipErrorObserver) {
        this.errorObserver?.(fallbackPayload, {
          method,
          url,
        });
      }

      return normalizeApiError(fallbackPayload);
    }
  }

  private createErrorResponse(error: ApiError, status = error.status ?? 500) {
    return new Response(JSON.stringify(error), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private async executeWithRetry(context: InterceptorContext, retries: number) {
    let attempt = 0;

    while (true) {
      try {
        useAnalyticsStore.getState().trackRequest(context.url);
        const response = await fetch(context.url, context.init);

        if (!response.ok && this.shouldRetry(response.status) && attempt < retries) {
          attempt += 1;
          const retryAfter = response.headers.get("Retry-After");
          await this.sleep(this.resolveBackoff(attempt, retryAfter));
          continue;
        }

        return response;
      } catch (error) {
        const normalizedError = this.normalizeClientError(error, {
          code: "UNKNOWN",
          detail: "Unable to reach the API service.",
          status: 503,
          title: "Network request failed",
        });

        if (attempt >= retries) {
          logger.error("API request failed", {
            url: context.url,
            error: normalizedError,
          });

          return this.createErrorResponse(normalizedError, 503);
        }

        attempt += 1;
        await this.sleep(this.resolveBackoff(attempt));
      }
    }
  }

  private shouldRetry(status: number) {
    return status === 429 || status === 502 || status === 503 || status === 504;
  }

  private resolveBackoff(attempt: number, retryAfterHeader?: string | null) {
    if (retryAfterHeader) {
      const retryAfter = Number(retryAfterHeader) * 1000;
      if (!Number.isNaN(retryAfter)) {
        return retryAfter;
      }
    }

    const jitter = Math.floor(Math.random() * 250);
    return Math.min(8000, 250 * 2 ** attempt) + jitter;
  }

  private sleep(delayMs: number) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, delayMs);
    });
  }
}

export const apiClient = new ApiClient(appConfig.apiBaseUrl);
