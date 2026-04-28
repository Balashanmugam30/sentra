"use client";

import { useEffect, useState } from "react";

import {
  createGrowthEnterpriseDeal,
  createGrowthFranchise,
  expandGrowthCustomer,
  getGrowthContracts,
  getGrowthCountries,
  getGrowthCustomers,
  getGrowthDeals,
  getGrowthExpansionAi,
  getGrowthForecast,
  getGrowthFunnelAnalytics,
  getGrowthLeads,
  getGrowthLive,
  getGrowthPartners,
  getGrowthPipeline,
  getGrowthPricing,
  getGrowthRegions,
  getGrowthRenewals,
  getGrowthSummary,
  getGrowthTerritories,
  getGrowthWhiteLabel,
  launchGrowthCountry,
  runGrowthSimulation,
  saveGrowthCustomer,
  updateGrowthDeal,
} from "@/lib/growth/api";
import type {
  CustomerHealth,
  ExpansionOpportunity,
  ExpansionRecommendation,
  FunnelAnalytics,
  GrowthContract,
  GrowthCountry,
  GrowthLiveResponse,
  GrowthPartner,
  GrowthPricing,
  GrowthRegion,
  GtmSummary,
  LeadScore,
  RenewalSignal,
  RepPerformance,
  SalesDeal,
  GrowthTerritory,
  WhiteLabelProgram,
} from "@/lib/growth/types";

const LOCAL_GTM_TIMESTAMP = "2026-04-26T00:00:00.000Z";
const LOCAL_CLOSE_DATE = "2026-05-23T00:00:00.000Z";

type GrowthState = {
  summary: GtmSummary;
  deals: SalesDeal[];
  leads: LeadScore[];
  funnel: FunnelAnalytics;
  customers: CustomerHealth[];
  renewals: RenewalSignal[];
  expansions: ExpansionOpportunity[];
  reps: RepPerformance[];
  live: GrowthLiveResponse | null;
  regions: GrowthRegion[];
  countries: GrowthCountry[];
  territories: GrowthTerritory[];
  partners: GrowthPartner[];
  contracts: GrowthContract[];
  pricing: GrowthPricing[];
  forecast: Record<string, unknown> | null;
  pipeline: Record<string, unknown> | null;
  programs: WhiteLabelProgram[];
  recommendations: ExpansionRecommendation[];
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: GrowthState = {
  summary: {
    generated_at: LOCAL_GTM_TIMESTAMP,
    pipeline_value: 1_292_000,
    weighted_forecast: 708_000,
    visitors: 142_000,
    leads: 8_245,
    demos_booked_percent: 18.4,
    sql_percent: 31.8,
    close_percent: 21.6,
    cac: 118,
    cpl: 14,
    viral_coefficient: 1.34,
    renewal_pipeline: 435_680,
    expansion_pipeline: 292_000,
    churn_risk_accounts: 1,
    customer_health_score: 81,
    quarter_forecast: 801_440,
    best_case: 1_160_000,
    worst_case: 453_120,
  },
  deals: [
    { deal_id: "CRM-LOCAL-BALA-UNI", company: "Bala University", arr_value: 184_000, owner: "Avery Chen", stage: "Security Review", probability: 72, next_step: "Complete SSO and campus privacy review", risk_flags: ["procurement committee", "privacy review"], expected_close_date: LOCAL_CLOSE_DATE, source: "founder network", industry: "Higher Education", notes: ["Chancellor wants campus-wide evacuation proof."] },
    { deal_id: "CRM-LOCAL-METROCARE", company: "MetroCare Hospital", arr_value: 260_000, owner: "Nora Hale", stage: "Proposal", probability: 68, next_step: "Send ICU continuity proposal", risk_flags: ["clinical workflow validation"], expected_close_date: LOCAL_CLOSE_DATE, source: "inbound form", industry: "Healthcare", notes: ["CIO engaged after oxygen leak demo."] },
    { deal_id: "CRM-LOCAL-GOVSOUTH", company: "GovSecure South", arr_value: 420_000, owner: "Iris Park", stage: "Discovery", probability: 42, next_step: "Map sovereign hosting path", risk_flags: ["RFP timing", "compliance"], expected_close_date: LOCAL_CLOSE_DATE, source: "government RFP", industry: "Government", notes: ["National readiness score resonated."] },
  ],
  leads: [
    { lead_id: "LEAD-LOCAL-METROCARE", company: "MetroCare Hospital", source: "inbound form", industry: "Healthcare", company_size: 93, urgency: 96, industry_fit: 95, budget_signal: 81, geography: "USA", engagement_score: 86, security_need: 97, buying_intent: 84, ai_score: 90, recommended_action: "Route to founder-led executive demo within 24 hours." },
    { lead_id: "LEAD-LOCAL-BALA", company: "Bala University", source: "founder network", industry: "Higher Education", company_size: 88, urgency: 91, industry_fit: 94, budget_signal: 78, geography: "India", engagement_score: 89, security_need: 92, buying_intent: 87, ai_score: 88, recommended_action: "Route to founder-led executive demo within 24 hours." },
  ],
  funnel: {
    stages: [
      { stage: "Visitors", count: 142_000, conversion_rate: 100, dropoff_rate: 0, revenue_value: 0 },
      { stage: "Leads", count: 8_240, conversion_rate: 5.8, dropoff_rate: 94.2, revenue_value: 1_900_000 },
      { stage: "SQL", count: 1_012, conversion_rate: 31.8, dropoff_rate: 68.2, revenue_value: 990_000 },
      { stage: "Demo", count: 186, conversion_rate: 18.4, dropoff_rate: 81.6, revenue_value: 720_000 },
      { stage: "Won", count: 18, conversion_rate: 21.6, dropoff_rate: 78.4, revenue_value: 418_000 },
    ],
    channels: [
      { source: "referral", visitors: 12_800, leads: 1_180, cpl: 6, cac: 72, close_rate: 31, roi: 12.6, pipeline_value: 420_000 },
      { source: "government RFP", visitors: 910, leads: 88, cpl: 44, cac: 410, close_rate: 11.4, roi: 18.2, pipeline_value: 1_200_000 },
    ],
    referral_engine: { referrals_sent: 1_240, accepted: 386, revenue_generated: 96_000, viral_coefficient: 1.34, best_ambassador: "Grand Meridian Hotel" },
    leaks: ["Demo to proposal conversion needs stronger security ROI proof.", "LinkedIn outbound CAC is elevated."],
  },
  customers: [
    { customer_id: "CUST-LOCAL-GRAND", customer: "Grand Meridian Hotel", status: "expansion ready", adoption_score: 92, seats_used: 188, seats_purchased: 220, support_tickets: 3, sentiment: "positive", renewal_date: LOCAL_CLOSE_DATE, arr: 85_000, expansion_potential: 96_000, risk_score: 18, nps: 64, csat: 93, next_success_action: "Package IoT expansion with annual commitment uplift." },
    { customer_id: "CUST-LOCAL-NOVA", customer: "Nova Mall Group", status: "at risk", adoption_score: 64, seats_used: 69, seats_purchased: 72, support_tickets: 14, sentiment: "mixed", renewal_date: LOCAL_CLOSE_DATE, arr: 22_800, expansion_potential: 36_000, risk_score: 71, nps: 21, csat: 74, next_success_action: "Launch save playbook and staff enablement sprint." },
  ],
  renewals: [
    { renewal_id: "REN-LOCAL-NOVA", customer: "Nova Mall Group", due_bucket: "due in 30d", renewal_date: LOCAL_CLOSE_DATE, arr: 22_800, risk: "at risk", owner: "Maya Sol", recommended_playbook: "Launch save playbook and adoption recovery sprint." },
  ],
  expansions: [
    { opportunity_id: "EXP-LOCAL-GRAND", customer: "Grand Meridian Hotel", type: "multi-site rollout", potential_arr: 96_000, confidence: 82, trigger: "IoT fleet usage increased 41%", next_action: "Open expansion motion." },
  ],
  reps: [
    { rep: "Avery Chen", pipeline: 280_000, weighted_forecast: 210_000, closed_arr: 72_000, attainment: 92, win_rate: 33.3 },
    { rep: "Nora Hale", pipeline: 570_000, weighted_forecast: 294_000, closed_arr: 0, attainment: 74, win_rate: 0 },
  ],
  live: null,
  regions: [],
  countries: [],
  territories: [],
  partners: [],
  contracts: [],
  pricing: [],
  forecast: null,
  pipeline: null,
  programs: [],
  recommendations: [],
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: GrowthState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshGrowth() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, deals, leads, funnel, customers, renewals, live, regions, countries, territories, partners, contracts, pricing, forecast, pipeline, whiteLabel, expansionAi] =
        await Promise.all([
          getGrowthSummary(),
          getGrowthDeals(),
          getGrowthLeads(),
          getGrowthFunnelAnalytics(),
          getGrowthCustomers(),
          getGrowthRenewals(),
          getGrowthLive(),
          getGrowthRegions(),
          getGrowthCountries(),
          getGrowthTerritories(),
          getGrowthPartners(),
          getGrowthContracts(),
          getGrowthPricing(),
          getGrowthForecast(),
          getGrowthPipeline(),
          getGrowthWhiteLabel(),
          getGrowthExpansionAi(),
        ]);
      sharedState = {
        ...sharedState,
        summary,
        deals: deals.deals,
        leads: leads.leads,
        funnel,
        customers: customers.customers,
        expansions: customers.expansions,
        renewals: renewals.renewals,
        live,
        regions: regions.regions,
        countries: countries.countries,
        territories: territories.territories,
        partners: partners.partners,
        contracts: contracts.contracts,
        pricing: pricing.pricing,
        forecast: forecast.forecast,
        reps: forecast.reps,
        pipeline: pipeline.pipeline,
        programs: whiteLabel.programs,
        recommendations: expansionAi.recommendations,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Global expansion engine is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withGrowthAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshGrowth();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Growth action failed",
    };
    notify();
  }
}

export function useGrowth() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshGrowth();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshGrowth,
    updateDeal: (dealId: string, stage = "Proposal") => withGrowthAction(`deal-${dealId}`, () => updateGrowthDeal(dealId, stage)),
    saveCustomer: (customerId: string) => withGrowthAction(`save-${customerId}`, () => saveGrowthCustomer(customerId)),
    expandCustomer: (customerId: string) => withGrowthAction(`expand-${customerId}`, () => expandGrowthCustomer(customerId)),
    launchCountry: (country = "UAE") => withGrowthAction(`launch-${country}`, () => launchGrowthCountry(country)),
    createEnterpriseDeal: () => withGrowthAction("enterprise-deal", createGrowthEnterpriseDeal),
    createFranchise: () => withGrowthAction("franchise", createGrowthFranchise),
    runSimulation: () => withGrowthAction("simulation", runGrowthSimulation),
  };
}
