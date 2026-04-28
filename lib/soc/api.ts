import { apiClient } from "@/lib/core/api-client";
import type {
  SocDetectionsResponse,
  SocHealthResponse,
  SocIncidentsResponse,
  SocLiveResponse,
  SocResolveIncidentResponse,
  SocRunScanResponse,
  SocTestAttackResponse,
  SocTestAttackScenario,
} from "@/lib/soc/types";

export async function getSocLive(): Promise<SocLiveResponse> {
  return apiClient.requestData<SocLiveResponse>("/soc/live");
}

export async function getSocHealth(): Promise<SocHealthResponse> {
  return apiClient.requestData<SocHealthResponse>("/soc/health");
}

export async function getSocDetections(): Promise<SocDetectionsResponse> {
  return apiClient.requestData<SocDetectionsResponse>("/soc/detections");
}

export async function getSocIncidents(): Promise<SocIncidentsResponse> {
  return apiClient.requestData<SocIncidentsResponse>("/soc/incidents");
}

export async function postSocRunScan(): Promise<SocRunScanResponse> {
  return apiClient.requestData<SocRunScanResponse>("/soc/run-scan", {
    method: "POST",
  });
}

export async function postSocResolveIncident(incidentId: string): Promise<SocResolveIncidentResponse> {
  return apiClient.requestData<SocResolveIncidentResponse>("/soc/resolve-incident", {
    method: "POST",
    body: { incident_id: incidentId },
  });
}

export async function postSocTestAttack(scenario: SocTestAttackScenario): Promise<SocTestAttackResponse> {
  return apiClient.requestData<SocTestAttackResponse>("/soc/test-attack", {
    method: "POST",
    body: { scenario },
  });
}
