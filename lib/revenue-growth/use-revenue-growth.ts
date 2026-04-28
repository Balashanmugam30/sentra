"use client";

import { useEffect, useState } from "react";

import {
  createRevenueGrowthLead,
  getRevenueGrowthAuthority,
  getRevenueGrowthConversion,
  getRevenueGrowthFunnel,
  getRevenueGrowthLeadSources,
  getRevenueGrowthLive,
  getRevenueGrowthPricing,
  getRevenueGrowthReferrals,
  getRevenueGrowthSalesAi,
  getRevenueGrowthViral,
  getRevenueGrowthWaitlist,
  launchRevenueReferralCampaign,
  runRevenueGrowthPricingTest,
  runRevenueGrowthSimulation,
} from "@/lib/revenue-growth/api";
import type {
  AuthoritySignal,
  ConversionMetric,
  DemoConversion,
  FunnelStage,
  LeadSource,
  PricingExperiment,
  ReferralProgram,
  RevenueGrowthLive,
  SalesAiAction,
  ViralLoop,
  WaitlistSignal,
} from "@/lib/revenue-growth/types";

type RevenueGrowthState = {
  authoritySignals: AuthoritySignal[];
  bestPricingVariant: PricingExperiment | null;
  busyAction: string | null;
  conversionMetrics: ConversionMetric[];
  demoToPaid: DemoConversion | null;
  error: string | null;
  funnel: FunnelStage[];
  leadSources: LeadSource[];
  live: RevenueGrowthLive | null;
  loading: boolean;
  pricingExperiments: PricingExperiment[];
  referralPrograms: ReferralProgram[];
  salesActions: SalesAiAction[];
  trustScore: number;
  viral: ViralLoop | null;
  waitlist: WaitlistSignal | null;
};

const initialState: RevenueGrowthState = {
  authoritySignals: [],
  bestPricingVariant: null,
  busyAction: null,
  conversionMetrics: [],
  demoToPaid: null,
  error: null,
  funnel: [],
  leadSources: [],
  live: null,
  loading: true,
  pricingExperiments: [],
  referralPrograms: [],
  salesActions: [],
  trustScore: 0,
  viral: null,
  waitlist: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: RevenueGrowthState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshRevenueGrowth() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, funnel, leadSources, conversion, referrals, viral, pricing, salesAi, waitlist, authority] =
        await Promise.all([
          getRevenueGrowthLive(),
          getRevenueGrowthFunnel(),
          getRevenueGrowthLeadSources(),
          getRevenueGrowthConversion(),
          getRevenueGrowthReferrals(),
          getRevenueGrowthViral(),
          getRevenueGrowthPricing(),
          getRevenueGrowthSalesAi(),
          getRevenueGrowthWaitlist(),
          getRevenueGrowthAuthority(),
        ]);
      const mergedActions = [...salesAi.actions, ...conversion.recommendations]
        .filter((action, index, actions) => actions.findIndex((candidate) => candidate.action_id === action.action_id) === index)
        .sort((a, b) => b.expected_revenue - a.expected_revenue);
      sharedState = {
        ...sharedState,
        authoritySignals: authority.signals,
        bestPricingVariant: pricing.best_variant,
        conversionMetrics: conversion.metrics,
        demoToPaid: conversion.demo_to_paid,
        error: null,
        funnel: funnel.funnel,
        leadSources: leadSources.sources,
        live,
        loading: false,
        pricingExperiments: pricing.experiments,
        referralPrograms: referrals.programs,
        salesActions: mergedActions,
        trustScore: authority.trust_score,
        viral: viral.viral,
        waitlist: waitlist.waitlist,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Revenue growth engine is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withRevenueGrowthAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshRevenueGrowth();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Revenue growth action failed",
    };
    notify();
  }
}

export function useRevenueGrowth() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshRevenueGrowth();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    createLead: () => withRevenueGrowthAction("lead", createRevenueGrowthLead),
    launchReferralCampaign: () => withRevenueGrowthAction("referral", launchRevenueReferralCampaign),
    refresh: refreshRevenueGrowth,
    runGrowthSimulation: () => withRevenueGrowthAction("simulation", runRevenueGrowthSimulation),
    runPricingTest: () => withRevenueGrowthAction("pricing", () => runRevenueGrowthPricingTest(state.bestPricingVariant?.experiment_id)),
  };
}
