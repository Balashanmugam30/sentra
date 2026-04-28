"use client";

import { useCallback, useEffect, useState } from "react";

import { getOpsResilience, runOpsResilienceHeal } from "@/lib/ops/api";
import { buildLocalResilienceSnapshot } from "@/lib/ops/resilience";
import type { OpsResilienceSnapshot } from "@/lib/ops/types";

type ResilienceState = {
  snapshot: OpsResilienceSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useResilience({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<ResilienceState>({
    snapshot: buildLocalResilienceSnapshot(),
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
      const snapshot = await getOpsResilience();
      setState((current) => ({ ...current, snapshot, isLoading: false, isRefreshing: false, error: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local resilience model.` : "Using local resilience model.",
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

  const heal = async (actionId: string) => {
    setState((current) => ({ ...current, busyAction: actionId, error: null }));
    try {
      const snapshot = await runOpsResilienceHeal(actionId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Heal action staged locally.` : "Heal action staged locally.",
        usingFallback: true,
      }));
    }
  };

  return { ...state, refresh, heal };
}
