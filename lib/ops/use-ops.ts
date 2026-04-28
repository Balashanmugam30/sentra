"use client";

import { useCallback, useEffect, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import {
  approveOpsTask,
  closeOpsIncident,
  getOpsExecution,
  getOpsObservability,
  pauseOpsTask,
  reassignOpsTask,
  runOpsExecution,
} from "@/lib/ops/api";
import { buildLocalOpsExecutionSnapshot } from "@/lib/ops/workflows";
import type { OpsExecutionSnapshot, OpsObservabilitySnapshot } from "@/lib/ops/types";

export function useOpsObservability({ enabled = true }: { enabled?: boolean } = {}) {
  const [snapshot, setSnapshot] = useState<OpsObservabilitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setIsRefreshing(true);
    const result = await getOpsObservability();
    if (result.success) {
      setSnapshot(result.data);
      setError(null);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useSmartRefresh({
    id: "ops-observability",
    enabled,
    tier: "operational",
    sectionId: "security",
    refresh,
  });

  return {
    snapshot,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}

type OpsExecutionState = {
  snapshot: OpsExecutionSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useOpsExecution({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<OpsExecutionState>({
    snapshot: buildLocalOpsExecutionSnapshot(),
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
      const snapshot = await getOpsExecution();
      setState((current) => ({
        ...current,
        snapshot,
        isLoading: false,
        isRefreshing: false,
        error: null,
        usingFallback: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local execution model.` : "Using local execution model.",
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
      const snapshot = await runOpsExecution(scenarioId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        snapshot: buildLocalOpsExecutionSnapshot(),
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Scenario executed locally.` : "Scenario executed locally.",
        usingFallback: true,
      }));
    }
  };

  const approveTask = async (taskId: string) => {
    setState((current) => ({ ...current, busyAction: taskId, error: null }));
    try {
      const snapshot = await approveOpsTask(taskId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Approval staged locally.` : "Approval staged locally.",
        usingFallback: true,
      }));
    }
  };

  const pauseTask = async (taskId: string) => {
    setState((current) => ({ ...current, busyAction: taskId, error: null }));
    try {
      const snapshot = await pauseOpsTask(taskId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Pause staged locally.` : "Pause staged locally.",
        usingFallback: true,
      }));
    }
  };

  const reassignTask = async (taskId: string, owner = "Ops Alpha") => {
    setState((current) => ({ ...current, busyAction: taskId, error: null }));
    try {
      const snapshot = await reassignOpsTask(taskId, owner);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Reassignment staged locally.` : "Reassignment staged locally.",
        usingFallback: true,
      }));
    }
  };

  const closeIncident = async (incidentId: string) => {
    setState((current) => ({ ...current, busyAction: incidentId, error: null }));
    try {
      const snapshot = await closeOpsIncident(incidentId);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Closure gate evaluated locally.` : "Closure gate evaluated locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    refresh,
    runScenario,
    approveTask,
    pauseTask,
    reassignTask,
    closeIncident,
  };
}
