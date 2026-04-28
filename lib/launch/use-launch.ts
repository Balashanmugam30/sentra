"use client";

import { useEffect, useState } from "react";

import {
  getLaunchExecutive,
  getLaunchOps,
  getLaunchPerformance,
  getLaunchQuality,
  getLaunchReadiness,
  getLaunchSummary,
  runLaunchOptimize,
  runLaunchScan,
} from "@/lib/launch/api";
import {
  fallbackLaunchExecutive,
  fallbackLaunchOps,
  fallbackLaunchPerformance,
  fallbackLaunchQuality,
  fallbackLaunchReadiness,
  fallbackLaunchSummary,
} from "@/lib/launch/runtime";
import type { LaunchExecutive, LaunchOps, LaunchPerformance, LaunchQuality, LaunchReadiness, LaunchSummary } from "@/lib/launch/types";

type LaunchState = {
  summary: LaunchSummary;
  performance: LaunchPerformance;
  quality: LaunchQuality;
  readiness: LaunchReadiness;
  executive: LaunchExecutive;
  ops: LaunchOps;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: LaunchState = {
  summary: fallbackLaunchSummary,
  performance: fallbackLaunchPerformance,
  quality: fallbackLaunchQuality,
  readiness: fallbackLaunchReadiness,
  executive: fallbackLaunchExecutive,
  ops: fallbackLaunchOps,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: LaunchState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshLaunch() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, performance, quality, readiness, executive, ops] = await Promise.all([
        getLaunchSummary(),
        getLaunchPerformance(),
        getLaunchQuality(),
        getLaunchReadiness(),
        getLaunchExecutive(),
        getLaunchOps(),
      ]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        performance: performance.data,
        quality: quality.data,
        readiness: readiness.data,
        executive: executive.data,
        ops: ops.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Launch excellence center is running in deterministic fallback mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withLaunchAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Launch action completed" };
    notify();
    await refreshLaunch();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Launch action could not be completed",
    };
    notify();
  }
}

export function useLaunch() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshLaunch();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshLaunch,
    scan: (target?: string) => withLaunchAction("scan", () => runLaunchScan(target)),
    optimize: (target?: string) => withLaunchAction("optimize", () => runLaunchOptimize(target)),
  };
}
