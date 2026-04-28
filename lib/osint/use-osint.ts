"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { getCachedResource, markCachedResourceFailure, setCachedResource } from "@/lib/core/cache";
import {
  getOsintHistory,
  getOsintLive,
  getOsintNews,
  getOsintRumors,
  postOsintFocus,
  postOsintScenario,
} from "@/lib/osint/api";
import type {
  OsintHistoryResponse,
  OsintLiveResponse,
  OsintNewsResponse,
  OsintRumorResponse,
  OsintScenario,
} from "@/lib/osint/types";

export type UseOsintResult = {
  live: OsintLiveResponse | null;
  news: OsintNewsResponse | null;
  rumors: OsintRumorResponse | null;
  history: OsintHistoryResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  status: "loading" | "refreshing" | "ready" | "stale" | "degraded" | "disconnected";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  runScenario: (scenario: OsintScenario) => Promise<void>;
  focusKeyword: (keyword: string) => Promise<void>;
};

type UseOsintOptions = {
  enabled?: boolean;
};

export function useOsint(options: UseOsintOptions = {}): UseOsintResult {
  const enabled = options.enabled ?? true;
  const cachedSnapshot = getCachedResource<{
    live: OsintLiveResponse | null;
    news: OsintNewsResponse | null;
    rumors: OsintRumorResponse | null;
    history: OsintHistoryResponse | null;
  }>("osint");
  const [live, setLive] = useState<OsintLiveResponse | null>(cachedSnapshot?.data?.live ?? null);
  const [news, setNews] = useState<OsintNewsResponse | null>(cachedSnapshot?.data?.news ?? null);
  const [rumors, setRumors] = useState<OsintRumorResponse | null>(cachedSnapshot?.data?.rumors ?? null);
  const [history, setHistory] = useState<OsintHistoryResponse | null>(cachedSnapshot?.data?.history ?? null);
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
      newsState: OsintNewsResponse,
      rumorState: OsintRumorResponse,
      historyState: OsintHistoryResponse,
    ) => {
      setNews(newsState);
      setRumors(rumorState);
      setHistory(historyState);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLive(null);
      setNews(null);
      setRumors(null);
      setHistory(null);
      setLoading(false);
      setError(null);
      setStatus("disconnected");
      hasDataRef.current = false;
      return;
    }
    try {
      setLoading(!hasDataRef.current);
      setStatus(hasDataRef.current ? "refreshing" : "loading");
      const liveState = await getOsintLive();
      setLive(liveState);

      const cachedDetails = getCachedResource<{
        live: OsintLiveResponse | null;
        news: OsintNewsResponse | null;
        rumors: OsintRumorResponse | null;
        history: OsintHistoryResponse | null;
      }>("osint")?.data ?? null;
      let newsState = cachedDetails?.news ?? null;
      let rumorState = cachedDetails?.rumors ?? null;
      let historyState = cachedDetails?.history ?? null;
      const hadCachedDetails = Boolean(newsState && rumorState && historyState);
      if (!newsState || !rumorState || !historyState) {
        [newsState, rumorState, historyState] = await Promise.all([
          getOsintNews(),
          getOsintRumors(),
          getOsintHistory(),
        ]);
      }
      applyDetails(newsState, rumorState, historyState);

      const cacheEntry = setCachedResource("osint", {
        live: liveState,
        news: newsState,
        rumors: rumorState,
        history: historyState,
      });
      setLastUpdated(new Date(cacheEntry.updatedAt).toISOString());
      setStatus("ready");
      hasDataRef.current = true;
      setError(null);

      if (hadCachedDetails && typeof document !== "undefined" && document.visibilityState !== "hidden") {
        void Promise.all([
          getOsintNews({ background: true }),
          getOsintRumors({ background: true }),
          getOsintHistory({ background: true }),
        ])
          .then(([freshNews, freshRumors, freshHistory]) => {
            applyDetails(freshNews, freshRumors, freshHistory);
            const freshCacheEntry = setCachedResource("osint", {
              live: liveState,
              news: freshNews,
              rumors: freshRumors,
              history: freshHistory,
            });
            setLastUpdated(new Date(freshCacheEntry.updatedAt).toISOString());
          })
          .catch(() => undefined);
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load open intelligence";
      const fallback = getCachedResource<{
        live: OsintLiveResponse | null;
        news: OsintNewsResponse | null;
        rumors: OsintRumorResponse | null;
        history: OsintHistoryResponse | null;
      }>("osint");
      markCachedResourceFailure("osint", message);
      if (fallback) {
        setLive(fallback.data.live);
        setNews(fallback.data.news);
        setRumors(fallback.data.rumors);
        setHistory(fallback.data.history);
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
    async (scenario: OsintScenario) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction(`scenario-${scenario}`);
      try {
        const result = await postOsintScenario(scenario);
        setLive(result.live);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (scenarioError) {
        setError(scenarioError instanceof Error ? scenarioError.message : "Failed to run OSINT scenario");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  const focusKeyword = useCallback(
    async (keyword: string) => {
      if (!enabled || busyAction !== null) {
        return;
      }
      setBusyAction("focus");
      try {
        const result = await postOsintFocus(keyword);
        setLive(result);
        setBusyAction(null);
        await refresh();
        setError(null);
      } catch (focusError) {
        setError(focusError instanceof Error ? focusError.message : "Failed to focus OSINT keyword");
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, enabled, refresh],
  );

  useSmartRefresh({
    id: "osint-live",
    tier: "intelligence",
    sectionId: "intelligence",
    enabled,
    refresh,
  });

  return useMemo(
    () => ({
      live,
      news,
      rumors,
      history,
      loading,
      error,
      busyAction,
      status,
      lastUpdated,
      refresh,
      runScenario,
      focusKeyword,
    }),
    [
      busyAction,
      error,
      focusKeyword,
      history,
      lastUpdated,
      live,
      loading,
      news,
      refresh,
      rumors,
      runScenario,
      status,
    ],
  );
}
