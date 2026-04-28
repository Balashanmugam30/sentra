"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getFacilityAssets,
  getFacilityEvents,
  getFacilityLive,
  postFacilityAnnouncement,
  postFacilityDoorCommand,
  postFacilityElevatorRecall,
  postFacilityHvacCommand,
  postFacilityLockdown,
  postFacilityTestScenario,
} from "@/lib/facility/api";
import type {
  FacilityActionResponse,
  FacilityAssetsResponse,
  FacilityEventsResponse,
  FacilityLiveResponse,
  FacilityScenario,
} from "@/lib/facility/types";

type FacilityStoreState = {
  live: FacilityLiveResponse | null;
  assets: FacilityAssetsResponse | null;
  events: FacilityEventsResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: FacilityActionResponse | null;
};

type UseFacilityResult = FacilityStoreState & {
  refresh: () => Promise<void>;
  runScenario: (scenario: FacilityScenario) => Promise<void>;
  campusLockdown: () => Promise<void>;
  allClear: () => Promise<void>;
  doorCommand: (assetId: string, command: "lock" | "unlock" | "pulse_open") => Promise<void>;
  hvacCommand: (zone: string, command: "shutdown" | "purge_air" | "normal_mode") => Promise<void>;
  recallElevator: (building: string) => Promise<void>;
};

const initialState: FacilityStoreState = {
  live: null,
  assets: null,
  events: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: FacilityStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: FacilityStoreState) => void>();

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
      const [live, assets, events] = await Promise.all([
        getFacilityLive(),
        getFacilityAssets(),
        getFacilityEvents(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        assets,
        events,
        loading: false,
        error: null,
      };
    } catch (loadError) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: loadError instanceof Error ? loadError.message : "Failed to load facility state",
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

async function withAction(action: () => Promise<FacilityActionResponse>) {
  try {
    const lastAction = await action();
    sharedState = { ...sharedState, lastAction, error: null };
    notifySubscribers();
    await refreshSharedState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error: actionError instanceof Error ? actionError.message : "Facility action failed",
    };
    notifySubscribers();
  }
}

export function useFacility(): UseFacilityResult {
  const [state, setState] = useState<FacilityStoreState>(sharedState);

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
    runScenario: async (scenario) => {
      try {
        const result = await postFacilityTestScenario({ scenario });
        sharedState = {
          ...sharedState,
          lastAction: result.actions[0] ?? null,
          error: null,
        };
        notifySubscribers();
        await refreshSharedState();
      } catch (actionError) {
        sharedState = {
          ...sharedState,
          error: actionError instanceof Error ? actionError.message : "Facility scenario failed",
        };
        notifySubscribers();
      }
    },
    campusLockdown: async () => {
      await withAction(async () =>
        postFacilityLockdown({ scope: "campus", reason: "campus_lockdown" }),
      );
    },
    allClear: async () => {
      await withAction(async () =>
        postFacilityAnnouncement({ scope: "campus", template: "all_clear" }),
      );
    },
    doorCommand: async (assetId, command) => {
      await withAction(async () => postFacilityDoorCommand({ asset_id: assetId, command }));
    },
    hvacCommand: async (zone, command) => {
      await withAction(async () => postFacilityHvacCommand({ zone, command }));
    },
    recallElevator: async (building) => {
      await withAction(async () => postFacilityElevatorRecall({ building }));
    },
  };
}
