"use client";

import { useEffect, useState } from "react";

import {
  activateGovernmentEmergency,
  deployGovernmentUnits,
  generateGovernmentReport,
  getGovernmentBorders,
  getGovernmentContinuity,
  getGovernmentCopilot,
  getGovernmentDefense,
  getGovernmentDisaster,
  getGovernmentInfrastructure,
  getGovernmentLive,
  getGovernmentReadiness,
  getGovernmentWarGame,
  runGovernmentSimulation,
} from "@/lib/government/api";
import type { GovernmentLiveResponse } from "@/lib/government/types";

type GovernmentState = {
  live: GovernmentLiveResponse | null;
  readiness: Record<string, unknown> | null;
  disaster: Record<string, unknown> | null;
  defense: Record<string, unknown> | null;
  borders: Record<string, unknown> | null;
  infrastructure: Record<string, unknown> | null;
  continuity: Record<string, unknown> | null;
  wargame: Record<string, unknown> | null;
  copilot: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: GovernmentState = {
  live: null,
  readiness: null,
  disaster: null,
  defense: null,
  borders: null,
  infrastructure: null,
  continuity: null,
  wargame: null,
  copilot: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: GovernmentState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshGovernment() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, readiness, disaster, defense, borders, infrastructure, continuity, wargame, copilot] =
        await Promise.all([
          getGovernmentLive(),
          getGovernmentReadiness(),
          getGovernmentDisaster(),
          getGovernmentDefense(),
          getGovernmentBorders(),
          getGovernmentInfrastructure(),
          getGovernmentContinuity(),
          getGovernmentWarGame(),
          getGovernmentCopilot(),
        ]);

      sharedState = {
        ...sharedState,
        live,
        readiness: readiness.data,
        disaster: disaster.data,
        defense: defense.data,
        borders: borders.data,
        infrastructure: infrastructure.data,
        continuity: continuity.data,
        wargame: wargame.data,
        copilot: copilot.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Government command OS is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withGovernmentAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshGovernment();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Government action failed",
    };
    notify();
  }
}

export function useGovernment() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshGovernment();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshGovernment,
    runSimulation: (scenario = "Cyclone") =>
      withGovernmentAction(`simulation-${scenario}`, () => runGovernmentSimulation(scenario)),
    activateEmergency: (region = "South Region") =>
      withGovernmentAction("emergency", () => activateGovernmentEmergency(region)),
    deployUnits: (agency = "Military", units = 12, region = "South Region") =>
      withGovernmentAction("deploy", () => deployGovernmentUnits(agency, units, region)),
    generateReport: () => withGovernmentAction("report", generateGovernmentReport),
  };
}
