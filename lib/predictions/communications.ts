import type { CommunicationResponse } from "@/lib/predictions/types";

export async function getCommunications(): Promise<CommunicationResponse> {
  const response = await fetch("/api/predictions/communications");

  if (!response.ok) {
    throw new Error(`Failed to fetch communications intelligence: ${response.status}`);
  }

  return response.json() as Promise<CommunicationResponse>;
}
