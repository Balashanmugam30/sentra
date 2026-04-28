import type { SimulationResponse } from "@/lib/simulation/types";

export async function getLiveSimulation(): Promise<SimulationResponse> {
  const response = await fetch("/api/simulation/live");

  if (!response.ok) {
    throw new Error(`Failed to fetch live simulation: ${response.status}`);
  }

  return response.json() as Promise<SimulationResponse>;
}
