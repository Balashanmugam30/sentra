import type { EvacuationResponse } from "@/lib/predictions/types";

export async function getEvacuationRecommendations(): Promise<EvacuationResponse> {
  const response = await fetch("/api/predictions/evacuation");

  if (!response.ok) {
    throw new Error(`Failed to fetch evacuation recommendations: ${response.status}`);
  }

  return response.json() as Promise<EvacuationResponse>;
}
