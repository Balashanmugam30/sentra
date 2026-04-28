"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getHardwareDevices,
  getHardwareLive,
  runHardwareTest,
  sendHardwareCommand,
} from "@/lib/hardware/api";
import type {
  HardwareCommand,
  HardwareDevicesResponse,
  HardwareLiveResponse,
  HardwareTestScenario,
} from "@/lib/hardware/types";

type HardwareStoreState = {
  live: HardwareLiveResponse | null;
  devices: HardwareDevicesResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseHardwareResult = HardwareStoreState & {
  refresh: () => Promise<void>;
  runTest: (scenario: HardwareTestScenario) => Promise<void>;
  commandDevice: (deviceId: string, command: HardwareCommand) => Promise<void>;
};

const initialState: HardwareStoreState = {
  live: null,
  devices: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: HardwareStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: HardwareStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshSharedHardwareState() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notifySubscribers();

  refreshInFlight = (async () => {
    try {
      const [live, devices] = await Promise.all([getHardwareLive(), getHardwareDevices()]);
      sharedState = { ...sharedState, live, devices, loading: false, error: null };
    } catch (loadError) {
      sharedState = {
        ...sharedState,
        loading: false,
        error:
          loadError instanceof Error ? loadError.message : "Failed to load hardware gateway state",
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
  void refreshSharedHardwareState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedHardwareState();
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
    await refreshSharedHardwareState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error: actionError instanceof Error ? actionError.message : "Hardware action failed",
    };
    notifySubscribers();
  }
}

export function useHardware(): UseHardwareResult {
  const [state, setState] = useState<HardwareStoreState>(sharedState);

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
    refresh: refreshSharedHardwareState,
    runTest: async (scenario) => {
      await withAction(async () => {
        const result = await runHardwareTest({ scenario });
        return `${result.status} ${result.scenario}`;
      });
    },
    commandDevice: async (deviceId, command) => {
      await withAction(async () => {
        const result = await sendHardwareCommand({ device_id: deviceId, command });
        return `${command} via ${result.delivered_mode}`;
      });
    },
  };
}
