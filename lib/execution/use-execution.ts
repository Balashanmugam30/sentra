"use client";

import { useEffect, useState } from "react";

import {
  activateExecutionCostMode,
  activateExecutionGrowthMode,
  createExecutionHirePlan,
  createExecutionRaisePlan,
  getExecutionBoard,
  getExecutionCeo,
  getExecutionCfo,
  getExecutionChro,
  getExecutionCiso,
  getExecutionCoo,
  getExecutionCouncil,
  getExecutionCro,
  getExecutionEfficiency,
  getExecutionLive,
  getExecutionProductivity,
  getExecutionScenarios,
  getExecutionSimulate,
  getExecutionWorkflows,
  runExecutionReview,
  runExecutionSimulation,
} from "@/lib/execution/api";
import type { ExecutionLiveResponse } from "@/lib/execution/types";

type ExecutionState = {
  live: ExecutionLiveResponse | null;
  ceo: Record<string, unknown> | null;
  coo: Record<string, unknown> | null;
  cfo: Record<string, unknown> | null;
  cro: Record<string, unknown> | null;
  chro: Record<string, unknown> | null;
  ciso: Record<string, unknown> | null;
  council: Record<string, unknown> | null;
  board: Record<string, unknown> | null;
  scenarios: Record<string, unknown> | null;
  productivity: Record<string, unknown> | null;
  workflows: Record<string, unknown> | null;
  simulate: Record<string, unknown> | null;
  efficiency: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: ExecutionState = {
  live: null,
  ceo: null,
  coo: null,
  cfo: null,
  cro: null,
  chro: null,
  ciso: null,
  council: null,
  board: null,
  scenarios: null,
  productivity: null,
  workflows: null,
  simulate: null,
  efficiency: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: ExecutionState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshExecution() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, ceo, coo, cfo, cro, chro, ciso, council, board, scenarios, productivity, workflows, simulate, efficiency] =
        await Promise.all([
          getExecutionLive(),
          getExecutionCeo(),
          getExecutionCoo(),
          getExecutionCfo(),
          getExecutionCro(),
          getExecutionChro(),
          getExecutionCiso(),
          getExecutionCouncil(),
          getExecutionBoard(),
          getExecutionScenarios(),
          getExecutionProductivity(),
          getExecutionWorkflows(),
          getExecutionSimulate(),
          getExecutionEfficiency(),
        ]);

      sharedState = {
        ...sharedState,
        live,
        ceo: ceo.data,
        coo: coo.data,
        cfo: cfo.data,
        cro: cro.data,
        chro: chro.data,
        ciso: ciso.data,
        council: council.data,
        board: board.data,
        scenarios: scenarios.data,
        productivity: productivity.data,
        workflows: workflows.data,
        simulate: simulate.data,
        efficiency: efficiency.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Enterprise execution OS is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withExecutionAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshExecution();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Execution action failed",
    };
    notify();
  }
}

export function useExecution() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshExecution();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshExecution,
    runReview: () => withExecutionAction("review", runExecutionReview),
    growthMode: () => withExecutionAction("growth", activateExecutionGrowthMode),
    costMode: () => withExecutionAction("cost", activateExecutionCostMode),
    raisePlan: (amount = 20_000_000) =>
      withExecutionAction("raise", () => createExecutionRaisePlan(amount)),
    hirePlan: (hires = 3) => withExecutionAction("hire", () => createExecutionHirePlan(hires)),
    runSimulation: (scenario = "Expand to 3 countries") =>
      withExecutionAction(`simulation-${scenario}`, () => runExecutionSimulation(scenario)),
  };
}
