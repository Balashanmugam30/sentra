"use client";

import { useEffect, useState } from "react";

import {
  createChannelBrand,
  getChannelCertifications,
  getChannelCountries,
  getChannelOem,
  getChannelPartners,
  getChannelPipeline,
  getChannelPricing,
  getChannelResellers,
  getChannelRevenue,
  getChannelSummary,
  getChannelWhitelabel,
  launchChannelCountry,
  payChannelCommission,
  updateChannelPipeline,
  upgradeChannelPartner,
} from "@/lib/channel/api";
import {
  fallbackCertifications,
  fallbackCountries,
  fallbackOem,
  fallbackPartners,
  fallbackPipeline,
  fallbackPricing,
  fallbackResellers,
  fallbackRevenue,
  fallbackSummary,
  fallbackWhitelabel,
} from "@/lib/channel/runtime";
import type { ChannelState } from "@/lib/channel/types";

const initialState: ChannelState = {
  summary: fallbackSummary,
  partners: fallbackPartners,
  resellers: fallbackResellers,
  whitelabel: fallbackWhitelabel,
  oem: fallbackOem,
  countries: fallbackCountries,
  revenue: fallbackRevenue,
  pipeline: fallbackPipeline,
  certifications: fallbackCertifications,
  pricing: fallbackPricing,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: ChannelState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshChannel() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, partners, resellers, whitelabel, oem, countries, revenue, pipeline, certifications, pricing] = await Promise.all([
        getChannelSummary(),
        getChannelPartners(),
        getChannelResellers(),
        getChannelWhitelabel(),
        getChannelOem(),
        getChannelCountries(),
        getChannelRevenue(),
        getChannelPipeline(),
        getChannelCertifications(),
        getChannelPricing(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        partners: partners.data,
        resellers: resellers.data,
        whitelabel: whitelabel.data,
        oem: oem.data,
        countries: countries.data,
        revenue: revenue.data,
        pipeline: pipeline.data,
        certifications: certifications.data,
        pricing: pricing.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Channel OS is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withChannelAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? label };
    notify();
    await refreshChannel();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Channel action failed",
    };
    notify();
  }
}

export function useChannel() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshChannel();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshChannel,
    launchCountry: (country?: string) => withChannelAction(`launch-${country ?? "UAE"}`, () => launchChannelCountry(country)),
    createBrand: (name?: string) => withChannelAction("create-brand", () => createChannelBrand(name)),
    upgradePartner: (partnerId: string) => withChannelAction(`upgrade-${partnerId}`, () => upgradeChannelPartner(partnerId)),
    payCommission: (commissionId: string) => withChannelAction(`commission-${commissionId}`, () => payChannelCommission(commissionId)),
    updatePipeline: (pipelineId: string) => withChannelAction(`pipeline-${pipelineId}`, () => updateChannelPipeline(pipelineId)),
  };
}

