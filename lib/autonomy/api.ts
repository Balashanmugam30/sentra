import { apiClient } from "@/lib/core/api-client";
import type { AutonomyDataResponse, AutonomyLiveResponse, AutonomyMode, AutonomyMutationResponse } from "@/lib/autonomy/types";

function getAutonomyData(path: string, cacheTtlMs = 10_000) {
  return apiClient.requestData<AutonomyDataResponse>(path, {
    priority: "normal",
    cacheTtlMs,
  });
}

export function getAutonomyLive() {
  return apiClient.requestData<AutonomyLiveResponse>("/autonomy/live", {
    priority: "high",
    cacheTtlMs: 6_000,
  });
}

export function getAutonomyMemory() {
  return getAutonomyData("/autonomy/memory", 18_000);
}

export function getAutonomyObjectives() {
  return getAutonomyData("/autonomy/objectives", 12_000);
}

export function getAutonomyPlan() {
  return getAutonomyData("/autonomy/plan", 10_000);
}

export function getAutonomyPredict() {
  return getAutonomyData("/autonomy/predict", 10_000);
}

export function getAutonomyLearning() {
  return getAutonomyData("/autonomy/learning", 14_000);
}

export function getAutonomyTrust() {
  return getAutonomyData("/autonomy/trust", 14_000);
}

export function getAutonomyHealth() {
  return getAutonomyData("/autonomy/health", 8_000);
}

export function getAutonomyGovernance() {
  return getAutonomyData("/autonomy/governance", 14_000);
}

export function getAutonomyExplain() {
  return getAutonomyData("/autonomy/explain", 18_000);
}

export function getAutonomyBranches() {
  return getAutonomyData("/autonomy/branches", 16_000);
}

function postAutonomyAction(path: string, body: Record<string, unknown> = {}) {
  return apiClient.requestData<AutonomyMutationResponse>(path, {
    method: "POST",
    body,
    priority: "high",
  });
}

export function setAutonomyObjective(objective: string, reason = "operator selected objective") {
  return postAutonomyAction("/autonomy/set-objective", { objective, reason });
}

export function runAutonomyLearningCycle() {
  return postAutonomyAction("/autonomy/run-learning-cycle");
}

export function runAutonomyHeal() {
  return postAutonomyAction("/autonomy/run-heal");
}

export function setAutonomyMode(mode: AutonomyMode, reason = "operator changed autonomy mode") {
  return postAutonomyAction("/autonomy/set-mode", { mode, reason });
}

