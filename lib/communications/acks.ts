import type {
  AckBulkTestRequest,
  AckBulkTestResponse,
  AckRespondRequest,
  AckRespondResponse,
  CommunicationsAcksResponse,
} from "@/lib/communications/types";

export async function getCommunicationsAcks(): Promise<CommunicationsAcksResponse> {
  const response = await fetch("/api/communications/acks");

  if (!response.ok) {
    throw new Error(`Failed to fetch response feedback center: ${response.status}`);
  }

  return response.json() as Promise<CommunicationsAcksResponse>;
}

export async function respondToAlert(payload: AckRespondRequest): Promise<AckRespondResponse> {
  const response = await fetch("/api/communications/respond", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit acknowledgement: ${response.status}`);
  }

  return response.json() as Promise<AckRespondResponse>;
}

export async function respondBulkTest(payload: AckBulkTestRequest): Promise<AckBulkTestResponse> {
  const response = await fetch("/api/communications/respond-bulk-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to inject bulk responses: ${response.status}`);
  }

  return response.json() as Promise<AckBulkTestResponse>;
}

