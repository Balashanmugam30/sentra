import type {
  OfflineActivateResponse,
  OfflineCacheStatusResponse,
  OfflineLiveResponse,
  OfflineStoreEventRequest,
  OfflineStoreEventResponse,
  OfflineSyncNowResponse,
  OfflineTestOutageRequest,
  OfflineTestOutageResponse,
} from "@/lib/offline/types";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getOfflineLive(): Promise<OfflineLiveResponse> {
  const response = await fetch("/api/offline/live");
  return parseResponse(response, "Failed to fetch offline live state");
}

export async function getOfflineCacheStatus(): Promise<OfflineCacheStatusResponse> {
  const response = await fetch("/api/offline/cache-status");
  return parseResponse(response, "Failed to fetch offline cache status");
}

export async function activateOfflineMode(): Promise<OfflineActivateResponse> {
  const response = await fetch("/api/offline/activate", {
    method: "POST",
  });
  return parseResponse(response, "Failed to activate offline mode");
}

export async function deactivateOfflineMode(): Promise<OfflineActivateResponse> {
  const response = await fetch("/api/offline/deactivate", {
    method: "POST",
  });
  return parseResponse(response, "Failed to deactivate offline mode");
}

export async function storeOfflineEvent(
  payload: OfflineStoreEventRequest,
): Promise<OfflineStoreEventResponse> {
  const response = await fetch("/api/offline/store-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to store offline event");
}

export async function syncOfflineNow(): Promise<OfflineSyncNowResponse> {
  const response = await fetch("/api/offline/sync-now", {
    method: "POST",
  });
  return parseResponse(response, "Failed to sync offline queue");
}

export async function testOfflineOutage(
  payload: OfflineTestOutageRequest,
): Promise<OfflineTestOutageResponse> {
  const response = await fetch("/api/offline/test-outage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to run offline outage test");
}

