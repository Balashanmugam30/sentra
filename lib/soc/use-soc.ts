"use client";

import { useCallback, useRef, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { getCachedResource, markCachedResourceFailure, setCachedResource } from "@/lib/core/cache";
import {
  getSocDetections,
  getSocHealth,
  getSocIncidents,
  getSocLive,
  postSocResolveIncident,
  postSocRunScan,
  postSocTestAttack,
} from "@/lib/soc/api";
import type {
  SocDetectionsResponse,
  SocHealthResponse,
  SocIncidentsResponse,
  SocLiveResponse,
  SocTestAttackScenario,
} from "@/lib/soc/types";

type SocLoadStatus = "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected";

export type UseSocResult = {
  live: SocLiveResponse | null;
  health: SocHealthResponse | null;
  detections: SocDetectionsResponse | null;
  incidents: SocIncidentsResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  status: SocLoadStatus;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  runScan: () => Promise<void>;
  resolveIncident: (incidentId: string) => Promise<void>;
  testAttack: (scenario: SocTestAttackScenario) => Promise<void>;
};

type UseSocOptions = {
  enabled?: boolean;
};

export function useSoc(options: UseSocOptions = {}): UseSocResult {
  const enabled = options.enabled ?? true;
  const cachedSnapshot = getCachedResource<{
    live: SocLiveResponse | null;
    health: SocHealthResponse | null;
    detections: SocDetectionsResponse | null;
    incidents: SocIncidentsResponse | null;
  }>("soc");
  const [live, setLive] = useState<SocLiveResponse | null>(cachedSnapshot?.data?.live ?? null);
  const [health, setHealth] = useState<SocHealthResponse | null>(cachedSnapshot?.data?.health ?? null);
  const [detections, setDetections] = useState<SocDetectionsResponse | null>(cachedSnapshot?.data?.detections ?? null);
  const [incidents, setIncidents] = useState<SocIncidentsResponse | null>(cachedSnapshot?.data?.incidents ?? null);
  const [loading, setLoading] = useState(enabled && !cachedSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [status, setStatus] = useState<SocLoadStatus>(cachedSnapshot ? "ready" : "loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    cachedSnapshot?.updatedAt ? new Date(cachedSnapshot.updatedAt).toISOString() : null,
  );
  const hasDataRef = useRef(Boolean(cachedSnapshot));

  const applySnapshot = useCallback(
    (snapshot: {
      live: SocLiveResponse | null;
      health: SocHealthResponse | null;
      detections: SocDetectionsResponse | null;
      incidents: SocIncidentsResponse | null;
    }) => {
      setLive(snapshot.live);
      setHealth(snapshot.health);
      setDetections(snapshot.detections);
      setIncidents(snapshot.incidents);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setLive(null);
      setHealth(null);
      setDetections(null);
      setIncidents(null);
      setError(null);
      setStatus("disconnected");
      hasDataRef.current = false;
      return;
    }
    try {
      setLoading(!hasDataRef.current);
      setStatus(hasDataRef.current ? "refreshing" : "loading");
      const liveSnapshot = await getSocLive();
      const nextSnapshot: {
        live: SocLiveResponse | null;
        health: SocHealthResponse | null;
        detections: SocDetectionsResponse | null;
        incidents: SocIncidentsResponse | null;
      } = {
        live: liveSnapshot,
        health: null,
        detections: null,
        incidents: null,
      };

      if (!liveSnapshot.summary_only) {
        const [healthSnapshot, detectionsSnapshot, incidentsSnapshot] = await Promise.all([
          getSocHealth(),
          getSocDetections(),
          getSocIncidents(),
        ]);
        nextSnapshot.health = healthSnapshot;
        nextSnapshot.detections = detectionsSnapshot;
        nextSnapshot.incidents = incidentsSnapshot;
      }

      applySnapshot(nextSnapshot);
      const cacheEntry = setCachedResource("soc", nextSnapshot);
      setLastUpdated(new Date(cacheEntry.updatedAt).toISOString());
      setStatus("ready");
      hasDataRef.current = true;
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load SOC state";
      const fallback = getCachedResource<{
        live: SocLiveResponse | null;
        health: SocHealthResponse | null;
        detections: SocDetectionsResponse | null;
        incidents: SocIncidentsResponse | null;
      }>("soc");
      markCachedResourceFailure("soc", message);
      if (fallback) {
        applySnapshot(fallback.data);
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
  }, [applySnapshot, enabled]);

  const runScan = useCallback(async () => {
    if (busyAction || !enabled) {
      return;
    }
    setBusyAction("scan");
    try {
      await postSocRunScan();
      await refresh();
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Failed to run SOC scan");
    } finally {
      setBusyAction(null);
    }
  }, [busyAction, enabled, refresh]);

  const resolveIncident = useCallback(
    async (incidentId: string) => {
      if (busyAction || !enabled) {
        return;
      }
      setBusyAction(`resolve-${incidentId}`);
      try {
        await postSocResolveIncident(incidentId);
        await refresh();
      } catch (resolveError) {
        setError(resolveError instanceof Error ? resolveError.message : "Failed to resolve incident");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  const testAttack = useCallback(
    async (scenario: SocTestAttackScenario) => {
      if (busyAction || !enabled) {
        return;
      }
      setBusyAction(`test-${scenario}`);
      try {
        await postSocTestAttack(scenario);
        setBusyAction(null);
        await refresh();
      } catch (attackError) {
        setError(attackError instanceof Error ? attackError.message : "Failed to simulate SOC attack");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  useSmartRefresh({
    id: "soc-live",
    tier: "critical",
    sectionId: "security",
    enabled,
    realtimePreferred: false,
    refresh,
  });

  return {
    live,
    health,
    detections,
    incidents,
    loading,
    error,
    busyAction,
    status,
    lastUpdated,
    refresh,
    runScan,
    resolveIncident,
    testAttack,
  };
}
