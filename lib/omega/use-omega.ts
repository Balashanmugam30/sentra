"use client";

import { useEffect, useState } from "react";

import {
  changeOmegaMode,
  getOmegaAiEvolution,
  getOmegaAiExplain,
  getOmegaAiGovernance,
  getOmegaAiLive,
  getOmegaAiMemory,
  getOmegaAiObjectives,
  getOmegaAiTrust,
  getOmegaCivilization,
  getOmegaClimate,
  getOmegaEconomy,
  getOmegaEnergy,
  getOmegaFuture,
  getOmegaLive,
  getOmegaLogistics,
  getOmegaMigration,
  getOmegaPandemic,
  getOmegaPlanetary,
  getOmegaSatellite,
  getOmegaThreats,
  getOmegaWater,
  runOmegaImprovementCycle,
  runOmegaPlanetaryDemo,
  runOmegaSelfHeal,
  runOmegaSimulation,
  setOmegaObjective,
} from "@/lib/omega/api";
import type { OmegaLive } from "@/lib/omega/types";

type OmegaState = {
  aiLive: Record<string, unknown> | null;
  busyAction: string | null;
  civilization: Record<string, unknown> | null;
  climate: Record<string, unknown> | null;
  economy: Record<string, unknown> | null;
  energy: Record<string, unknown> | null;
  error: string | null;
  evolution: Record<string, unknown> | null;
  explain: Record<string, unknown> | null;
  future: Record<string, unknown> | null;
  governance: Record<string, unknown> | null;
  live: OmegaLive | null;
  loading: boolean;
  logistics: Record<string, unknown> | null;
  memory: Record<string, unknown> | null;
  migration: Record<string, unknown> | null;
  objectives: Record<string, unknown> | null;
  pandemic: Record<string, unknown> | null;
  planetary: Record<string, unknown> | null;
  satellite: Record<string, unknown> | null;
  threats: Record<string, unknown> | null;
  trust: Record<string, unknown> | null;
  water: Record<string, unknown> | null;
};

const initialState: OmegaState = {
  aiLive: null,
  busyAction: null,
  civilization: null,
  climate: null,
  economy: null,
  energy: null,
  error: null,
  evolution: null,
  explain: null,
  future: null,
  governance: null,
  live: null,
  loading: true,
  logistics: null,
  memory: null,
  migration: null,
  objectives: null,
  pandemic: null,
  planetary: null,
  satellite: null,
  threats: null,
  trust: null,
  water: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: OmegaState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshOmega() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [
        live,
        planetary,
        threats,
        climate,
        pandemic,
        economy,
        logistics,
        energy,
        water,
        migration,
        future,
        civilization,
        satellite,
        aiLive,
        objectives,
        memory,
        trust,
        explain,
        evolution,
        governance,
      ] = await Promise.all([
        getOmegaLive(),
        getOmegaPlanetary(),
        getOmegaThreats(),
        getOmegaClimate(),
        getOmegaPandemic(),
        getOmegaEconomy(),
        getOmegaLogistics(),
        getOmegaEnergy(),
        getOmegaWater(),
        getOmegaMigration(),
        getOmegaFuture(),
        getOmegaCivilization(),
        getOmegaSatellite(),
        getOmegaAiLive(),
        getOmegaAiObjectives(),
        getOmegaAiMemory(),
        getOmegaAiTrust(),
        getOmegaAiExplain(),
        getOmegaAiEvolution(),
        getOmegaAiGovernance(),
      ]);

      sharedState = {
        ...sharedState,
        aiLive: aiLive.data,
        civilization: civilization.data,
        climate: climate.data,
        economy: economy.data,
        energy: energy.data,
        error: null,
        evolution: evolution.data,
        explain: explain.data,
        future: future.data,
        governance: governance.data,
        live,
        loading: false,
        logistics: logistics.data,
        memory: memory.data,
        migration: migration.data,
        objectives: objectives.data,
        pandemic: pandemic.data,
        planetary: planetary.data,
        satellite: satellite.data,
        threats: threats.data,
        trust: trust.data,
        water: water.data,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        error: error instanceof Error ? error.message : "Omega OS is reconnecting",
        loading: false,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withOmegaAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshOmega();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Omega command action failed",
    };
    notify();
  }
}

export function useOmega() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshOmega();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    changeMode: (mode: string) => withOmegaAction(`mode-${mode}`, () => changeOmegaMode(mode)),
    refresh: refreshOmega,
    runImprovementCycle: () => withOmegaAction("improvement-cycle", runOmegaImprovementCycle),
    runPlanetaryDemo: () => withOmegaAction("planetary-demo", runOmegaPlanetaryDemo),
    runSelfHeal: () => withOmegaAction("self-heal", runOmegaSelfHeal),
    runSimulation: () => withOmegaAction("simulation", runOmegaSimulation),
    setObjective: (objective: string) => withOmegaAction(`objective-${objective}`, () => setOmegaObjective(objective)),
  };
}

