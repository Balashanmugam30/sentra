"use client";

import { useCallback, useEffect, useState } from "react";

import { approveOpsRecovery, getOpsRecovery, runOpsRecovery } from "@/lib/ops/api";
import { buildLocalRecoverySnapshot } from "@/lib/ops/recovery";
import type { OpsRecoverySnapshot } from "@/lib/ops/types";

type RecoveryState = {
  snapshot: OpsRecoverySnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useRecovery({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<RecoveryState>({
    snapshot: buildLocalRecoverySnapshot(),
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
      const snapshot = await getOpsRecovery();
      setState((current) => ({ ...current, snapshot, isLoading: false, isRefreshing: false, error: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local recovery model.` : "Using local recovery model.",
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

  const runScenario = async (scenarioId: string) => {
    setState((current) => ({ ...current, busyAction: scenarioId, error: null }));
    try {
      const snapshot = await runOpsRecovery(scenarioId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Recovery run staged locally.` : "Recovery run staged locally.",
        usingFallback: true,
      }));
    }
  };

  const approveGate = async (gateId: string) => {
    setState((current) => ({ ...current, busyAction: gateId, error: null }));
    try {
      const snapshot = await approveOpsRecovery(gateId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Gate approval staged locally.` : "Gate approval staged locally.",
        usingFallback: true,
      }));
    }
  };

  return { ...state, refresh, runScenario, approveGate };
}
