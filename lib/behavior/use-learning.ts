"use client";

import { useEffect, useState } from "react";

import {
  approveBehaviorPolicy,
  fallbackCouncil,
  fallbackLearning,
  fallbackMemory,
  getCouncil,
  getLearning,
  getMemory,
  runBehaviorCouncil,
  runLearningCycle,
  type CouncilSnapshot,
  type LearningSnapshot,
  type MemoryGraph,
} from "@/lib/behavior/learning";

type LearningState = {
  learning: LearningSnapshot;
  memory: MemoryGraph;
  council: CouncilSnapshot;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: LearningState = {
  learning: fallbackLearning,
  memory: fallbackMemory,
  council: fallbackCouncil,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: LearningState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshLearning() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();

  refreshInFlight = (async () => {
    try {
      const [learning, memory, council] = await Promise.all([getLearning(), getMemory(), getCouncil()]);
      sharedState = {
        ...sharedState,
        learning: learning.data,
        memory: memory.data,
        council: council.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Behavior learning is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

async function withLearningAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Behavior learning action complete" };
    notify();
    await refreshLearning();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Behavior learning action could not be completed",
    };
    notify();
  }
}

export function useLearning() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshLearning();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshLearning,
    runLearning: (scenario?: string) => withLearningAction("learn", () => runLearningCycle(scenario)),
    runCouncil: (scenario?: string) => withLearningAction("council", () => runBehaviorCouncil(scenario)),
    approvePolicy: (policyId?: string) => withLearningAction("policy", () => approveBehaviorPolicy(policyId)),
  };
}
