import type { TimelineResponse } from "@/lib/simulation/types";

export async function getSimulationTimeline(): Promise<TimelineResponse> {
  const response = await fetch("/api/simulation/timeline");

  if (!response.ok) {
    throw new Error(`Failed to fetch simulation timeline: ${response.status}`);
  }

  return response.json() as Promise<TimelineResponse>;
}
