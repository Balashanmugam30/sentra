"use client";

import { useEffect, useState } from "react";

import {
  fallbackCrowdSnapshot,
  fallbackEvacuationSnapshot,
  getCrowdCommand,
  getEvacuationCenter,
  recomputeCrowdRoutes,
  runCrowdSimulation,
  type CrowdSnapshot,
  type EvacuationSnapshot,
} from "@/lib/behavior/crowd";

type CrowdState = {
  crowd: CrowdSnapshot;
  evacuation: EvacuationSnapshot;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: CrowdState = {
  crowd: fallbackCrowdSnapshot,
  evacuation: fallbackEvacuationSnapshot,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: CrowdState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshCrowd() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();

  refreshInFlight = (async () => {
    try {
      const [crowd, evacuation] = await Promise.all([getCrowdCommand(), getEvacuationCenter()]);
      sharedState = {
        ...sharedState,
        crowd: crowd.data,
        evacuation: evacuation.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Crowd intelligence is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

async function withCrowdAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Crowd action complete" };
    notify();
    await refreshCrowd();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Crowd action could not be completed",
    };
    notify();
  }
}

export function useCrowd() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshCrowd();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshCrowd,
    runSimulation: (scenario?: string) => withCrowdAction("simulate", () => runCrowdSimulation(scenario)),
    recomputeRoutes: (avoidZone?: string) => withCrowdAction("recompute", () => recomputeCrowdRoutes(avoidZone)),
  };
}
