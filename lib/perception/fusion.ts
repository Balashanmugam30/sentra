import type { FusionResponse } from "@/lib/perception/types";

export async function getPerceptionFusion(): Promise<FusionResponse> {
  const response = await fetch("/api/perception/fusion");

  if (!response.ok) {
    throw new Error(`Failed to fetch fusion intelligence: ${response.status}`);
  }

  return response.json() as Promise<FusionResponse>;
}

