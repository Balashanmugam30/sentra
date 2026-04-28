import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/response";

import type { AlertSummary } from "../types/alert";

export async function dispatchAlert(payload: {
  incident_id: string;
  title: string;
  body: string;
}): Promise<ApiResponse<AlertSummary>> {
  return apiClient.request<AlertSummary, typeof payload>("/alerts", {
    method: "POST",
    body: payload,
  });
}
