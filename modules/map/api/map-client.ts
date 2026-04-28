import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/response";

import type { ZoneStatus } from "../types/zone";

export async function fetchZoneStatus(
  buildingId: string,
  zoneId: string,
): Promise<ApiResponse<ZoneStatus>> {
  return apiClient.request<ZoneStatus>(`/buildings/${buildingId}/zones/${zoneId}/status`);
}
