"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getAgentsLive,
  getAgentsMemory,
  resetAgents,
  testAgentScenario,
} from "@/lib/agents/api";
import type {
  AgentScenario,
  AgentsLiveResponse,
  AgentsMemoryResponse,
} from "@/lib/agents/types";

type AgentsStoreState = {
  live: AgentsLiveResponse | null;
  memory: AgentsMemoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseAgentsResult = AgentsStoreState & {
  refresh: () => Promise<void>;
  runScenario: (scenario: AgentScenario) => Promise<void>;
  resetCouncil: () => Promise<void>;
};

const initialState: AgentsStoreState = {
  live: null,
  memory: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: AgentsStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: AgentsStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedAgentsState() {
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
      const [live, memory] = await Promise.all([
        getAgentsLive(),
        getAgentsMemory(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        memory,
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
            : "Failed to load persistent AI command council",
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

  void refreshSharedAgentsState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedAgentsState();
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
    await refreshSharedAgentsState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Agent council action failed",
    };
    notifySubscribers();
  }
}

export function useAgents(): UseAgentsResult {
  const [state, setState] = useState<AgentsStoreState>(sharedState);

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
    refresh: refreshSharedAgentsState,
    runScenario: async (scenario) => {
      await withAction(async () => {
        const result = await testAgentScenario({ scenario });
        return `${result.status} ${result.scenario}`;
      });
    },
    resetCouncil: async () => {
      await withAction(async () => {
        const result = await resetAgents();
        return `${result.status} ${result.agents_reset} agents`;
      });
    },
  };
}
