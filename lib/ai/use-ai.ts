"use client";

import { useEffect, useState } from "react";

import {
  approveAICouncilCorePlan,
  getAICouncilCoreAgents,
  getAICouncilCoreSummary,
  getAICouncilLearning,
  getAICouncilPlan,
  getAIDecision,
  getAIDecisionScenarios,
  loadAIDecisionScenario,
  overrideAICouncilCore,
  retrainAICouncilWeights,
  runAICouncilCoreDebate,
  runAIDecision,
  setAICouncilObjective,
} from "@/lib/ai/api";
import { decisionScenarioMap, runLocalDecisionEngine } from "@/lib/ai/decisionEngine";
import { aiCouncilAgents, aiCouncilDebate, aiCouncilLearning, aiCouncilPlan, aiCouncilSummary } from "@/lib/aicouncil/runtime";
import type { AICouncilAgent, AICouncilDebate, AICouncilLearning, AICouncilPlan, AICouncilSummary, AIDecisionResponse, AIDecisionScenario } from "@/lib/ai/types";

type AIDecisionState = {
  decision: AIDecisionResponse;
  scenarios: AIDecisionScenario[];
  loading: boolean;
  error: string | null;
  busyScenario: string | null;
  usingFallback: boolean;
};

const fallbackScenarios = Object.entries(decisionScenarioMap).map(([scenario_id, incident]) => ({
  scenario_id,
  label: incident.label,
}));

export function useAIDecision() {
  const [state, setState] = useState<AIDecisionState>({
    decision: runLocalDecisionEngine(),
    scenarios: fallbackScenarios,
    loading: true,
    error: null,
    busyScenario: null,
    usingFallback: false,
  });

  useEffect(() => {
    let cancelled = false;
    async function loadDecision() {
      try {
        const [decision, scenariosResponse] = await Promise.all([getAIDecision(), getAIDecisionScenarios()]);
        if (!cancelled) {
          setState({
            decision,
            scenarios: scenariosResponse.data.scenarios,
            loading: false,
            error: null,
            busyScenario: null,
            usingFallback: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? `${error.message}. Using local decision engine.` : "Using local decision engine.",
            usingFallback: true,
          }));
        }
      }
    }
    void loadDecision();
    return () => {
      cancelled = true;
    };
  }, []);

  const runScenario = async (scenarioId: string) => {
    setState((current) => ({ ...current, busyScenario: scenarioId, error: null }));
    try {
      const decision = await loadAIDecisionScenario(scenarioId);
      setState((current) => ({ ...current, decision, busyScenario: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        decision: runLocalDecisionEngine(scenarioId),
        busyScenario: null,
        error: error instanceof Error ? `${error.message}. Scenario simulated locally.` : "Scenario simulated locally.",
        usingFallback: true,
      }));
    }
  };

  const refreshDecision = async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const decision = await runAIDecision(state.decision.scenario_id);
      setState((current) => ({ ...current, decision, loading: false, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        decision: runLocalDecisionEngine(current.decision.scenario_id),
        loading: false,
        error: error instanceof Error ? `${error.message}. Decision recalculated locally.` : "Decision recalculated locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    runScenario,
    refreshDecision,
  };
}

type AICouncilCoreState = {
  summary: AICouncilSummary;
  agents: AICouncilAgent[];
  debate: AICouncilDebate;
  plan: AICouncilPlan;
  learning: AICouncilLearning;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialCouncilCoreState: AICouncilCoreState = {
  summary: aiCouncilSummary,
  agents: aiCouncilAgents,
  debate: aiCouncilDebate,
  plan: aiCouncilPlan,
  learning: aiCouncilLearning,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedCouncilState = initialCouncilCoreState;
let councilRefreshInFlight: Promise<void> | null = null;
const councilSubscribers = new Set<(state: AICouncilCoreState) => void>();

function notifyCouncilSubscribers() {
  councilSubscribers.forEach((subscriber) => subscriber(sharedCouncilState));
}

export async function refreshAICouncilCore() {
  if (councilRefreshInFlight) {
    return councilRefreshInFlight;
  }

  sharedCouncilState = { ...sharedCouncilState, loading: true };
  notifyCouncilSubscribers();
  councilRefreshInFlight = (async () => {
    try {
      const [summary, agents, plan, learning] = await Promise.all([getAICouncilCoreSummary(), getAICouncilCoreAgents(), getAICouncilPlan(), getAICouncilLearning()]);
      sharedCouncilState = {
        ...sharedCouncilState,
        summary: summary.data,
        agents: agents.items,
        plan: plan.data,
        learning: learning.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedCouncilState = {
        ...sharedCouncilState,
        loading: false,
        error: error instanceof Error ? `${error.message}. Using local AI council runtime.` : "Using local AI council runtime.",
      };
    } finally {
      councilRefreshInFlight = null;
      notifyCouncilSubscribers();
    }
  })();
  return councilRefreshInFlight;
}

async function withAICouncilAction(label: string, action: () => Promise<{ message?: string; data?: unknown }>) {
  sharedCouncilState = { ...sharedCouncilState, busyAction: label, error: null };
  notifyCouncilSubscribers();
  try {
    const response = await action();
    sharedCouncilState = {
      ...sharedCouncilState,
      busyAction: null,
      lastAction: response.message ?? "AI council action complete",
    };
    notifyCouncilSubscribers();
    await refreshAICouncilCore();
  } catch (error) {
    sharedCouncilState = {
      ...sharedCouncilState,
      busyAction: null,
      error: error instanceof Error ? `${error.message}. Action applied locally where possible.` : "AI council action could not be completed.",
    };
    notifyCouncilSubscribers();
  }
}

export function useAICouncilCore() {
  const [state, setState] = useState(sharedCouncilState);

  useEffect(() => {
    councilSubscribers.add(setState);
    if (sharedCouncilState.loading && !councilRefreshInFlight) {
      void refreshAICouncilCore();
    }
    return () => {
      councilSubscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshAICouncilCore,
    debateScenario: (scenarioId?: string, objective?: string) =>
      withAICouncilAction("debate", async () => {
        const response = await runAICouncilCoreDebate(scenarioId, objective);
        sharedCouncilState = { ...sharedCouncilState, debate: response.data };
        return { message: "Strategy debate executed" };
      }),
    setObjective: (objective: string) => withAICouncilAction("objective", () => setAICouncilObjective(objective)),
    approvePlan: () => withAICouncilAction("approve", () => approveAICouncilCorePlan(sharedCouncilState.plan.plan_id, "Executive approved the governed recommendation.")),
    overrideAction: (actionId?: string) => withAICouncilAction("override", () => overrideAICouncilCore(actionId, "manual_override", "Executive override requested from AI war room.")),
    retrainWeights: (domain?: string) => withAICouncilAction("retrain", () => retrainAICouncilWeights(domain)),
  };
}
