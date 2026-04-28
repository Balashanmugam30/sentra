import type { SystemEvent } from "../events/types";
import { getLocalAuthSession } from "@/lib/auth-session";
import { apiClient } from "@/lib/core/api-client";
import { updateFirestoreIncidentStatus } from "@/lib/firestore";

export type Incident = {
  id: string;
  type: string;
  status: string;
  severity: number;
  location: string;
  created_at: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  lat?: number | null;
  lng?: number | null;
  created_by?: string | null;
  assigned_to?: string | null;
  updated_at?: string | null;
  images?: string[];
  videos?: string[];
  ai_summary?: string | null;
  source?: string | null;
  risk_level?: string | null;
  incident_type?: string | null;
  confidence?: number | null;
  detected_by?: string | null;
  recommended_action?: string | null;
  priority?: string | null;
  decision_confidence?: number | null;
  decided_by?: string | null;
};

export async function getIncidents() {
  return apiClient.requestData<{ success: boolean; data: Incident[] }>("/incidents", {
    priority: "critical",
    cacheTtlMs: 4_000,
  });
}

export async function updateIncidentStatus(id: string, status: string) {
  await updateFirestoreIncidentStatus(id, status).catch(() => undefined);
  const res = await fetch(`/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update incident: ${res.status}`);
  }

  return res.json();
}

let incidentPipelineAuthBlocked = false;
let incidentPipelineAuthWarningLogged = false;

export async function handleEvent(event: SystemEvent) {
  if (event.type === "INCIDENT_CREATED") {
    const traceId =
      typeof event.payload === "object" &&
      event.payload !== null &&
      "trace_id" in event.payload
        ? (event.payload as { trace_id?: string }).trace_id
        : undefined;

    if (incidentPipelineAuthBlocked) {
      return;
    }

    const session = getLocalAuthSession();
    if (!session?.accessToken) {
      if (!incidentPipelineAuthWarningLogged) {
        console.warn(
          `[PIPELINE] skipped incident post trace_id=${traceId ?? "missing"} because no authenticated session is available`,
        );
        incidentPipelineAuthWarningLogged = true;
      }
      return;
    }

    console.info(`[PIPELINE] posting incident trace_id=${traceId ?? "missing"}`);

    const response = await apiClient.fetchResponse("/incidents", {
      method: "POST",
      body: event.payload,
      retryNetworkError: false,
      timeoutMs: 6_000,
    });

    if (response.status === 401 || response.status === 403) {
      incidentPipelineAuthBlocked = true;
      console.warn(
        `[PIPELINE] incident post blocked with ${response.status}; suppressing further client pipeline posts until reload`,
      );
      return;
    }

    if (!response.ok) {
      console.warn(
        `[PIPELINE] incident post failed trace_id=${traceId ?? "missing"} status=${response.status}`,
      );
      return;
    }

    console.info(`[PIPELINE] incident post accepted trace_id=${traceId ?? "missing"}`);
  }
}
