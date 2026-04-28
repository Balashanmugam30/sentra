"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getAgentsDebateHistory,
  getAgentsDebateLive,
  resetAgentsDebate,
  runAgentsDebate,
} from "@/lib/agents/debate";
import type {
  DebateHistoryResponse,
  DebateLiveResponse,
  DebateScenario,
} from "@/lib/agents/types";

type DebateStoreState = {
  live: DebateLiveResponse | null;
  history: DebateHistoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseDebateResult = DebateStoreState & {
  refresh: () => Promise<void>;
  runScenario: (scenario: DebateScenario) => Promise<void>;
  resetDebate: () => Promise<void>;
};

const initialState: DebateStoreState = {
  live: null,
  history: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: DebateStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: DebateStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedDebateState() {
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
        getAgentsDebateLive(),
        getAgentsDebateHistory(),
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
            : "Failed to load debate and consensus state",
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

  void refreshSharedDebateState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedDebateState();
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
    await refreshSharedDebateState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Debate action failed",
    };
    notifySubscribers();
  }
}

export function useDebate(): UseDebateResult {
  const [state, setState] = useState<DebateStoreState>(sharedState);

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
    refresh: refreshSharedDebateState,
    runScenario: async (scenario) => {
      await withAction(async () => {
        const result = await runAgentsDebate({ scenario });
        return `resolved ${result.active_debate.scenario}`;
      });
    },
    resetDebate: async () => {
      await withAction(async () => {
        const result = await resetAgentsDebate();
        return `${result.status} ${result.debates_cleared} debates`;
      });
    },
  };
}
