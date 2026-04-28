"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getResilienceHistory,
  getResilienceLive,
  recoverResilienceWorkflow,
  resetResilienceCircuit,
  runResilienceTest,
} from "@/lib/resilience/api";
import type {
  ResilienceHistoryResponse,
  ResilienceLiveResponse,
  ResilienceScenario,
} from "@/lib/resilience/types";

type ResilienceStoreState = {
  live: ResilienceLiveResponse | null;
  history: ResilienceHistoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseResilienceResult = ResilienceStoreState & {
  refresh: () => Promise<void>;
  runTest: (scenario: ResilienceScenario) => Promise<void>;
  resetCircuit: (provider: string) => Promise<void>;
  recoverWorkflow: (workflowId: string) => Promise<void>;
};

const initialState: ResilienceStoreState = {
  live: null,
  history: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: ResilienceStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: ResilienceStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedResilienceState() {
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
        getResilienceLive(),
        getResilienceHistory(),
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
            : "Failed to load resilience state",
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

  void refreshSharedResilienceState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedResilienceState();
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
    await refreshSharedResilienceState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Resilience action failed",
    };
    notifySubscribers();
  }
}

export function useResilience(): UseResilienceResult {
  const [state, setState] = useState<ResilienceStoreState>(sharedState);

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
    refresh: refreshSharedResilienceState,
    runTest: async (scenario) => {
      await withAction(async () => {
        const result = await runResilienceTest({ scenario });
        return `${result.status} ${result.scenario}`;
      });
    },
    resetCircuit: async (provider) => {
      await withAction(async () => {
        const result = await resetResilienceCircuit({ provider });
        return `${result.status} ${result.provider} circuit`;
      });
    },
    recoverWorkflow: async (workflowId) => {
      await withAction(async () => {
        const result = await recoverResilienceWorkflow({ workflow_id: workflowId });
        return `${result.status} ${result.workflow.title}`;
      });
    },
  };
}
