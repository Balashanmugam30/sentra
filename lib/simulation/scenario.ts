import type { ScenarioRequest, ScenarioResponse } from "@/lib/simulation/types";

export async function postScenarioSimulation(
  payload: ScenarioRequest,
): Promise<ScenarioResponse> {
  const response = await fetch("/api/simulation/scenario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to simulate scenario: ${response.status}`);
  }

  return response.json() as Promise<ScenarioResponse>;
}
