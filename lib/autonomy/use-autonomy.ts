"use client";

import { useEffect, useState } from "react";

import {
  getAutonomyBranches,
  getAutonomyExplain,
  getAutonomyGovernance,
  getAutonomyHealth,
  getAutonomyLearning,
  getAutonomyLive,
  getAutonomyMemory,
  getAutonomyObjectives,
  getAutonomyPlan,
  getAutonomyPredict,
  getAutonomyTrust,
  runAutonomyHeal,
  runAutonomyLearningCycle,
  setAutonomyMode,
  setAutonomyObjective,
} from "@/lib/autonomy/api";
import type { AutonomyLiveResponse, AutonomyMode } from "@/lib/autonomy/types";

type AutonomyState = {
  live: AutonomyLiveResponse | null;
  memory: Record<string, unknown> | null;
  objectives: Record<string, unknown> | null;
  plan: Record<string, unknown> | null;
  predict: Record<string, unknown> | null;
  learning: Record<string, unknown> | null;
  trust: Record<string, unknown> | null;
  health: Record<string, unknown> | null;
  governance: Record<string, unknown> | null;
  explain: Record<string, unknown> | null;
  branches: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: AutonomyState = {
  live: null,
  memory: null,
  objectives: null,
  plan: null,
  predict: null,
  learning: null,
  trust: null,
  health: null,
  governance: null,
  explain: null,
  branches: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: AutonomyState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshAutonomy() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, memory, objectives, plan, predict, learning, trust, health, governance, explain, branches] =
        await Promise.all([
          getAutonomyLive(),
          getAutonomyMemory(),
          getAutonomyObjectives(),
          getAutonomyPlan(),
          getAutonomyPredict(),
          getAutonomyLearning(),
          getAutonomyTrust(),
          getAutonomyHealth(),
          getAutonomyGovernance(),
          getAutonomyExplain(),
          getAutonomyBranches(),
        ]);

      sharedState = {
        ...sharedState,
        live,
        memory: memory.data,
        objectives: objectives.data,
        plan: plan.data,
        predict: predict.data,
        learning: learning.data,
        trust: trust.data,
        health: health.data,
        governance: governance.data,
        explain: explain.data,
        branches: branches.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Autonomy OS is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withAutonomyAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshAutonomy();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Autonomy action failed",
    };
    notify();
  }
}

export function useAutonomy() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshAutonomy();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshAutonomy,
    setObjective: (objective: string) =>
      withAutonomyAction(`objective-${objective}`, () => setAutonomyObjective(objective)),
    runLearningCycle: () => withAutonomyAction("learning", runAutonomyLearningCycle),
    runHeal: () => withAutonomyAction("heal", runAutonomyHeal),
    setMode: (mode: AutonomyMode) => withAutonomyAction(`mode-${mode}`, () => setAutonomyMode(mode)),
  };
}

