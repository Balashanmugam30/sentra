"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getAgentsOptimizeHistory,
  getAgentsOptimizeLive,
  resetAgentsOptimization,
  runAgentsOptimization,
} from "@/lib/agents/optimize";
import type {
  OptimizationHistoryResponse,
  OptimizationPlanResponse,
  OptimizationScenario,
} from "@/lib/agents/types";

type OptimizationStoreState = {
  live: OptimizationPlanResponse | null;
  history: OptimizationHistoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseOptimizeResult = OptimizationStoreState & {
  refresh: () => Promise<void>;
  runScenario: (scenario: OptimizationScenario) => Promise<void>;
  resetOptimization: () => Promise<void>;
};

const initialState: OptimizationStoreState = {
  live: null,
  history: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: OptimizationStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: OptimizationStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedOptimizationState() {
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
        getAgentsOptimizeLive(),
        getAgentsOptimizeHistory(),
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
            : "Failed to load optimization intelligence",
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

  void refreshSharedOptimizationState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedOptimizationState();
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
    await refreshSharedOptimizationState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Optimization action failed",
    };
    notifySubscribers();
  }
}

export function useOptimize(): UseOptimizeResult {
  const [state, setState] = useState<OptimizationStoreState>(sharedState);

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
    refresh: refreshSharedOptimizationState,
    runScenario: async (scenario) => {
      await withAction(async () => {
        const result = await runAgentsOptimization({ scenario });
        return `optimized ${scenario} -> ${result.plan_id}`;
      });
    },
    resetOptimization: async () => {
      await withAction(async () => {
        const result = await resetAgentsOptimization();
        return `${result.status} ${result.plans_cleared} plans`;
      });
    },
  };
}
