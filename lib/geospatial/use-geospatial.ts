"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { getCachedResource, markCachedResourceFailure, setCachedResource } from "@/lib/core/cache";
import {
  getGeoLayers,
  getGeoLive,
  postGeoFocus,
  postGeoRoute,
  postGeoTestScenario,
} from "@/lib/geospatial/api";
import type {
  GeoFocusResponse,
  GeoLayerItem,
  GeoLayersResponse,
  GeoLiveResponse,
  GeoRouteResponse,
  GeoTestScenario,
} from "@/lib/geospatial/types";

export type UseGeospatialResult = {
  live: GeoLiveResponse | null;
  layers: GeoLayersResponse | null;
  routePlan: GeoRouteResponse | null;
  focusedZone: GeoFocusResponse | null;
  layerVisibility: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  status: "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  toggleLayer: (layerId: GeoLayerItem["layer_id"]) => void;
  computeRoute: (fromZone: string, toZone: string, mode: string) => Promise<void>;
  focusZone: (zone: string) => Promise<void>;
  runScenario: (scenario: GeoTestScenario) => Promise<void>;
};

type UseGeospatialOptions = {
  enabled?: boolean;
};

export function useGeospatial(options: UseGeospatialOptions = {}): UseGeospatialResult {
  const enabled = options.enabled ?? true;
  const cachedSnapshot = getCachedResource<{
    live: GeoLiveResponse | null;
    layers: GeoLayersResponse | null;
  }>("geo");
  const [live, setLive] = useState<GeoLiveResponse | null>(cachedSnapshot?.data?.live ?? null);
  const [layers, setLayers] = useState<GeoLayersResponse | null>(cachedSnapshot?.data?.layers ?? null);
  const [routePlan, setRoutePlan] = useState<GeoRouteResponse | null>(null);
  const [focusedZone, setFocusedZone] = useState<GeoFocusResponse | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
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

  const applyLayers = useCallback((layerSnapshot: GeoLayersResponse) => {
    setLayers(layerSnapshot);
    setLayerVisibility((current) => {
      const next = { ...current };
      for (const layer of layerSnapshot.layers) {
        if (!(layer.layer_id in next)) {
          next[layer.layer_id] = layer.enabled;
        }
      }
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setLive(null);
      setLayers(null);
      setRoutePlan(null);
      setFocusedZone(null);
      setError(null);
      setStatus("disconnected");
      hasDataRef.current = false;
      return;
    }

    try {
      setLoading(!hasDataRef.current);
      setStatus(hasDataRef.current ? "refreshing" : "loading");
      const liveSnapshot = await getGeoLive();
      setLive(liveSnapshot);

      const cachedLayers = getCachedResource<{
        live: GeoLiveResponse | null;
        layers: GeoLayersResponse | null;
      }>("geo")?.data?.layers ?? null;
      let layerSnapshot = cachedLayers;
      if (!layerSnapshot) {
        layerSnapshot = await getGeoLayers();
        applyLayers(layerSnapshot);
      } else {
        setLayers(layerSnapshot);
      }

      const cacheEntry = setCachedResource("geo", {
        live: liveSnapshot,
        layers: layerSnapshot,
      });
      setLastUpdated(new Date(cacheEntry.updatedAt).toISOString());
      setStatus("ready");
      hasDataRef.current = true;
      setError(null);

      if (cachedLayers && typeof document !== "undefined" && document.visibilityState !== "hidden") {
        void getGeoLayers({ background: true })
          .then((freshLayers) => {
            applyLayers(freshLayers);
            const freshCacheEntry = setCachedResource("geo", {
              live: liveSnapshot,
              layers: freshLayers,
            });
            setLastUpdated(new Date(freshCacheEntry.updatedAt).toISOString());
          })
          .catch(() => undefined);
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load geospatial command state";
      const fallback = getCachedResource<{
        live: GeoLiveResponse | null;
        layers: GeoLayersResponse | null;
      }>("geo");
      markCachedResourceFailure("geo", message);
      if (fallback) {
        setLive(fallback.data.live);
        setLayers(fallback.data.layers);
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
  }, [applyLayers, enabled]);

  const toggleLayer = useCallback((layerId: GeoLayerItem["layer_id"]) => {
    setLayerVisibility((current) => ({
      ...current,
      [layerId]: !current[layerId],
    }));
  }, []);

  const computeRoute = useCallback(
    async (fromZone: string, toZone: string, mode: string) => {
      if (busyAction || !enabled) {
        return;
      }
      setBusyAction("route");
      try {
        const result = await postGeoRoute(fromZone, toZone, mode);
        setRoutePlan(result);
        setError(null);
      } catch (routeError) {
        setError(routeError instanceof Error ? routeError.message : "Failed to compute route");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled],
  );

  const focusZone = useCallback(
    async (zone: string) => {
      if (busyAction || !enabled) {
        return;
      }
      setBusyAction(`focus-${zone}`);
      try {
        const result = await postGeoFocus(zone);
        setFocusedZone(result);
        setError(null);
      } catch (focusError) {
        setError(focusError instanceof Error ? focusError.message : "Failed to focus zone");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled],
  );

  const runScenario = useCallback(
    async (scenario: GeoTestScenario) => {
      if (busyAction || !enabled) {
        return;
      }
      setBusyAction(`scenario-${scenario}`);
      try {
        await postGeoTestScenario(scenario);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (scenarioError) {
        setError(scenarioError instanceof Error ? scenarioError.message : "Failed to run geo scenario");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  useSmartRefresh({
    id: "geo-live",
    tier: "operational",
    sectionId: "intelligence",
    enabled,
    refresh,
  });

  return useMemo(
    () => ({
      live,
      layers,
      routePlan,
      focusedZone,
      layerVisibility,
      loading,
      error,
      busyAction,
      status,
      lastUpdated,
      refresh,
      toggleLayer,
      computeRoute,
      focusZone,
      runScenario,
    }),
    [
      live,
      layers,
      routePlan,
      focusedZone,
      layerVisibility,
      loading,
      error,
      busyAction,
      status,
      lastUpdated,
      refresh,
      toggleLayer,
      computeRoute,
      focusZone,
      runScenario,
    ],
  );
}
