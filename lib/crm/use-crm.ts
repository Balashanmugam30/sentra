"use client";

import { useEffect, useState } from "react";

import {
  bookCrmDemo,
  createCrmDeal,
  createCrmLead,
  getCrmActivities,
  getCrmDeals,
  getCrmDemos,
  getCrmForecast,
  getCrmLeads,
  getCrmMetrics,
  getCrmScoring,
  logCrmActivity,
  moveCrmDealStage,
} from "@/lib/crm/api";
import type {
  ActivitiesResponse,
  ActivityLogPayload,
  CrmForecast,
  DealCreatePayload,
  DealStage,
  DealsResponse,
  DemoBookPayload,
  DemosResponse,
  GrowthMetrics,
  LeadCreatePayload,
  LeadScoringResponse,
  LeadsResponse,
} from "@/lib/crm/types";

type CrmState = {
  leads: LeadsResponse | null;
  deals: DealsResponse | null;
  activities: ActivitiesResponse | null;
  demos: DemosResponse | null;
  forecast: CrmForecast | null;
  scoring: LeadScoringResponse | null;
  metrics: GrowthMetrics | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: CrmState = {
  leads: null,
  deals: null,
  activities: null,
  demos: null,
  forecast: null,
  scoring: null,
  metrics: null,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: CrmState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshCrm() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();

  refreshInFlight = (async () => {
    try {
      const [leads, deals, activities, demos, forecast, scoring, metrics] = await Promise.all([
        getCrmLeads(),
        getCrmDeals(),
        getCrmActivities(),
        getCrmDemos(),
        getCrmForecast(),
        getCrmScoring(),
        getCrmMetrics(),
      ]);
      sharedState = {
        ...sharedState,
        leads,
        deals,
        activities,
        demos,
        forecast,
        scoring,
        metrics,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "CRM revenue engine is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

async function withCrmAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: label };
    notify();
    await refreshCrm();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "CRM action failed",
    };
    notify();
  }
}

export function useCrm() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshCrm();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshCrm,
    createLead: (payload: LeadCreatePayload) => withCrmAction("lead-create", () => createCrmLead(payload)),
    createDeal: (payload: DealCreatePayload) => withCrmAction("deal-create", () => createCrmDeal(payload)),
    moveDealStage: (dealId: string, stage: DealStage) =>
      withCrmAction(`deal-stage-${dealId}`, () => moveCrmDealStage(dealId, stage)),
    logActivity: (payload: ActivityLogPayload) =>
      withCrmAction("activity-log", () => logCrmActivity(payload)),
    bookDemo: (payload: DemoBookPayload) => withCrmAction("demo-book", () => bookCrmDemo(payload)),
  };
}
