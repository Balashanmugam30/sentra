"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getAgentsLearningHistory,
  getAgentsLearningLive,
  resetAgentsLearning,
  runAgentsLearningCycle,
} from "@/lib/agents/learning";
import type {
  LearningHistoryResponse,
  LearningLiveResponse,
  LearningScenario,
} from "@/lib/agents/types";

type LearningStoreState = {
  live: LearningLiveResponse | null;
  history: LearningHistoryResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseLearningResult = LearningStoreState & {
  refresh: () => Promise<void>;
  runCycle: (scenario: LearningScenario) => Promise<void>;
  resetLearning: () => Promise<void>;
};

const initialState: LearningStoreState = {
  live: null,
  history: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: LearningStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: LearningStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => {
    subscriber(sharedState);
  });
}

async function refreshSharedLearningState() {
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
        getAgentsLearningLive(),
        getAgentsLearningHistory(),
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
            : "Failed to load adaptive learning state",
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

  void refreshSharedLearningState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedLearningState();
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
    await refreshSharedLearningState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error:
        actionError instanceof Error
          ? actionError.message
          : "Learning action failed",
    };
    notifySubscribers();
  }
}

export function useLearning(): UseLearningResult {
  const [state, setState] = useState<LearningStoreState>(sharedState);

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
    refresh: refreshSharedLearningState,
    runCycle: async (scenario) => {
      await withAction(async () => {
        const result = await runAgentsLearningCycle({ scenario });
        return `learned ${result.scenario} -> ${result.episode.decision_strategy}`;
      });
    },
    resetLearning: async () => {
      await withAction(async () => {
        const result = await resetAgentsLearning();
        return `${result.status} ${result.episodes_cleared} episodes`;
      });
    },
  };
}
