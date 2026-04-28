"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  approveGovernanceRequest,
  getGovernanceAudit,
  getGovernanceLive,
  overrideGovernanceWorkflow,
  pauseGovernanceWorkflow,
  reassignGovernanceApproval,
  rejectGovernanceRequest,
  resumeGovernanceWorkflow,
} from "@/lib/governance/api";
import type {
  GovernanceActionResponse,
  GovernanceAuditResponse,
  GovernanceLiveResponse,
} from "@/lib/governance/types";

type GovernanceStoreState = {
  live: GovernanceLiveResponse | null;
  audit: GovernanceAuditResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseGovernanceResult = GovernanceStoreState & {
  refresh: () => Promise<void>;
  approve: (approvalId: string, actor: string, notes?: string) => Promise<void>;
  reject: (approvalId: string, actor: string, notes?: string) => Promise<void>;
  pause: (workflowId: string, actor: string) => Promise<void>;
  resume: (workflowId: string, actor: string) => Promise<void>;
  override: (workflowId: string, actor: string, reason: string) => Promise<void>;
  reassign: (approvalId: string, newRole: string) => Promise<void>;
};

const initialState: GovernanceStoreState = {
  live: null,
  audit: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: GovernanceStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: GovernanceStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedGovernanceState() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = {
    ...sharedState,
    loading: true,
  };
  notifySubscribers();

  refreshInFlight = (async () => {
    try {
      const [live, audit] = await Promise.all([
        getGovernanceLive(),
        getGovernanceAudit(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        audit,
        loading: false,
        error: null,
      };
    } catch (loadError) {
      sharedState = {
        ...sharedState,
        loading: false,
        error:
          loadError instanceof Error
            ? loadError.message
            : "Failed to load governance state",
      };
    } finally {
      refreshInFlight = null;
      notifySubscribers();
    }
  })();

  return refreshInFlight;
}

function startPolling() {
  if (typeof window === "undefined" || pollingInterval !== null) {
    return;
  }

  void refreshSharedGovernanceState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedGovernanceState();
  }, DEFAULT_REFRESH_MS);
}

function stopPollingIfUnused() {
  if (typeof window === "undefined" || subscribers.size > 0 || pollingInterval === null) {
    return;
  }

  window.clearInterval(pollingInterval);
  pollingInterval = null;
}

async function withAction(
  action: () => Promise<GovernanceActionResponse>,
  format: (result: GovernanceActionResponse) => string,
) {
  try {
    const result = await action();
    sharedState = {
      ...sharedState,
      lastAction: format(result),
      error: null,
    };
    notifySubscribers();
    await refreshSharedGovernanceState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Governance action failed",
    };
    notifySubscribers();
  }
}

export function useGovernance(): UseGovernanceResult {
  const [state, setState] = useState<GovernanceStoreState>(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    startPolling();

    return () => {
      subscribers.delete(setState);
      stopPollingIfUnused();
    };
  }, []);

  return {
    ...state,
    refresh: refreshSharedGovernanceState,
    approve: async (approvalId, actor, notes) => {
      await withAction(
        () => approveGovernanceRequest({ approval_id: approvalId, actor, notes }),
        (result) => `${result.status} ${result.approval?.action_name ?? "approval"}`,
      );
    },
    reject: async (approvalId, actor, notes) => {
      await withAction(
        () => rejectGovernanceRequest({ approval_id: approvalId, actor, notes }),
        (result) => `${result.status} ${result.approval?.action_name ?? "approval"}`,
      );
    },
    pause: async (workflowId, actor) => {
      await withAction(
        () => pauseGovernanceWorkflow({ workflow_id: workflowId, actor }),
        (result) => `${result.status} ${result.workflow?.title ?? workflowId}`,
      );
    },
    resume: async (workflowId, actor) => {
      await withAction(
        () => resumeGovernanceWorkflow({ workflow_id: workflowId, actor }),
        (result) => `${result.status} ${result.workflow?.title ?? workflowId}`,
      );
    },
    override: async (workflowId, actor, reason) => {
      await withAction(
        () => overrideGovernanceWorkflow({ workflow_id: workflowId, actor, reason }),
        (result) => `${result.status} ${result.workflow?.title ?? workflowId}`,
      );
    },
    reassign: async (approvalId, newRole) => {
      await withAction(
        () => reassignGovernanceApproval({ approval_id: approvalId, new_role: newRole }),
        (result) =>
          `${result.status} ${result.approval?.action_name ?? approvalId} to ${result.approval?.required_role ?? newRole}`,
      );
    },
  };
}
