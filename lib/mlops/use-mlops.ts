"use client";

import { useEffect, useState } from "react";

import {
  getLiveMLOpsModels,
  getMLOpsDeployments,
  getMLOpsDrift,
  getMLOpsMonitoring,
  getMLOpsSummary,
  promoteMLOpsModel,
  rollbackMLOpsModel,
  runMLOpsPrediction,
  setMLOpsCanary,
  triggerMLOpsRetrain,
} from "@/lib/mlops/api";
import { fallbackDeployments, fallbackDrift, fallbackLiveModels, fallbackMonitoring, fallbackSummary } from "@/lib/mlops/runtime";
import type { DriftSignal, LiveModel, MLOpsMonitoring, MLOpsSummary, ModelDeployment } from "@/lib/mlops/types";

type MLOpsState = {
  summary: MLOpsSummary;
  liveModels: LiveModel[];
  deployments: ModelDeployment[];
  drift: DriftSignal[];
  monitoring: MLOpsMonitoring;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: MLOpsState = {
  summary: fallbackSummary,
  liveModels: fallbackLiveModels,
  deployments: fallbackDeployments,
  drift: fallbackDrift,
  monitoring: fallbackMonitoring,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: MLOpsState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshMLOps() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, liveModels, deployments, drift, monitoring] = await Promise.all([getMLOpsSummary(), getLiveMLOpsModels(), getMLOpsDeployments(), getMLOpsDrift(), getMLOpsMonitoring()]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        liveModels: liveModels.items,
        deployments: deployments.items,
        drift: drift.items,
        monitoring: monitoring.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "MLOps production layer is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withMLOpsAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "MLOps action complete" };
    notify();
    await refreshMLOps();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "MLOps action could not be completed",
    };
    notify();
  }
}

export function useMLOps() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshMLOps();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshMLOps,
    predict: (scenario?: string) => withMLOpsAction("predict", () => runMLOpsPrediction(scenario)),
    promote: (modelId?: string) => withMLOpsAction("promote", () => promoteMLOpsModel(modelId)),
    canary: (modelId?: string, percent?: number) => withMLOpsAction("canary", () => setMLOpsCanary(modelId, percent)),
    rollback: (modelId?: string) => withMLOpsAction("rollback", () => rollbackMLOpsModel(modelId)),
    retrain: (domain?: string) => withMLOpsAction("retrain", () => triggerMLOpsRetrain(domain)),
  };
}

