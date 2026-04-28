"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { getCachedResource, markCachedResourceFailure, setCachedResource } from "@/lib/core/cache";
import {
  getPublicSafetyLive,
  getPublicSafetyTraffic,
  getPublicSafetyTransit,
  getPublicSafetyUtilities,
  postPublicSafetyRoutePriority,
  postPublicSafetyScenario,
} from "@/lib/public-safety/api";
import type {
  PublicSafetyLiveResponse,
  PublicSafetyRoutePriorityResponse,
  PublicSafetyScenario,
  PublicSafetyTrafficResponse,
  PublicSafetyTransitResponse,
  PublicSafetyUtilityResponse,
} from "@/lib/public-safety/types";

export type UsePublicSafetyResult = {
  live: PublicSafetyLiveResponse | null;
  traffic: PublicSafetyTrafficResponse | null;
  transit: PublicSafetyTransitResponse | null;
  utilities: PublicSafetyUtilityResponse | null;
  priorityRoute: PublicSafetyRoutePriorityResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  status: "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  runScenario: (scenario: PublicSafetyScenario) => Promise<void>;
  prioritizeRoute: (
    vehicleType: "ambulance" | "fire" | "police",
    fromZone: string,
    toZone: string,
  ) => Promise<void>;
};

type UsePublicSafetyOptions = {
  enabled?: boolean;
};

export function usePublicSafety(options: UsePublicSafetyOptions = {}): UsePublicSafetyResult {
  const enabled = options.enabled ?? true;
  const cachedSnapshot = getCachedResource<{
    live: PublicSafetyLiveResponse | null;
    traffic: PublicSafetyTrafficResponse | null;
    transit: PublicSafetyTransitResponse | null;
    utilities: PublicSafetyUtilityResponse | null;
  }>("public-safety");
  const [live, setLive] = useState<PublicSafetyLiveResponse | null>(cachedSnapshot?.data?.live ?? null);
  const [traffic, setTraffic] = useState<PublicSafetyTrafficResponse | null>(cachedSnapshot?.data?.traffic ?? null);
  const [transit, setTransit] = useState<PublicSafetyTransitResponse | null>(cachedSnapshot?.data?.transit ?? null);
  const [utilities, setUtilities] = useState<PublicSafetyUtilityResponse | null>(cachedSnapshot?.data?.utilities ?? null);
  const [priorityRoute, setPriorityRoute] = useState<PublicSafetyRoutePriorityResponse | null>(null);
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
    (
      trafficState: PublicSafetyTrafficResponse,
      transitState: PublicSafetyTransitResponse,
      utilityState: PublicSafetyUtilityResponse,
    ) => {
      setTraffic(trafficState);
      setTransit(transitState);
      setUtilities(utilityState);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLive(null);
      setTraffic(null);
      setTransit(null);
      setUtilities(null);
      setPriorityRoute(null);
      setLoading(false);
      setError(null);
      setStatus("disconnected");
      hasDataRef.current = false;
      return;
    }

    try {
      setLoading(!hasDataRef.current);
      setStatus(hasDataRef.current ? "refreshing" : "loading");
      const liveState = await getPublicSafetyLive();
      setLive(liveState);

      const cachedDetails = getCachedResource<{
        live: PublicSafetyLiveResponse | null;
        traffic: PublicSafetyTrafficResponse | null;
        transit: PublicSafetyTransitResponse | null;
        utilities: PublicSafetyUtilityResponse | null;
      }>("public-safety")?.data ?? null;
      let trafficState = cachedDetails?.traffic ?? null;
      let transitState = cachedDetails?.transit ?? null;
      let utilityState = cachedDetails?.utilities ?? null;
      const hadCachedDetails = Boolean(trafficState && transitState && utilityState);
      if (!trafficState || !transitState || !utilityState) {
        [trafficState, transitState, utilityState] = await Promise.all([
          getPublicSafetyTraffic(),
          getPublicSafetyTransit(),
          getPublicSafetyUtilities(),
        ]);
      }
      applyDetails(trafficState, transitState, utilityState);

      const cacheEntry = setCachedResource("public-safety", {
        live: liveState,
        traffic: trafficState,
        transit: transitState,
        utilities: utilityState,
      });
      setLastUpdated(new Date(cacheEntry.updatedAt).toISOString());
      setStatus("ready");
      hasDataRef.current = true;
      setError(null);

      if (hadCachedDetails && typeof document !== "undefined" && document.visibilityState !== "hidden") {
        void Promise.all([
          getPublicSafetyTraffic({ background: true }),
          getPublicSafetyTransit({ background: true }),
          getPublicSafetyUtilities({ background: true }),
        ])
          .then(([freshTraffic, freshTransit, freshUtilities]) => {
            applyDetails(freshTraffic, freshTransit, freshUtilities);
            const freshCacheEntry = setCachedResource("public-safety", {
              live: liveState,
              traffic: freshTraffic,
              transit: freshTransit,
              utilities: freshUtilities,
            });
            setLastUpdated(new Date(freshCacheEntry.updatedAt).toISOString());
          })
          .catch(() => undefined);
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load public safety intelligence";
      const fallback = getCachedResource<{
        live: PublicSafetyLiveResponse | null;
        traffic: PublicSafetyTrafficResponse | null;
        transit: PublicSafetyTransitResponse | null;
        utilities: PublicSafetyUtilityResponse | null;
      }>("public-safety");
      markCachedResourceFailure("public-safety", message);
      if (fallback) {
        setLive(fallback.data.live);
        setTraffic(fallback.data.traffic);
        setTransit(fallback.data.transit);
        setUtilities(fallback.data.utilities);
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
    async (scenario: PublicSafetyScenario) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction(`scenario-${scenario}`);
      try {
        const response = await postPublicSafetyScenario(scenario);
        setLive(response.live);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (scenarioError) {
        setError(
          scenarioError instanceof Error
            ? scenarioError.message
            : "Failed to run public safety scenario",
        );
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  const prioritizeRoute = useCallback(
    async (
      vehicleType: "ambulance" | "fire" | "police",
      fromZone: string,
      toZone: string,
    ) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction(`priority-${vehicleType}`);
      try {
        const route = await postPublicSafetyRoutePriority(vehicleType, fromZone, toZone);
        setPriorityRoute(route);
        setError(null);
      } catch (routeError) {
        setError(
          routeError instanceof Error
            ? routeError.message
            : "Failed to compute public safety priority route",
        );
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled],
  );

  useSmartRefresh({
    id: "public-safety-live",
    tier: "intelligence",
    sectionId: "intelligence",
    enabled,
    refresh,
  });

  return useMemo(
    () => ({
      live,
      traffic,
      transit,
      utilities,
      priorityRoute,
      loading,
      error,
      busyAction,
      status,
      lastUpdated,
      refresh,
      runScenario,
      prioritizeRoute,
    }),
    [
      busyAction,
      error,
      live,
      loading,
      lastUpdated,
      prioritizeRoute,
      priorityRoute,
      refresh,
      runScenario,
      status,
      traffic,
      transit,
      utilities,
    ],
  );
}
