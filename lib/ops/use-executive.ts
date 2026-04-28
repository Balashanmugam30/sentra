"use client";

import { useCallback, useEffect, useState } from "react";

import { getOpsExecutive, runOpsExecutiveAction, runOpsExecutiveSimulation } from "@/lib/ops/api";
import { buildLocalExecutiveSnapshot } from "@/lib/ops/executive";
import type { OpsExecutiveSnapshot } from "@/lib/ops/types";

type ExecutiveState = {
  snapshot: OpsExecutiveSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useExecutiveOps({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<ExecutiveState>({
    snapshot: buildLocalExecutiveSnapshot(),
    isLoading: enabled,
    isRefreshing: false,
    busyAction: null,
    error: null,
    usingFallback: false,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setState((current) => ({ ...current, isRefreshing: true }));
    try {
      const snapshot = await getOpsExecutive();
      setState((current) => ({ ...current, snapshot, isLoading: false, isRefreshing: false, error: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local executive model.` : "Using local executive model.",
        usingFallback: true,
      }));
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const runAction = async (actionId: string) => {
    setState((current) => ({ ...current, busyAction: actionId, error: null }));
    try {
      const snapshot = await runOpsExecutiveAction(actionId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. CEO action staged locally.` : "CEO action staged locally.",
        usingFallback: true,
      }));
    }
  };

  const runSimulation = async (optionId: string) => {
    setState((current) => ({ ...current, busyAction: optionId, error: null }));
    try {
      const snapshot = await runOpsExecutiveSimulation(optionId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Strategy simulation staged locally.` : "Strategy simulation staged locally.",
        usingFallback: true,
      }));
    }
  };

  return { ...state, refresh, runAction, runSimulation };
}
