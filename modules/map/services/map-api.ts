// Deprecated compatibility adapter. Feature hooks and components should import
// from /modules/map/api.
import type { ApiResponse } from "@/services/api/response";

import { fetchZoneStatus } from "../api/map-client";

import type { ZoneStatus } from "../types/zone";

export async function getZoneStatus(buildingId: string, zoneId: string) {
  return fetchZoneStatus(buildingId, zoneId) as Promise<ApiResponse<ZoneStatus>>;
}
