"use client";

import { useEffect, useState } from "react";

import {
  expandSuccessAccount,
  getSuccessChurn,
  getSuccessCopilot,
  getSuccessExpansion,
  getSuccessHealth,
  getSuccessLive,
  getSuccessMetrics,
  getSuccessOnboarding,
  getSuccessRenewals,
  getSuccessSupport,
  runSuccessQbr,
  saveSuccessAccount,
  seedSuccessDemo,
  testSuccessRisk,
} from "@/lib/customer-success/api";
import type {
  ChurnResponse,
  CopilotResponse,
  ExpansionResponse,
  HealthResponse,
  OnboardingResponse,
  RenewalsResponse,
  SuccessLiveResponse,
  SuccessMetricsResponse,
  SupportResponse,
} from "@/lib/customer-success/types";

type CustomerSuccessState = {
  live: SuccessLiveResponse | null;
  health: HealthResponse | null;
  churn: ChurnResponse | null;
  renewals: RenewalsResponse | null;
  expansion: ExpansionResponse | null;
  onboarding: OnboardingResponse | null;
  support: SupportResponse | null;
  metrics: SuccessMetricsResponse | null;
  copilot: CopilotResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: CustomerSuccessState = {
  live: null,
  health: null,
  churn: null,
  renewals: null,
  expansion: null,
  onboarding: null,
  support: null,
  metrics: null,
  copilot: null,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: CustomerSuccessState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshCustomerSuccess() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();

  refreshInFlight = (async () => {
    try {
      const [live, health, churn, renewals, expansion, onboarding, support, metrics, copilot] =
        await Promise.all([
          getSuccessLive(),
          getSuccessHealth(),
          getSuccessChurn(),
          getSuccessRenewals(),
          getSuccessExpansion(),
          getSuccessOnboarding(),
          getSuccessSupport(),
          getSuccessMetrics(),
          getSuccessCopilot(),
        ]);
      sharedState = {
        ...sharedState,
        live,
        health,
        churn,
        renewals,
        expansion,
        onboarding,
        support,
        metrics,
        copilot,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Customer success intelligence is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

async function withSuccessAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: label };
    notify();
    await refreshCustomerSuccess();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Customer success action failed",
    };
    notify();
  }
}

export function useCustomerSuccess() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshCustomerSuccess();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshCustomerSuccess,
    testRisk: (tenantId?: string, scenario?: string) =>
      withSuccessAction("test-risk", () => testSuccessRisk(tenantId, scenario)),
    saveAccount: (tenantId?: string) => withSuccessAction("save-account", () => saveSuccessAccount(tenantId)),
    expandAccount: (tenantId?: string) =>
      withSuccessAction("expand-account", () => expandSuccessAccount(tenantId)),
    runQbr: (tenantId?: string) => withSuccessAction("run-qbr", () => runSuccessQbr(tenantId)),
    seedDemo: () => withSuccessAction("seed-demo", seedSuccessDemo),
  };
}
