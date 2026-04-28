import { apiClient } from "@/lib/core/api-client";
import type {
  CustomerHealth,
  ExpansionRecommendation,
  ExpansionOpportunity,
  FunnelAnalytics,
  GrowthForecastingResponse,
  GrowthContract,
  GrowthCountry,
  GrowthLiveResponse,
  GrowthMutationResponse,
  GrowthPartner,
  GrowthPricing,
  GrowthRegion,
  GtmSummary,
  LeadScore,
  RenewalSignal,
  SalesDeal,
  GrowthTerritory,
  WhiteLabelProgram,
} from "@/lib/growth/types";

export function getGrowthLive() {
  return apiClient.requestData<GrowthLiveResponse>("/growth/live", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getGrowthSummary() {
  return apiClient.requestData<GtmSummary>("/growth/summary", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getGrowthDeals() {
  return apiClient.requestData<{ deals: SalesDeal[] }>("/growth/deals", { priority: "normal", cacheTtlMs: 10_000 });
}

export function updateGrowthDeal(dealId: string, stage = "Proposal") {
  return apiClient.requestData<GrowthMutationResponse>("/growth/deal/update", {
    method: "POST",
    body: { deal_id: dealId, stage, note: `Moved to ${stage} from GTM command center.` },
    priority: "high",
  });
}

export function getGrowthLeads() {
  return apiClient.requestData<{ leads: LeadScore[] }>("/growth/leads", { priority: "normal", cacheTtlMs: 10_000 });
}

export function getGrowthFunnelAnalytics() {
  return apiClient.requestData<FunnelAnalytics>("/growth/funnel", { priority: "normal", cacheTtlMs: 12_000 });
}

export function getGrowthCustomers() {
  return apiClient.requestData<{ customers: CustomerHealth[]; expansions: ExpansionOpportunity[] }>("/growth/customers", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getGrowthRenewals() {
  return apiClient.requestData<{ renewals: RenewalSignal[] }>("/growth/renewals", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getGrowthRegions() {
  return apiClient.requestData<{ regions: GrowthRegion[] }>("/growth/regions", { priority: "low", cacheTtlMs: 20_000 });
}

export function getGrowthCountries() {
  return apiClient.requestData<{ countries: GrowthCountry[] }>("/growth/countries", { priority: "low", cacheTtlMs: 20_000 });
}

export function getGrowthTerritories() {
  return apiClient.requestData<{ territories: GrowthTerritory[] }>("/growth/territories", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getGrowthPartners() {
  return apiClient.requestData<{ partners: GrowthPartner[] }>("/growth/channel-partners", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getGrowthContracts() {
  return apiClient.requestData<{ contracts: GrowthContract[] }>("/growth/contracts", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getGrowthPricing() {
  return apiClient.requestData<{ pricing: GrowthPricing[] }>("/growth/pricing", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getGrowthForecast() {
  return apiClient.requestData<GrowthForecastingResponse>("/growth/forecast", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function saveGrowthCustomer(customerId: string) {
  return apiClient.requestData<GrowthMutationResponse>("/growth/customer/save", {
    method: "POST",
    body: { customer_id: customerId },
    priority: "high",
  });
}

export function expandGrowthCustomer(customerId: string) {
  return apiClient.requestData<GrowthMutationResponse>("/growth/customer/expand", {
    method: "POST",
    body: { customer_id: customerId },
    priority: "high",
  });
}

export function getGrowthPipeline() {
  return apiClient.requestData<{ pipeline: Record<string, unknown> }>("/growth/pipeline", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getGrowthWhiteLabel() {
  return apiClient.requestData<{ programs: WhiteLabelProgram[] }>("/growth/white-label", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getGrowthExpansionAi() {
  return apiClient.requestData<{ recommendations: ExpansionRecommendation[] }>("/growth/expansion-ai", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function launchGrowthCountry(country = "UAE") {
  return apiClient.requestData<GrowthMutationResponse>("/growth/launch-country", {
    method: "POST",
    body: { country },
    priority: "high",
  });
}

export function createGrowthEnterpriseDeal() {
  return apiClient.requestData<GrowthMutationResponse>("/growth/create-enterprise-deal", {
    method: "POST",
    body: {
      account_name: "Global Airport Command",
      country: "UAE",
      deal_type: "Airport Authority",
      value: 1_250_000,
    },
    priority: "high",
  });
}

export function createGrowthFranchise() {
  return apiClient.requestData<GrowthMutationResponse>("/growth/create-franchise", {
    method: "POST",
    body: { name: "Sentra Gulf Edition", partner_name: "CivicSecure Alliance" },
    priority: "high",
  });
}

export function runGrowthSimulation() {
  return apiClient.requestData<GrowthMutationResponse>("/growth/run-expansion-simulation", {
    method: "POST",
    body: { scenario: "uae_first" },
    priority: "high",
  });
}
