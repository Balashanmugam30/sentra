"use client";

import { useCallback, useEffect, useState } from "react";

import { getAnalyticsHotspots, getAnalyticsTrends } from "@/lib/analytics/trends";
import { pollingManager } from "@/lib/core/polling-manager";
import type {
  AnalyticsHotspotsResponse,
  AnalyticsTrendsResponse,
} from "@/lib/analytics/types";

type UseTrendsResult = {
  trends: AnalyticsTrendsResponse | null;
  hotspots: AnalyticsHotspotsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useTrends(): UseTrendsResult {
  const [trends, setTrends] = useState<AnalyticsTrendsResponse | null>(null);
  const [hotspots, setHotspots] = useState<AnalyticsHotspotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [trendSnapshot, hotspotSnapshot] = await Promise.all([
        getAnalyticsTrends(),
        getAnalyticsHotspots(),
      ]);
      setTrends(trendSnapshot);
      setHotspots(hotspotSnapshot);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load trend intelligence",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return pollingManager.registerTask({
      id: "analytics-trends",
      tier: "intelligence",
      immediate: true,
      run: refresh,
    });
  }, [refresh]);

  return {
    trends,
    hotspots,
    loading,
    error,
    refresh,
  };
}
