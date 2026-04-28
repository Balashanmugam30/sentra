// Deprecated compatibility adapter. New UI entry points should call
// /modules/user/api.
import type { ApiResponse } from "@/services/api/response";
import type { PaginationResponse } from "@/types/api";

import { fetchUsers } from "../api/user-client";
import type { UserProfile } from "../types/user";

export async function listUsers() {
  return fetchUsers() as Promise<ApiResponse<PaginationResponse<UserProfile>>>;
}
