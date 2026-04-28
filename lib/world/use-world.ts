"use client";

import { useEffect, useState } from "react";

import {
  getWorldClimate,
  getWorldContinuity,
  getWorldCountries,
  getWorldDiplomacy,
  getWorldEconomy,
  getWorldLive,
  getWorldPandemic,
  getWorldSpace,
  getWorldSupplyChain,
  getWorldSupremacy,
  getWorldThreats,
  resetWorldGrid,
  runWorldDemo,
  runWorldGlobalSimulation,
} from "@/lib/world/api";
import type { WorldLiveResponse } from "@/lib/world/types";

type WorldState = {
  live: WorldLiveResponse | null;
  threats: Record<string, unknown> | null;
  countries: Record<string, unknown> | null;
  economy: Record<string, unknown> | null;
  supplyChain: Record<string, unknown> | null;
  climate: Record<string, unknown> | null;
  pandemic: Record<string, unknown> | null;
  space: Record<string, unknown> | null;
  diplomacy: Record<string, unknown> | null;
  continuity: Record<string, unknown> | null;
  supremacy: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: WorldState = {
  live: null,
  threats: null,
  countries: null,
  economy: null,
  supplyChain: null,
  climate: null,
  pandemic: null,
  space: null,
  diplomacy: null,
  continuity: null,
  supremacy: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: WorldState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshWorld() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, threats, countries, economy, supplyChain, climate, pandemic, space, diplomacy, continuity, supremacy] =
        await Promise.all([
          getWorldLive(),
          getWorldThreats(),
          getWorldCountries(),
          getWorldEconomy(),
          getWorldSupplyChain(),
          getWorldClimate(),
          getWorldPandemic(),
          getWorldSpace(),
          getWorldDiplomacy(),
          getWorldContinuity(),
          getWorldSupremacy(),
        ]);

      sharedState = {
        ...sharedState,
        live,
        threats: threats.data,
        countries: countries.data,
        economy: economy.data,
        supplyChain: supplyChain.data,
        climate: climate.data,
        pandemic: pandemic.data,
        space: space.data,
        diplomacy: diplomacy.data,
        continuity: continuity.data,
        supremacy: supremacy.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "World Command Grid is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withWorldAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshWorld();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "World command action failed",
    };
    notify();
  }
}

export function useWorld() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshWorld();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshWorld,
    runGlobalSimulation: (scenario = "multi-vector civilization shock") =>
      withWorldAction(`simulation-${scenario}`, () => runWorldGlobalSimulation(scenario)),
    runDemo: () => withWorldAction("demo", runWorldDemo),
    reset: () => withWorldAction("reset", resetWorldGrid),
  };
}

