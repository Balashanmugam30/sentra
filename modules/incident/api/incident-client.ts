import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/response";

import type { Incident } from "../types/incident";

export async function fetchIncident(incidentId: string): Promise<ApiResponse<Incident>> {
  return apiClient.request<Incident>(`/incidents/${incidentId}`);
}
