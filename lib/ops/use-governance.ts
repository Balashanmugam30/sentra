"use client";

import { useCallback, useEffect, useState } from "react";

import {
  approveOpsGovernanceApproval,
  delegateOpsGovernanceApproval,
  escalateOpsGovernanceApproval,
  getOpsGovernance,
  rejectOpsGovernanceApproval,
  runOpsAutomationAction,
} from "@/lib/ops/api";
import { buildLocalGovernanceSnapshot } from "@/lib/ops/approval";
import type { OpsGovernanceSnapshot } from "@/lib/ops/types";

type OpsGovernanceState = {
  snapshot: OpsGovernanceSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useGovernance({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<OpsGovernanceState>({
    snapshot: buildLocalGovernanceSnapshot(),
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
      const snapshot = await getOpsGovernance();
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
        error: error instanceof Error ? `${error.message}. Using local governance model.` : "Using local governance model.",
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

  const mutate = async (busyAction: string, operation: () => Promise<OpsGovernanceSnapshot>, fallbackMessage: string) => {
    setState((current) => ({ ...current, busyAction, error: null }));
    try {
      const snapshot = await operation();
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. ${fallbackMessage}` : fallbackMessage,
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    refresh,
    approve: (approvalId: string) =>
      mutate(approvalId, () => approveOpsGovernanceApproval(approvalId), "Approval staged locally."),
    reject: (approvalId: string) =>
      mutate(approvalId, () => rejectOpsGovernanceApproval(approvalId), "Rejection staged locally."),
    delegate: (approvalId: string, delegateTo: string) =>
      mutate(approvalId, () => delegateOpsGovernanceApproval(approvalId, delegateTo), "Delegation staged locally."),
    escalate: (approvalId: string) =>
      mutate(approvalId, () => escalateOpsGovernanceApproval(approvalId), "Escalation staged locally."),
    runAutomation: (actionId: string) =>
      mutate(actionId, () => runOpsAutomationAction(actionId), "Automation run staged locally."),
  };
}
