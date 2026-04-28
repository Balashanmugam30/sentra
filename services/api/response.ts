import type { ApiError } from "@/types/api";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export function normalizeApiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function normalizeApiError(error: ApiError): ApiResponse<never> {
  return {
    success: false,
    error: {
      ...error,
      message: error.message ?? error.detail ?? error.title,
      detail: error.detail ?? error.message ?? error.title,
      title: error.title ?? "Request failed",
    },
  };
}
