import type {
  FieldAcknowledgeRequest,
  FieldAcknowledgeResponse,
  FieldBackupRequest,
  FieldBackupResponse,
  FieldCheckpointRequest,
  FieldCheckpointResponse,
  FieldLiveResponse,
  FieldRegisterRequest,
  FieldRegisterResponse,
  FieldRespondersResponse,
  FieldStatusUpdateRequest,
  FieldStatusUpdateResponse,
  FieldSyncRequest,
  FieldSyncResponse,
  FieldTasksResponse,
} from "@/lib/field/types";
import { authenticatedFetch } from "@/lib/auth/fetch";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getFieldLive(): Promise<FieldLiveResponse> {
  const response = await authenticatedFetch("/field/live");
  return parseResponse(response, "Failed to fetch field live state");
}

export async function getFieldResponders(): Promise<FieldRespondersResponse> {
  const response = await authenticatedFetch("/field/responders");
  return parseResponse(response, "Failed to fetch field responders");
}

export async function getFieldTasks(): Promise<FieldTasksResponse> {
  const response = await authenticatedFetch("/field/tasks");
  return parseResponse(response, "Failed to fetch field tasks");
}

export async function registerFieldResponder(
  payload: FieldRegisterRequest,
): Promise<FieldRegisterResponse> {
  const response = await authenticatedFetch("/field/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to register field responder");
}

export async function acknowledgeFieldTask(
  payload: FieldAcknowledgeRequest,
): Promise<FieldAcknowledgeResponse> {
  const response = await authenticatedFetch("/field/acknowledge", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to acknowledge field task");
}

export async function updateFieldTaskStatus(
  payload: FieldStatusUpdateRequest,
): Promise<FieldStatusUpdateResponse> {
  const response = await authenticatedFetch("/field/status", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to update field task status");
}

export async function requestFieldBackup(
  payload: FieldBackupRequest,
): Promise<FieldBackupResponse> {
  const response = await authenticatedFetch("/field/request-backup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to request field backup");
}

export async function submitFieldCheckpoint(
  payload: FieldCheckpointRequest,
): Promise<FieldCheckpointResponse> {
  const response = await authenticatedFetch("/field/checkpoint", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to submit field checkpoint");
}

export async function syncFieldEvents(
  payload: FieldSyncRequest,
): Promise<FieldSyncResponse> {
  const response = await authenticatedFetch("/field/sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to sync field events");
}
