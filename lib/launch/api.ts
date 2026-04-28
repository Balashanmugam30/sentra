import { apiClient } from "@/lib/core/api-client";
import type {
  LaunchEnvelope,
  LaunchExecutive,
  LaunchMutationResponse,
  LaunchOps,
  LaunchPerformance,
  LaunchQuality,
  LaunchReadiness,
  LaunchSummary,
} from "@/lib/launch/types";

export function getLaunchSummary() {
  return apiClient.requestData<LaunchEnvelope<LaunchSummary>>("/launch/summary", { priority: "critical", cacheTtlMs: 12_000 });
}

export function getLaunchPerformance() {
  return apiClient.requestData<LaunchEnvelope<LaunchPerformance>>("/launch/performance", { priority: "high", cacheTtlMs: 10_000 });
}

export function getLaunchQuality() {
  return apiClient.requestData<LaunchEnvelope<LaunchQuality>>("/launch/quality", { priority: "high", cacheTtlMs: 10_000 });
}

export function getLaunchReadiness() {
  return apiClient.requestData<LaunchEnvelope<LaunchReadiness>>("/launch/readiness", { priority: "critical", cacheTtlMs: 15_000 });
}

export function getLaunchExecutive() {
  return apiClient.requestData<LaunchEnvelope<LaunchExecutive>>("/launch/executive", { priority: "critical", cacheTtlMs: 15_000 });
}

export function getLaunchOps() {
  return apiClient.requestData<LaunchEnvelope<LaunchOps>>("/launch/ops", { priority: "high", cacheTtlMs: 8_000 });
}

export function runLaunchScan(target = "all") {
  return apiClient.requestData<LaunchMutationResponse>("/launch/scan", {
    method: "POST",
    priority: "high",
    body: { target, reason: "Phase 29.A launch quality scan" },
  });
}

export function runLaunchOptimize(target = "performance") {
  return apiClient.requestData<LaunchMutationResponse>("/launch/optimize", {
    method: "POST",
    priority: "high",
    body: { target, reason: "Phase 29.A launch optimization pass" },
  });
}
