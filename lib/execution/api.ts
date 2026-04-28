import { apiClient } from "@/lib/core/api-client";
import type { ExecutionLiveResponse, ExecutionMutationResponse } from "@/lib/execution/types";

function getExecutionData(path: string, cacheTtlMs = 12_000) {
  return apiClient.requestData<{ data: Record<string, unknown> }>(path, {
    priority: "normal",
    cacheTtlMs,
  });
}

export function getExecutionLive() {
  return apiClient.requestData<ExecutionLiveResponse>("/execution/live", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getExecutionCeo() {
  return getExecutionData("/execution/ceo");
}

export function getExecutionCoo() {
  return getExecutionData("/execution/coo");
}

export function getExecutionCfo() {
  return getExecutionData("/execution/cfo");
}

export function getExecutionCro() {
  return getExecutionData("/execution/cro");
}

export function getExecutionChro() {
  return getExecutionData("/execution/chro");
}

export function getExecutionCiso() {
  return getExecutionData("/execution/ciso");
}

export function getExecutionCouncil() {
  return getExecutionData("/execution/council");
}

export function getExecutionBoard() {
  return getExecutionData("/execution/board");
}

export function getExecutionScenarios() {
  return getExecutionData("/execution/scenarios", 20_000);
}

export function getExecutionProductivity() {
  return getExecutionData("/execution/productivity");
}

export function getExecutionWorkflows() {
  return getExecutionData("/execution/workflows");
}

export function getExecutionSimulate() {
  return getExecutionData("/execution/simulate", 20_000);
}

export function getExecutionEfficiency() {
  return getExecutionData("/execution/efficiency");
}

function postExecutionAction(path: string, body: Record<string, unknown> = {}) {
  return apiClient.requestData<ExecutionMutationResponse>(path, {
    method: "POST",
    body,
    priority: "high",
  });
}

export function runExecutionReview() {
  return postExecutionAction("/execution/run-review");
}

export function activateExecutionGrowthMode() {
  return postExecutionAction("/execution/growth-mode");
}

export function activateExecutionCostMode() {
  return postExecutionAction("/execution/cost-mode");
}

export function createExecutionRaisePlan(amount = 20_000_000) {
  return postExecutionAction("/execution/raise-plan", { amount });
}

export function createExecutionHirePlan(hires = 3) {
  return postExecutionAction("/execution/hire-plan", { hires });
}

export function runExecutionSimulation(scenario = "Expand to 3 countries") {
  return postExecutionAction("/execution/run-simulation", { scenario });
}
