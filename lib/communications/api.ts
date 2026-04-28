import type {
  BroadcastRequest,
  BroadcastResponse,
  CommunicationsLiveResponse,
  SendTestRequest,
  SendTestResponse,
} from "@/lib/communications/types";

export async function getLiveCommunications(): Promise<CommunicationsLiveResponse> {
  const response = await fetch("/api/communications/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch communications hub: ${response.status}`);
  }

  return response.json() as Promise<CommunicationsLiveResponse>;
}

export async function sendTestAlert(payload: SendTestRequest): Promise<SendTestResponse> {
  const response = await fetch("/api/communications/send-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to send test alert: ${response.status}`);
  }

  return response.json() as Promise<SendTestResponse>;
}

export async function broadcastAlert(payload: BroadcastRequest): Promise<BroadcastResponse> {
  const response = await fetch("/api/communications/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to broadcast alert: ${response.status}`);
  }

  return response.json() as Promise<BroadcastResponse>;
}

