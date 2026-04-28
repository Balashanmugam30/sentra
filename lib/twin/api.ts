import { apiClient } from "@/lib/core/api-client";
import type {
  TwinCampusState,
  TwinCompareState,
  TwinFacilityState,
  TwinForecast,
  TwinLive,
  TwinLiveRoutes,
  TwinMutationResponse,
  TwinPredictiveState,
  TwinReplayIntelligence,
  TwinReplayState,
  TwinResourcesState,
  TwinScenario,
  TwinSummary,
  TwinTelemetry,
} from "@/lib/twin/types";

export function getTwinSummary() {
  return apiClient.requestData<{ data: TwinSummary }>("/twin/summary", { priority: "high", cacheTtlMs: 8_000 });
}

export function getTwinLive() {
  return apiClient.requestData<{ data: TwinLive }>("/twin/live", { priority: "critical", cacheTtlMs: 5_000 });
}

export function getTwinFacility(facilityId?: string) {
  const suffix = facilityId ? `?facility_id=${encodeURIComponent(facilityId)}` : "";
  return apiClient.requestData<{ data: TwinFacilityState }>(`/twin/facility${suffix}`, { priority: "high", cacheTtlMs: 10_000 });
}

export function getTwinReplay() {
  return apiClient.requestData<{ data: TwinReplayState }>("/twin/replay", { priority: "normal", cacheTtlMs: 12_000 });
}

export function loadTwinReplay(replay_id = "RPL-HOTEL-KITCHEN") {
  return apiClient.requestData<TwinMutationResponse>("/twin/replay/load", {
    method: "POST",
    body: { replay_id, reason: "Phase 25 replay lab load" },
    priority: "high",
  });
}

export function simulateTwinScenario(scenario_id = "SCN-FIRE-ROOM-X") {
  return apiClient.requestData<TwinMutationResponse>("/twin/simulate", {
    method: "POST",
    body: { scenario_id, reason: "Phase 25 scenario trainer simulation" },
    priority: "critical",
  });
}

export function getTwinTelemetry() {
  return apiClient.requestData<{ data: TwinTelemetry }>("/twin/telemetry", { priority: "high", cacheTtlMs: 5_000 });
}

export function getTwinScenarios() {
  return apiClient.requestData<{ items: TwinScenario[] }>("/twin/scenarios", { priority: "normal", cacheTtlMs: 20_000 });
}

export function getTwinPredictive() {
  return apiClient.requestData<{ data: TwinPredictiveState }>("/twin/predict", { priority: "critical", cacheTtlMs: 6_000 });
}

export function getTwinForecast() {
  return apiClient.requestData<{ data: TwinForecast }>("/twin/forecast", { priority: "high", cacheTtlMs: 8_000 });
}

export function getTwinLiveRoutes() {
  return apiClient.requestData<{ data: TwinLiveRoutes }>("/twin/routes/live", { priority: "critical", cacheTtlMs: 6_000 });
}

export function computeTwinRoute(useCase = "fire_team_pathing") {
  return apiClient.requestData<TwinMutationResponse>("/twin/route/compute", {
    method: "POST",
    body: { scenario_id: useCase, payload: { use_case: useCase }, reason: "Phase 25.Y autonomous route compute" },
    priority: "critical",
  });
}

export function getTwinResources() {
  return apiClient.requestData<{ data: TwinResourcesState }>("/twin/resources", { priority: "high", cacheTtlMs: 8_000 });
}

export function rebalanceTwinResources() {
  return apiClient.requestData<TwinMutationResponse>("/twin/resources/rebalance", {
    method: "POST",
    body: { reason: "Phase 25.Y swarm resource rebalance" },
    priority: "critical",
  });
}

export function getTwinCampus() {
  return apiClient.requestData<{ data: TwinCampusState }>("/twin/campus", { priority: "high", cacheTtlMs: 10_000 });
}

export function getTwinNetwork() {
  return apiClient.requestData<{ data: TwinCampusState }>("/twin/network", { priority: "high", cacheTtlMs: 10_000 });
}

export function compareTwinStrategies() {
  return apiClient.requestData<TwinMutationResponse & { data: TwinCompareState }>("/twin/compare", {
    method: "POST",
    body: { reason: "Phase 25.Y executive decision simulator" },
    priority: "high",
  });
}

export function getTwinReplayIntelligence() {
  return apiClient.requestData<{ data: TwinReplayIntelligence }>("/twin/replay/intelligence", { priority: "normal", cacheTtlMs: 12_000 });
}
