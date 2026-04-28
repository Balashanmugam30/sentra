// Deprecated compatibility adapter. Prefer /modules/communication/api for UI
// imports.
import type { ApiResponse } from "@/services/api/response";

import { dispatchAlert } from "../api/communication-client";

import type { AlertSummary } from "../types/alert";

export async function sendAlert(payload: {
  incident_id: string;
  title: string;
  body: string;
}) {
  return dispatchAlert(payload) as Promise<ApiResponse<AlertSummary>>;
}
