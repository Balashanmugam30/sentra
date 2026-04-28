"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { getCachedResource, markCachedResourceFailure, setCachedResource } from "@/lib/core/cache";
import {
  getEnvironmentAlerts,
  getEnvironmentForecast,
  getEnvironmentLive,
  postEnvironmentFocus,
  postEnvironmentScenario,
} from "@/lib/environment/api";
import type {
  EnvironmentAlertsResponse,
  EnvironmentForecastResponse,
  EnvironmentLiveResponse,
  EnvironmentTestScenario,
} from "@/lib/environment/types";

export type UseEnvironmentResult = {
  live: EnvironmentLiveResponse | null;
  forecast: EnvironmentForecastResponse | null;
  alerts: EnvironmentAlertsResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  status: "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  runScenario: (scenario: EnvironmentTestScenario) => Promise<void>;
  focusLocation: (lat: number, lng: number) => Promise<void>;
};

type UseEnvironmentOptions = {
  enabled?: boolean;
};

export function useEnvironment(options: UseEnvironmentOptions = {}): UseEnvironmentResult {
  const enabled = options.enabled ?? true;
  const cachedSnapshot = getCachedResource<{
    live: EnvironmentLiveResponse | null;
    forecast: EnvironmentForecastResponse | null;
    alerts: EnvironmentAlertsResponse | null;
  }>("environment");
  const [live, setLive] = useState<EnvironmentLiveResponse | null>(cachedSnapshot?.data?.live ?? null);
  const [forecast, setForecast] = useState<EnvironmentForecastResponse | null>(cachedSnapshot?.data?.forecast ?? null);
  const [alerts, setAlerts] = useState<EnvironmentAlertsResponse | null>(cachedSnapshot?.data?.alerts ?? null);
  const [loading, setLoading] = useState(enabled && !cachedSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected"
  >(cachedSnapshot ? "ready" : "loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    cachedSnapshot?.updatedAt ? new Date(cachedSnapshot.updatedAt).toISOString() : null,
  );
  const hasDataRef = useRef(Boolean(cachedSnapshot));

  const applyDetails = useCallback(
    (forecastState: EnvironmentForecastResponse, alertState: EnvironmentAlertsResponse) => {
      setForecast(forecastState);
      setAlerts(alertState);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLive(null);
      setForecast(null);
      setAlerts(null);
      setLoading(false);
      setError(null);
      setStatus("disconnected");
      hasDataRef.current = false;
      return;
    }

    try {
      setLoading(!hasDataRef.current);
      setStatus(hasDataRef.current ? "refreshing" : "loading");
      const liveState = await getEnvironmentLive();
      setLive(liveState);

      const cachedDetails = getCachedResource<{
        live: EnvironmentLiveResponse | null;
        forecast: EnvironmentForecastResponse | null;
        alerts: EnvironmentAlertsResponse | null;
      }>("environment")?.data ?? null;
      let forecastState = cachedDetails?.forecast ?? null;
      let alertState = cachedDetails?.alerts ?? null;
      const hadCachedDetails = Boolean(forecastState && alertState);
      if (!forecastState || !alertState) {
        [forecastState, alertState] = await Promise.all([
          getEnvironmentForecast(),
          getEnvironmentAlerts(),
        ]);
      }
      applyDetails(forecastState, alertState);

      const cacheEntry = setCachedResource("environment", {
        live: liveState,
        forecast: forecastState,
        alerts: alertState,
      });
      setLastUpdated(new Date(cacheEntry.updatedAt).toISOString());
      setStatus("ready");
      hasDataRef.current = true;
      setError(null);

      if (hadCachedDetails && typeof document !== "undefined" && document.visibilityState !== "hidden") {
        void Promise.all([
          getEnvironmentForecast({ background: true }),
          getEnvironmentAlerts({ background: true }),
        ])
          .then(([freshForecast, freshAlerts]) => {
            applyDetails(freshForecast, freshAlerts);
            const freshCacheEntry = setCachedResource("environment", {
              live: liveState,
              forecast: freshForecast,
              alerts: freshAlerts,
            });
            setLastUpdated(new Date(freshCacheEntry.updatedAt).toISOString());
          })
          .catch(() => undefined);
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load environmental intelligence";
      const fallback = getCachedResource<{
        live: EnvironmentLiveResponse | null;
        forecast: EnvironmentForecastResponse | null;
        alerts: EnvironmentAlertsResponse | null;
      }>("environment");
      markCachedResourceFailure("environment", message);
      if (fallback) {
        setLive(fallback.data.live);
        setForecast(fallback.data.forecast);
        setAlerts(fallback.data.alerts);
        setLastUpdated(new Date(fallback.updatedAt).toISOString());
        setStatus("stale");
        hasDataRef.current = true;
      } else {
        setStatus(message.toLowerCase().includes("timed out") ? "disconnected" : "degraded");
        hasDataRef.current = false;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applyDetails, enabled]);

  const runScenario = useCallback(
    async (scenario: EnvironmentTestScenario) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction(`scenario-${scenario}`);
      try {
        const result = await postEnvironmentScenario(scenario);
        setLive(result.live);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (scenarioError) {
        setError(
          scenarioError instanceof Error
            ? scenarioError.message
            : "Failed to run environment scenario",
        );
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  const focusLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction("focus");
      try {
        const snapshot = await postEnvironmentFocus(lat, lng);
        setLive(snapshot);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (focusError) {
        setError(
          focusError instanceof Error ? focusError.message : "Failed to refocus environment data",
        );
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  useSmartRefresh({
    id: "environment-live",
    tier: "intelligence",
    sectionId: "intelligence",
    enabled,
    refresh,
  });

  return useMemo(
    () => ({
      live,
      forecast,
      alerts,
      loading,
      error,
      busyAction,
      status,
      lastUpdated,
      refresh,
      runScenario,
      focusLocation,
    }),
    [
      alerts,
      busyAction,
      error,
      focusLocation,
      forecast,
      lastUpdated,
      live,
      loading,
      refresh,
      runScenario,
      status,
    ],
  );
}
