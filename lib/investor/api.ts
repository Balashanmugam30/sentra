import { apiClient } from "@/lib/core/api-client";
import type { InvestorLiveResponse, InvestorMutationResponse, InvestorRecord, InvestorSummary } from "@/lib/investor/types";

export function getInvestorLive() {
  return apiClient.requestData<InvestorLiveResponse>("/investor/live", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getInvestorSummary() {
  return apiClient.requestData<{ summary: InvestorSummary }>("/investor/summary", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getInvestorMetrics() {
  return apiClient.requestData<{ metrics: Record<string, unknown> }>("/investor/metrics", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getInvestorValuation() {
  return apiClient.requestData<{ valuation: Record<string, unknown> }>("/investor/valuation", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getInvestorRunway() {
  return apiClient.requestData<{ runway: Record<string, unknown> }>("/investor/runway", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getInvestorCapTable() {
  return apiClient.requestData<{ captable: Record<string, unknown> }>("/investor/captable", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getInvestorReadiness() {
  return apiClient.requestData<{ readiness: Record<string, unknown> }>("/investor/readiness", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getInvestorBoard() {
  return apiClient.requestData<{ board: Record<string, unknown> }>("/investor/board", {
    priority: "normal",
    cacheTtlMs: 14_000,
  });
}

export function getInvestorBoardPack() {
  return apiClient.requestData<{ boardpack: Record<string, unknown> }>("/investor/boardpack", {
    priority: "normal",
    cacheTtlMs: 14_000,
  });
}

export function getInvestorDataRoom() {
  return apiClient.requestData<{ dataroom: Record<string, unknown> }>("/investor/dataroom", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getInvestorMna() {
  return apiClient.requestData<{ mna: Record<string, unknown> }>("/investor/mna", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getInvestorIpo() {
  return apiClient.requestData<{ ipo: Record<string, unknown> }>("/investor/ipo", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getInvestorInvestors() {
  return apiClient.requestData<{ investors: InvestorRecord[] }>("/investor/investors", {
    priority: "normal",
    cacheTtlMs: 14_000,
  });
}

export function getInvestorFunds() {
  return apiClient.requestData<{ funds: InvestorRecord[] }>("/investor/funds", {
    priority: "normal",
    cacheTtlMs: 14_000,
  });
}

export function updateInvestorFund(investorId: string, status = "partner meeting") {
  return apiClient.requestData<InvestorMutationResponse>("/investor/fund/update", {
    method: "POST",
    body: { investor_id: investorId, status, note: `Moved to ${status} from Investor OS.` },
    priority: "high",
  });
}

export function getInvestorCopilot() {
  return apiClient.requestData<{ copilot: Record<string, unknown> }>("/investor/copilot", {
    priority: "normal",
    cacheTtlMs: 14_000,
  });
}

export function addInvestorCash(amount = 2_000_000) {
  return apiClient.requestData<InvestorMutationResponse>("/investor/add-cash", {
    method: "POST",
    body: { amount },
    priority: "high",
  });
}

export function runInvestorScenario(scenario = "Raise $10M") {
  return apiClient.requestData<InvestorMutationResponse>("/investor/run-scenario", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function addInvestorProspect() {
  return apiClient.requestData<InvestorMutationResponse>("/investor/add-investor", {
    method: "POST",
    body: {
      fund_name: "Strategic Continuity Fund",
      partner_name: "Avery Stone",
      check_size: 4_000_000,
      stage_fit: "Series A",
    },
    priority: "high",
  });
}

export function updateInvestorCapTable() {
  return apiClient.requestData<InvestorMutationResponse>("/investor/update-cap-table", {
    method: "POST",
    priority: "high",
  });
}

export function generateInvestorBoardPack() {
  return apiClient.requestData<InvestorMutationResponse>("/investor/generate-board-pack", {
    method: "POST",
    priority: "high",
  });
}

export function seedInvestorDemo() {
  return apiClient.requestData<InvestorMutationResponse>("/investor/seed-demo", {
    method: "POST",
    priority: "high",
  });
}
