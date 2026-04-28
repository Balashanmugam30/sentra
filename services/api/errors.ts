import type { ApiError } from "@/types/api";

export class ApiClientError extends Error {
  public readonly payload: ApiError;
  public readonly headers: Headers;

  constructor(payload: ApiError, headers: Headers) {
    super(payload.detail);
    this.name = "ApiClientError";
    this.payload = payload;
    this.headers = headers;
  }
}
