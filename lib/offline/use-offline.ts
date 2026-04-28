"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  activateOfflineMode,
  deactivateOfflineMode,
  getOfflineCacheStatus,
  getOfflineLive,
  storeOfflineEvent,
  syncOfflineNow,
  testOfflineOutage,
} from "@/lib/offline/api";
import type {
  OfflineCacheStatusResponse,
  OfflineLiveResponse,
  OfflineOutageScenario,
} from "@/lib/offline/types";

type OfflineStoreState = {
  live: OfflineLiveResponse | null;
  cache: OfflineCacheStatusResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseOfflineResult = OfflineStoreState & {
  refresh: () => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  syncNow: () => Promise<void>;
  simulateOutage: (scenario: OfflineOutageScenario) => Promise<void>;
  storeDemoEvent: () => Promise<void>;
};

const initialState: OfflineStoreState = {
  live: null,
  cache: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: OfflineStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: OfflineStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshSharedState() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notifySubscribers();

  refreshInFlight = (async () => {
    try {
      const [live, cache] = await Promise.all([getOfflineLive(), getOfflineCacheStatus()]);
      sharedState = {
        ...sharedState,
        live,
        cache,
        loading: false,
        error: null,
      };
    } catch (loadError) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: loadError instanceof Error ? loadError.message : "Failed to load offline state",
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
    sharedState = { ...sharedState, lastAction, error: null };
    notifySubscribers();
    await refreshSharedState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error: actionError instanceof Error ? actionError.message : "Offline action failed",
    };
    notifySubscribers();
  }
}

export function useOffline(): UseOfflineResult {
  const [state, setState] = useState<OfflineStoreState>(sharedState);

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
    activate: async () => {
      await withAction(async () => {
        const result = await activateOfflineMode();
        return `${result.status} ${result.mode}`;
      });
    },
    deactivate: async () => {
      await withAction(async () => {
        const result = await deactivateOfflineMode();
        return `${result.status} ${result.mode}`;
      });
    },
    syncNow: async () => {
      await withAction(async () => {
        const result = await syncOfflineNow();
        return `${result.status} ${result.synced_count} synced`;
      });
    },
    simulateOutage: async (scenario) => {
      await withAction(async () => {
        const result = await testOfflineOutage({ scenario });
        return `${result.status} ${result.mode}`;
      });
    },
    storeDemoEvent: async () => {
      await withAction(async () => {
        const result = await storeOfflineEvent({
          source: "field",
          type: "status_update",
          payload: {
            responder_id: "RSP-201",
            task_id: "TASK-101",
            status: "arrived",
          },
        });
        return `${result.status} ${result.event_id}`;
      });
    },
  };
}
