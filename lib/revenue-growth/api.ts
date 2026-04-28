import { apiClient } from "@/lib/core/api-client";
import type {
  AuthoritySignal,
  ConversionMetric,
  DemoConversion,
  FunnelStage,
  LeadSource,
  PricingExperiment,
  ReferralProgram,
  RevenueGrowthLive,
  RevenueGrowthMutationResponse,
  SalesAiAction,
  ViralLoop,
  WaitlistSignal,
} from "@/lib/revenue-growth/types";

export function getRevenueGrowthLive() {
  return apiClient.requestData<RevenueGrowthLive>("/revenue-growth/live", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getRevenueGrowthFunnel() {
  return apiClient.requestData<{ funnel: FunnelStage[] }>("/revenue-growth/funnel", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getRevenueGrowthLeadSources() {
  return apiClient.requestData<{ sources: LeadSource[] }>("/revenue-growth/lead-sources", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getRevenueGrowthConversion() {
  return apiClient.requestData<{
    demo_to_paid: DemoConversion;
    metrics: ConversionMetric[];
    recommendations: SalesAiAction[];
  }>("/revenue-growth/conversion", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getRevenueGrowthReferrals() {
  return apiClient.requestData<{ programs: ReferralProgram[] }>("/revenue-growth/referrals", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getRevenueGrowthViral() {
  return apiClient.requestData<{ viral: ViralLoop }>("/revenue-growth/viral", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getRevenueGrowthPricing() {
  return apiClient.requestData<{ best_variant: PricingExperiment; experiments: PricingExperiment[] }>(
    "/revenue-growth/pricing",
    {
      priority: "low",
      cacheTtlMs: 20_000,
    },
  );
}

export function getRevenueGrowthSalesAi() {
  return apiClient.requestData<{ actions: SalesAiAction[] }>("/revenue-growth/sales-ai", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getRevenueGrowthWaitlist() {
  return apiClient.requestData<{ waitlist: WaitlistSignal }>("/revenue-growth/waitlist", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function getRevenueGrowthAuthority() {
  return apiClient.requestData<{ signals: AuthoritySignal[]; trust_score: number }>("/revenue-growth/authority", {
    priority: "low",
    cacheTtlMs: 20_000,
  });
}

export function runRevenueGrowthPricingTest(variant?: string) {
  return apiClient.requestData<RevenueGrowthMutationResponse>("/revenue-growth/run-pricing-test", {
    method: "POST",
    body: { variant },
    priority: "high",
  });
}

export function createRevenueGrowthLead() {
  return apiClient.requestData<RevenueGrowthMutationResponse>("/revenue-growth/create-lead", {
    method: "POST",
    body: {
      company_name: "Atlas Airport Authority",
      contact_name: "Nora Hale",
      email: "nora@atlasairport.example",
      expected_value: 168_000,
      source: "demo_request",
    },
    priority: "high",
  });
}

export function launchRevenueReferralCampaign() {
  return apiClient.requestData<RevenueGrowthMutationResponse>("/revenue-growth/launch-referral-campaign", {
    method: "POST",
    body: { campaign: "executive_referral_sprint" },
    priority: "high",
  });
}

export function runRevenueGrowthSimulation() {
  return apiClient.requestData<RevenueGrowthMutationResponse>("/revenue-growth/run-growth-simulation", {
    method: "POST",
    body: { scenario: "boardroom_viral_loop" },
    priority: "high",
  });
}
