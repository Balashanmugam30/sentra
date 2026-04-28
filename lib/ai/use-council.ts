"use client";

import { useEffect, useState } from "react";

import {
  approveAICouncilPlan,
  getAIMultiAgentCouncil,
  pauseAICouncilAgents,
  rejectAICouncilPlan,
  runAIMultiAgentCouncil,
} from "@/lib/ai/api";
import { buildLocalCouncilSnapshot, councilScenarios } from "@/lib/ai/council";
import type { MultiAgentCouncilResponse } from "@/lib/ai/types";

type CouncilState = {
  council: MultiAgentCouncilResponse;
  loading: boolean;
  running: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useCouncil() {
  const [state, setState] = useState<CouncilState>({
    council: buildLocalCouncilSnapshot(),
    loading: true,
    running: false,
    busyAction: null,
    error: null,
    usingFallback: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCouncil() {
      try {
        const council = await getAIMultiAgentCouncil();
        if (!cancelled) {
          setState((current) => ({
            ...current,
            council,
            loading: false,
            error: null,
            usingFallback: false,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? `${error.message}. Using local council simulation.` : "Using local council simulation.",
            usingFallback: true,
          }));
        }
      }
    }

    void loadCouncil();
    return () => {
      cancelled = true;
    };
  }, []);

  const runScenario = async (scenarioId: string) => {
    setState((current) => ({ ...current, running: true, busyAction: scenarioId, error: null }));
    try {
      const council = await runAIMultiAgentCouncil(scenarioId);
      setState((current) => ({ ...current, council, running: false, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        council: buildLocalCouncilSnapshot(scenarioId),
        running: false,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Scenario debated locally.` : "Scenario debated locally.",
        usingFallback: true,
      }));
    }
  };

  const governanceAction = async (action: "approve" | "reject" | "pause") => {
    setState((current) => ({ ...current, busyAction: action, error: null }));
    try {
      const council =
        action === "approve"
          ? await approveAICouncilPlan("Command approved the unified council plan.")
          : action === "reject"
            ? await rejectAICouncilPlan("Command requested a safer alternate plan.")
            : await pauseAICouncilAgents("Command paused agents for manual review.");
      setState((current) => ({ ...current, council, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        council: {
          ...current.council,
          governance: {
            ...current.council.governance,
            status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "paused",
          },
        },
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Governance updated locally.` : "Governance updated locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    scenarios: councilScenarios,
    runScenario,
    approvePlan: () => governanceAction("approve"),
    rejectPlan: () => governanceAction("reject"),
    pauseAgents: () => governanceAction("pause"),
  };
}
