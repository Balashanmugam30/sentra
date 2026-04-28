"use client";

import { useCallback, useEffect, useState } from "react";

import { dispatchOpsResource, getOpsResources } from "@/lib/ops/api";
import { buildLocalResourcesSnapshot } from "@/lib/ops/resources";
import type { OpsResourcesSnapshot } from "@/lib/ops/types";

type ResourceState = {
  snapshot: OpsResourcesSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useResources({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<ResourceState>({
    snapshot: buildLocalResourcesSnapshot(),
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
      const snapshot = await getOpsResources();
      setState((current) => ({ ...current, snapshot, isLoading: false, isRefreshing: false, error: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local resource model.` : "Using local resource model.",
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

  const dispatch = async (incidentId: string, unitId?: string) => {
    setState((current) => ({ ...current, busyAction: incidentId, error: null }));
    try {
      const snapshot = await dispatchOpsResource(incidentId, unitId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Dispatch staged locally.` : "Dispatch staged locally.",
        usingFallback: true,
      }));
    }
  };

  return { ...state, refresh, dispatch };
}
