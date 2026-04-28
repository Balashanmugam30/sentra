import type { HttpMethod } from "@/types/api";

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  requiresAuth?: boolean;
  retry?: number;
  skipErrorObserver?: boolean;
}

export interface InterceptorContext {
  url: string;
  init: RequestInit;
}
