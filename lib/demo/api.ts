import { apiClient } from "@/lib/core/api-client";
import type { DemoEnvelope, DemoExportState, DemoJudgeState, DemoMutationResponse, DemoScenesState, DemoSummary } from "@/lib/demo/types";

export function getDemoSummary() {
  return apiClient.requestData<DemoEnvelope<DemoSummary>>("/demo/summary", { priority: "critical", cacheTtlMs: 6_000 });
}

export function getDemoScenes() {
  return apiClient.requestData<DemoEnvelope<DemoScenesState>>("/demo/scenes?mode=judge", { priority: "critical", cacheTtlMs: 6_000 });
}

export function getDemoJudge() {
  return apiClient.requestData<DemoEnvelope<DemoJudgeState>>("/demo/judge", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getDemoExport() {
  return apiClient.requestData<DemoEnvelope<DemoExportState>>("/demo/export", { priority: "normal", cacheTtlMs: 20_000 });
}

export function runDemo(mode = "judge", scenario = "fire") {
  return apiClient.requestData<DemoMutationResponse>("/demo/run", {
    method: "POST",
    body: { mode, scenario, reason: "Phase 20.X guided demo started" },
    priority: "critical",
  });
}

export function runDemoScenario(scenario: string, mode = "judge") {
  return apiClient.requestData<DemoMutationResponse>(`/demo/run/${scenario}`, {
    method: "POST",
    body: { mode, reason: `${scenario} scenario injected from demo page` },
    priority: "critical",
  });
}

export function advanceDemoScene(speed = 1) {
  return apiClient.requestData<DemoMutationResponse>("/demo/next", {
    method: "POST",
    body: { speed, reason: "Presenter advanced scene" },
    priority: "critical",
  });
}

export function resetDemo() {
  return apiClient.requestData<DemoMutationResponse>("/demo/reset", {
    method: "POST",
    body: { reason: "Presenter reset demo" },
    priority: "critical",
  });
}

