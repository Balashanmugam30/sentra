import { apiClient } from "@/lib/core/api-client";
import type { DemoEnvelope } from "@/lib/demo/types";
import type { PolishArea } from "@/components/polish/polish-scoreboard";

export type PolishState = {
  polish_areas: PolishArea[];
  global_polish_score: number;
  design_system: string[];
  performance_posture: string[];
};

export function getPolishState() {
  return apiClient.requestData<DemoEnvelope<PolishState>>("/demo/polish", { priority: "normal", cacheTtlMs: 20_000 });
}

