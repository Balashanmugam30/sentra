"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  approveOperationsStep,
  cancelOperationWorkflow,
  getOperationsHistory,
  getOperationsLive,
  runOperationsTest,
} from "@/lib/operations/api";
import type {
  OperationsHistoryResponse,
  OperationsLiveResponse,
  WorkflowScenario,
} from "@/lib/operations/types";

type OperationsStoreState = {
  live: OperationsLiveResponse | null;
  history: OperationsHistoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseOperationsResult = OperationsStoreState & {
  refresh: () => Promise<void>;
  runTest: (scenario: WorkflowScenario) => Promise<void>;
  approve: (workflowId: string, stepId: string) => Promise<void>;
  cancel: (workflowId: string) => Promise<void>;
};

const initialState: OperationsStoreState = {
  live: null,
  history: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: OperationsStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: OperationsStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedState() {
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
      const [live, history] = await Promise.all([
        getOperationsLive(),
        getOperationsHistory(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        history,
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
            : "Failed to load operations state",
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

  void refreshSharedState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedState();
  }, DEFAULT_REFRESH_MS);
}

function stopPollingIfUnused() {
  if (typeof window === "undefined" || subscribers.size > 0 || pollingInterval === null) {
    return;
  }

  window.clearInterval(pollingInterval);
  pollingInterval = null;
}

async function withAction(action: () => Promise<string>) {
  try {
    const lastAction = await action();
    sharedState = {
      ...sharedState,
      lastAction,
      error: null,
    };
    notifySubscribers();
    await refreshSharedState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Operations action failed",
    };
    notifySubscribers();
  }
}

export function useOperations(): UseOperationsResult {
  const [state, setState] = useState<OperationsStoreState>(sharedState);

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
    refresh: refreshSharedState,
    runTest: async (scenario) => {
      await withAction(async () => {
        const result = await runOperationsTest({ scenario });
        return `${result.status} ${result.workflow.title}`;
      });
    },
    approve: async (workflowId, stepId) => {
      await withAction(async () => {
        const result = await approveOperationsStep({
          workflow_id: workflowId,
          step_id: stepId,
        });
        return `${result.status} ${result.workflow.title}`;
      });
    },
    cancel: async (workflowId) => {
      await withAction(async () => {
        const result = await cancelOperationWorkflow({ workflow_id: workflowId });
        return `${result.status} ${result.workflow.title}`;
      });
    },
  };
}
