"use client";

import { useCallback, useEffect, useState } from "react";

import { pollingManager } from "@/lib/core/polling-manager";
import {
  getExecutiveAnalytics,
  getReadinessAnalytics,
} from "@/lib/analytics/executive";
import type {
  AnalyticsReadinessResponse,
  ExecutiveAnalyticsResponse,
} from "@/lib/analytics/types";

type UseExecutiveResult = {
  executive: ExecutiveAnalyticsResponse | null;
  readiness: AnalyticsReadinessResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useExecutive(): UseExecutiveResult {
  const [executive, setExecutive] = useState<ExecutiveAnalyticsResponse | null>(null);
  const [readiness, setReadiness] = useState<AnalyticsReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [executiveSnapshot, readinessSnapshot] = await Promise.all([
        getExecutiveAnalytics(),
        getReadinessAnalytics(),
      ]);
      setExecutive(executiveSnapshot);
      setReadiness(readinessSnapshot);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load executive intelligence",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return pollingManager.registerTask({
      id: "analytics-executive",
      tier: "heavy",
      immediate: true,
      run: refresh,
    });
  }, [refresh]);

  return {
    executive,
    readiness,
    loading,
    error,
    refresh,
  };
}
