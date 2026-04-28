import { apiClient } from "@/lib/core/api-client";
import type {
  BehaviorExecutive,
  BehaviorMetricData,
  BehaviorMutationResponse,
  BehaviorRecommendation,
  BehaviorSummary,
  BehaviorZone,
} from "@/lib/behavior/types";

export function getBehaviorSummary() {
  return apiClient.requestData<{ summary: BehaviorSummary }>("/behavior/summary", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBehaviorZones() {
  return apiClient.requestData<{ zones: BehaviorZone[] }>("/behavior/zones", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBehaviorPanic() {
  return apiClient.requestData<{ data: BehaviorMetricData }>("/behavior/panic", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBehaviorFreeze() {
  return apiClient.requestData<{ data: BehaviorMetricData }>("/behavior/freeze", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBehaviorCompliance() {
  return apiClient.requestData<{ data: BehaviorMetricData }>("/behavior/compliance", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getBehaviorVulnerable() {
  return apiClient.requestData<{ data: BehaviorMetricData }>("/behavior/vulnerable", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getBehaviorRecommendations() {
  return apiClient.requestData<{ recommendations: BehaviorRecommendation[] }>("/behavior/recommendations", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBehaviorExecutive() {
  return apiClient.requestData<{ data: BehaviorExecutive }>("/behavior/executive", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function runBehaviorModel(scenario = "active_evacuation") {
  return apiClient.requestData<BehaviorMutationResponse>("/behavior/run", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

