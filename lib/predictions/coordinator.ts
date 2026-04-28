import type { CoordinatorResponse } from "@/lib/predictions/types";

export async function getCoordinatorIntelligence(): Promise<CoordinatorResponse> {
  const response = await fetch("/api/predictions/coordinator");

  if (!response.ok) {
    throw new Error(`Failed to fetch coordination intelligence: ${response.status}`);
  }

  return response.json() as Promise<CoordinatorResponse>;
}
