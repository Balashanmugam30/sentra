"use client";

import { useEffect, useState } from "react";

import {
  compareTwinStrategies,
  computeTwinRoute,
  getTwinCampus,
  getTwinFacility,
  getTwinForecast,
  getTwinLive,
  getTwinLiveRoutes,
  getTwinPredictive,
  getTwinReplay,
  getTwinReplayIntelligence,
  getTwinResources,
  getTwinScenarios,
  getTwinTelemetry,
  loadTwinReplay,
  rebalanceTwinResources,
  simulateTwinScenario,
} from "@/lib/twin/api";
import {
  fallbackCampus,
  fallbackCompare,
  fallbackFacility,
  fallbackForecast,
  fallbackLive,
  fallbackLiveRoutes,
  fallbackPredictive,
  fallbackReplay,
  fallbackReplayIntelligence,
  fallbackResources,
  fallbackScenarios,
  fallbackTelemetry,
} from "@/lib/twin/runtime";
import type { TwinCampusState, TwinCompareState, TwinFacilityState, TwinForecast, TwinLive, TwinLiveRoutes, TwinPredictiveState, TwinReplayIntelligence, TwinReplayState, TwinResourcesState, TwinScenario, TwinTelemetry } from "@/lib/twin/types";

type TwinState = {
  live: TwinLive;
  facility: TwinFacilityState;
  replay: TwinReplayState;
  telemetry: TwinTelemetry;
  scenarios: TwinScenario[];
  predictive: TwinPredictiveState;
  forecast: TwinForecast;
  liveRoutes: TwinLiveRoutes;
  resources: TwinResourcesState;
  campus: TwinCampusState;
  compare: TwinCompareState;
  replayIntelligence: TwinReplayIntelligence;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: TwinState = {
  live: fallbackLive,
  facility: fallbackFacility,
  replay: fallbackReplay,
  telemetry: fallbackTelemetry,
  scenarios: fallbackScenarios,
  predictive: fallbackPredictive,
  forecast: fallbackForecast,
  liveRoutes: fallbackLiveRoutes,
  resources: fallbackResources,
  campus: fallbackCampus,
  compare: fallbackCompare,
  replayIntelligence: fallbackReplayIntelligence,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: TwinState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshTwin() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, facility, replay, telemetry, scenarios, predictive, forecast, liveRoutes, resources, campus, compare, replayIntelligence] = await Promise.all([
        getTwinLive(),
        getTwinFacility(),
        getTwinReplay(),
        getTwinTelemetry(),
        getTwinScenarios(),
        getTwinPredictive(),
        getTwinForecast(),
        getTwinLiveRoutes(),
        getTwinResources(),
        getTwinCampus(),
        compareTwinStrategies(),
        getTwinReplayIntelligence(),
      ]);
      sharedState = {
        ...sharedState,
        live: live.data,
        facility: facility.data,
        replay: replay.data,
        telemetry: telemetry.data,
        scenarios: scenarios.items,
        predictive: predictive.data,
        forecast: forecast.data,
        liveRoutes: liveRoutes.data,
        resources: resources.data,
        campus: campus.data,
        compare: compare.data,
        replayIntelligence: replayIntelligence.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Digital twin core is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withTwinAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Digital twin action complete" };
    notify();
    await refreshTwin();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Digital twin action could not be completed",
    };
    notify();
  }
}

export function useTwin() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshTwin();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshTwin,
    loadReplay: (replayId?: string) => withTwinAction("load-replay", () => loadTwinReplay(replayId)),
    simulate: (scenarioId?: string) => withTwinAction("simulate", () => simulateTwinScenario(scenarioId)),
    computeRoute: (useCase?: string) => withTwinAction("compute-route", () => computeTwinRoute(useCase)),
    rebalanceResources: () => withTwinAction("rebalance-resources", rebalanceTwinResources),
    compareStrategies: () => withTwinAction("compare-strategies", compareTwinStrategies),
  };
}
