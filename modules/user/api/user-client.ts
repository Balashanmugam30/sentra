import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/response";
import type { PaginationResponse } from "@/types/api";

import type { UserProfile } from "../types/user";

export async function fetchUsers(): Promise<ApiResponse<PaginationResponse<UserProfile>>> {
  return apiClient.request<PaginationResponse<UserProfile>>("/users");
}
