// Deprecated compatibility adapter. New UI code should import from
// /modules/incident/api instead of /services.
import type { ApiResponse } from "@/services/api/response";

import { fetchIncident } from "../api/incident-client";

import type { Incident } from "../types/incident";

export async function getIncident(incidentId: string) {
  return fetchIncident(incidentId) as Promise<ApiResponse<Incident>>;
}
