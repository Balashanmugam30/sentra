"use client";

import { useEffect, useState } from "react";

import {
  createPlatformBackup,
  flushPlatformCache,
  getPlatformOpsBillingReconciliation,
  getPlatformOpsDataIntegrity,
  getPlatformOpsDeployment,
  getPlatformOpsErrors,
  getPlatformOpsLive,
  getPlatformOpsPerformance,
} from "@/lib/platform/api";
import type { PlatformOpsLive, PlatformOpsState } from "@/lib/platform/types";

type State = PlatformOpsState & {
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: State = {
  live: null,
  errors: null,
  performance: null,
  deployment: null,
  dataIntegrity: null,
  billingReconciliation: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: State) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshPlatformOps() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, errors, performance, deployment, dataIntegrity, billingReconciliation] = await Promise.all([
        getPlatformOpsLive(),
        getPlatformOpsErrors(),
        getPlatformOpsPerformance(),
        getPlatformOpsDeployment(),
        getPlatformOpsDataIntegrity(),
        getPlatformOpsBillingReconciliation(),
      ]);
      sharedState = {
        live: live as PlatformOpsLive,
        errors,
        performance,
        deployment,
        dataIntegrity,
        billingReconciliation,
        loading: false,
        error: null,
        busyAction: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Platform ops is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshPlatformOps();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Platform ops action failed",
    };
    notify();
  }
}

export function usePlatformOps() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshPlatformOps();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshPlatformOps,
    flushCache: () => withAction("cache", flushPlatformCache),
    createBackup: () => withAction("backup", createPlatformBackup),
  };
}

