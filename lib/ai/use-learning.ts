"use client";

import { useEffect, useState } from "react";

import { approveAILearningPolicy, getAILearning, runAILearningCycle, simulateAILearning } from "@/lib/ai/api";
import { buildLocalLearningSnapshot, simulationScenarios } from "@/lib/ai/learning";
import type { AILearningResponse } from "@/lib/ai/types";

type LearningState = {
  learning: AILearningResponse;
  loading: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useLearning() {
  const [state, setState] = useState<LearningState>({
    learning: buildLocalLearningSnapshot(),
    loading: true,
    busyAction: null,
    error: null,
    usingFallback: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadLearning() {
      try {
        const learning = await getAILearning();
        if (!cancelled) {
          setState((current) => ({ ...current, learning, loading: false, error: null, usingFallback: false }));
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? `${error.message}. Using local learning model.` : "Using local learning model.",
            usingFallback: true,
          }));
        }
      }
    }

    void loadLearning();
    return () => {
      cancelled = true;
    };
  }, []);

  const runCycle = async (scenarioId?: string) => {
    setState((current) => ({ ...current, busyAction: scenarioId ?? "learning", error: null }));
    try {
      const learning = await runAILearningCycle(scenarioId);
      setState((current) => ({ ...current, learning, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        learning: buildLocalLearningSnapshot(),
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Learning cycle simulated locally.` : "Learning cycle simulated locally.",
        usingFallback: true,
      }));
    }
  };

  const runSimulation = async (scenarioId: string) => {
    setState((current) => ({ ...current, busyAction: scenarioId, error: null }));
    try {
      const learning = await simulateAILearning(scenarioId);
      setState((current) => ({ ...current, learning, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Simulation completed locally.` : "Simulation completed locally.",
        usingFallback: true,
      }));
    }
  };

  const approvePolicy = async (policyId: string) => {
    setState((current) => ({ ...current, busyAction: policyId, error: null }));
    try {
      const learning = await approveAILearningPolicy(policyId);
      setState((current) => ({ ...current, learning, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        learning: {
          ...current.learning,
          policy_recommendations: current.learning.policy_recommendations.map((policy) =>
            policy.policy_id === policyId ? { ...policy, status: "approved" } : policy,
          ),
          governance: {
            ...current.learning.governance,
            approved_policies: [...current.learning.governance.approved_policies, policyId],
          },
        },
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Policy approval staged locally.` : "Policy approval staged locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    simulations: simulationScenarios,
    runCycle,
    runSimulation,
    approvePolicy,
  };
}
