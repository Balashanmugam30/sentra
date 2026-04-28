// Shared transport-layer contracts live in /types so every feature consumes
// the same API envelope and pagination semantics.
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError {
  type: string;
  title: string;
  status: number;
  code: string;
  message?: string;
  detail: string;
  trace_id?: string;
  retryable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PaginationResponse<T> {
  items: T[];
  next_cursor: string | null;
}
