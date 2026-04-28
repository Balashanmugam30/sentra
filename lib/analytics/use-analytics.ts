"use client";

import { useCallback, useEffect, useState } from "react";

import { getAnalyticsHubSummary, getAnalyticsKpis, getLiveAnalytics } from "@/lib/analytics/api";
import { fallbackAnalyticsHubSummary } from "@/lib/analytics/runtime";
import { pollingManager } from "@/lib/core/polling-manager";
import type {
  AnalyticsHubSummary,
  AnalyticsKpiCard,
  AnalyticsLiveResponse,
} from "@/lib/analytics/types";

type UseAnalyticsResult = {
  data: AnalyticsLiveResponse | null;
  cards: AnalyticsKpiCard[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAnalytics(): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsLiveResponse | null>(null);
  const [cards, setCards] = useState<AnalyticsKpiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [live, kpis] = await Promise.all([getLiveAnalytics(), getAnalyticsKpis()]);
      setData(live);
      setCards(kpis.cards);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load analytics intelligence",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return pollingManager.registerTask({
      id: "analytics-live",
      tier: "intelligence",
      immediate: true,
      run: refresh,
    });
  }, [refresh]);

  return {
    data,
    cards,
    loading,
    error,
    refresh,
  };
}

type AnalyticsHubState = {
  summary: AnalyticsHubSummary;
  loading: boolean;
  error: string | null;
};

let hubState: AnalyticsHubState = {
  summary: fallbackAnalyticsHubSummary,
  loading: true,
  error: null,
};

let hubRefreshInFlight: Promise<void> | null = null;
const hubSubscribers = new Set<(state: AnalyticsHubState) => void>();

function notifyHub() {
  hubSubscribers.forEach((subscriber) => subscriber(hubState));
}

export async function refreshAnalyticsHub() {
  if (hubRefreshInFlight) {
    return hubRefreshInFlight;
  }
  hubState = { ...hubState, loading: true };
  notifyHub();
  hubRefreshInFlight = (async () => {
    try {
      const response = await getAnalyticsHubSummary();
      hubState = { summary: response.data, loading: false, error: null };
    } catch (error) {
      hubState = {
        ...hubState,
        loading: false,
        error: error instanceof Error ? error.message : "Analytics hub is running in deterministic fallback mode",
      };
    } finally {
      hubRefreshInFlight = null;
      notifyHub();
    }
  })();
  return hubRefreshInFlight;
}

export function useAnalyticsHub() {
  const [state, setState] = useState(hubState);

  useEffect(() => {
    hubSubscribers.add(setState);
    if (hubState.loading && !hubRefreshInFlight) {
      void refreshAnalyticsHub();
    }
    return () => {
      hubSubscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshAnalyticsHub,
  };
}
