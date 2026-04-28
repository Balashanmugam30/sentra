import { apiClient } from "@/lib/core/api-client";
import type { MasterAutonomySummary, MasterBoardSummary, MasterCloudSummary, MasterInvestor, MasterMutationResponse, MasterRevenueRow } from "@/lib/master/types";

export function getAutonomySummary() {
  return apiClient.requestData<{ data: MasterAutonomySummary }>("/autonomy/summary", { priority: "critical", cacheTtlMs: 6_000 });
}

export function runAutonomy(action_id = "ACT-COMMS-002", scenario_id = "INC-AUTO-FIRE") {
  return apiClient.requestData<MasterMutationResponse>("/autonomy/run", {
    method: "POST",
    body: { action_id, scenario_id, reason: "Phase 24 master autonomous execution grid demo" },
    priority: "critical",
  });
}

export function approveAutonomy(action_id = "ACT-ZONE-003") {
  return apiClient.requestData<MasterMutationResponse>("/autonomy/approve", {
    method: "POST",
    body: { action_id, reason: "Human governor approved safe execution" },
    priority: "critical",
  });
}

export function rollbackAutonomy(action_id = "ACT-ZONE-003") {
  return apiClient.requestData<MasterMutationResponse>("/autonomy/rollback", {
    method: "POST",
    body: { action_id, reason: "Rollback to safe corridor posture" },
    priority: "critical",
  });
}

export function getCloudSummary() {
  return apiClient.requestData<{ data: MasterCloudSummary }>("/cloud/summary", { priority: "high", cacheTtlMs: 12_000 });
}

export function createCloudTenant() {
  return apiClient.requestData<MasterMutationResponse>("/cloud/tenant/create", {
    method: "POST",
    body: { payload: { name: "Strategic Airport Authority", vertical: "Aviation", region: "APAC", buildings: 9, seats: 360, mrr: 82000 } },
    priority: "high",
  });
}

export function switchCloudTenant(tenant_id = "TEN-GOVSECURE") {
  return apiClient.requestData<MasterMutationResponse>("/cloud/tenant/switch", {
    method: "POST",
    body: { tenant_id, reason: "Switching global command context" },
    priority: "high",
  });
}

export function getBoardSummary() {
  return apiClient.requestData<{ data: MasterBoardSummary }>("/board/summary", { priority: "normal", cacheTtlMs: 18_000 });
}

export function getBoardRevenue() {
  return apiClient.requestData<{ items: MasterRevenueRow[] }>("/board/revenue", { priority: "normal", cacheTtlMs: 18_000 });
}

export function getBoardInvestors() {
  return apiClient.requestData<{ items: MasterInvestor[] }>("/board/investors", { priority: "normal", cacheTtlMs: 18_000 });
}

export function generateBoardForecast(scenario_id = "base") {
  return apiClient.requestData<MasterMutationResponse>("/board/forecast", {
    method: "POST",
    body: { scenario_id, reason: "Board forecast simulation" },
    priority: "high",
  });
}

export function simulateBoardValuation(objective = "preserve_revenue") {
  return apiClient.requestData<MasterMutationResponse>("/board/valuation", {
    method: "POST",
    body: { objective, reason: "Valuation simulator run" },
    priority: "high",
  });
}

