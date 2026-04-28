import type {
  FacilityActionResponse,
  FacilityAnnouncementRequest,
  FacilityAssetsResponse,
  FacilityDoorCommandRequest,
  FacilityElevatorRecallRequest,
  FacilityEventsResponse,
  FacilityFirePanelEventRequest,
  FacilityFirePanelEventResponse,
  FacilityHvacCommandRequest,
  FacilityLiveResponse,
  FacilityLockdownRequest,
  FacilityTestScenarioRequest,
  FacilityTestScenarioResponse,
} from "@/lib/facility/types";
import { authenticatedFetch } from "@/lib/auth/fetch";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getFacilityLive(): Promise<FacilityLiveResponse> {
  const response = await authenticatedFetch("/facility/live");
  return parseResponse(response, "Failed to fetch facility live state");
}

export async function getFacilityAssets(): Promise<FacilityAssetsResponse> {
  const response = await authenticatedFetch("/facility/assets");
  return parseResponse(response, "Failed to fetch facility assets");
}

export async function getFacilityEvents(): Promise<FacilityEventsResponse> {
  const response = await authenticatedFetch("/facility/events");
  return parseResponse(response, "Failed to fetch facility events");
}

export async function postFacilityLockdown(
  payload: FacilityLockdownRequest,
): Promise<FacilityActionResponse> {
  const response = await authenticatedFetch("/facility/lockdown", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run facility lockdown");
}

export async function postFacilityDoorCommand(
  payload: FacilityDoorCommandRequest,
): Promise<FacilityActionResponse> {
  const response = await authenticatedFetch("/facility/door-command", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run door command");
}

export async function postFacilityHvacCommand(
  payload: FacilityHvacCommandRequest,
): Promise<FacilityActionResponse> {
  const response = await authenticatedFetch("/facility/hvac-command", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run HVAC command");
}

export async function postFacilityAnnouncement(
  payload: FacilityAnnouncementRequest,
): Promise<FacilityActionResponse> {
  const response = await authenticatedFetch("/facility/announcement", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to send facility announcement");
}

export async function postFacilityElevatorRecall(
  payload: FacilityElevatorRecallRequest,
): Promise<FacilityActionResponse> {
  const response = await authenticatedFetch("/facility/elevator-recall", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run elevator recall");
}

export async function postFacilityFirePanelEvent(
  payload: FacilityFirePanelEventRequest,
): Promise<FacilityFirePanelEventResponse> {
  const response = await authenticatedFetch("/facility/fire-panel-event", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to ingest fire panel event");
}

export async function postFacilityTestScenario(
  payload: FacilityTestScenarioRequest,
): Promise<FacilityTestScenarioResponse> {
  const response = await authenticatedFetch("/facility/test-scenario", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run facility test scenario");
}
