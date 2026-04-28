import type {
  AnalyticsScenarioLabResponse,
  ScenarioLabRequest,
  ScenarioPresetItem,
} from "@/lib/analytics/types";

export async function getScenarioPresets(): Promise<ScenarioPresetItem[]> {
  const response = await fetch("/api/analytics/scenario-presets");

  if (!response.ok) {
    throw new Error(`Failed to fetch scenario presets: ${response.status}`);
  }

  return response.json() as Promise<ScenarioPresetItem[]>;
}

export async function compareExecutiveScenarios(
  payload: ScenarioLabRequest,
): Promise<AnalyticsScenarioLabResponse> {
  const response = await fetch("/api/analytics/scenario-lab", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to compare scenarios: ${response.status}`);
  }

  return response.json() as Promise<AnalyticsScenarioLabResponse>;
}
