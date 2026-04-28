import { apiClient } from "@/lib/core/api-client";

export async function authenticatedFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  return apiClient.fetchResponse(input, {
    method: (init.method?.toUpperCase() as "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined) ?? "GET",
    body: init.body,
    headers: init.headers,
  });
}
