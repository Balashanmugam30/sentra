"use client";

import { useEffect, useState } from "react";

import {
  approveDecision,
  fallbackApproval,
  fallbackDecision,
  fallbackMessages,
  fallbackStrategy,
  getApprovalQueue,
  getDecision,
  getMessages,
  getStrategy,
  overrideDecision,
  runDecisionEngine,
  type ApprovalSnapshot,
  type DecisionSnapshot,
  type MessageSnapshot,
  type StrategySnapshot,
} from "@/lib/behavior/decision";

type DecisionState = {
  decision: DecisionSnapshot;
  strategy: StrategySnapshot;
  messages: MessageSnapshot;
  approval: ApprovalSnapshot;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: DecisionState = {
  decision: fallbackDecision,
  strategy: fallbackStrategy,
  messages: fallbackMessages,
  approval: fallbackApproval,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DecisionState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDecision() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();

  refreshInFlight = (async () => {
    try {
      const [decision, strategy, messages, approval] = await Promise.all([getDecision(), getStrategy(), getMessages(), getApprovalQueue()]);
      sharedState = {
        ...sharedState,
        decision: decision.data,
        strategy: strategy.data,
        messages: messages.data,
        approval: approval.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Autonomous human response is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

async function withDecisionAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Autonomous response action complete" };
    notify();
    await refreshDecision();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Autonomous response action could not be completed",
    };
    notify();
  }
}

export function useDecision() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshDecision();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshDecision,
    runEngine: (scenario?: string) => withDecisionAction("run", () => runDecisionEngine(scenario)),
    approve: (approvalId?: string) => withDecisionAction("approve", () => approveDecision(approvalId)),
    override: (reason?: string) => withDecisionAction("override", () => overrideDecision(reason)),
  };
}
