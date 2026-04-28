"use client";

import { useCallback, useEffect, useState } from "react";

import { getAnalyticsBoardroom, getAnalyticsForecast } from "@/lib/analytics/forecast";
import { pollingManager } from "@/lib/core/polling-manager";
import type {
  AnalyticsBoardroomResponse,
  AnalyticsForecastResponse,
} from "@/lib/analytics/types";

type ForecastScope = "forecast-only" | "forecast-with-boardroom";

type UseForecastResult = {
  forecast: AnalyticsForecastResponse | null;
  boardroom: AnalyticsBoardroomResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useForecastScoped(scope: ForecastScope): UseForecastResult {
  const [forecast, setForecast] = useState<AnalyticsForecastResponse | null>(null);
  const [boardroom, setBoardroom] = useState<AnalyticsBoardroomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const forecastSnapshot = await getAnalyticsForecast();
      const boardroomSnapshot =
        scope === "forecast-with-boardroom" ? await getAnalyticsBoardroom() : null;
      setForecast(forecastSnapshot);
      setBoardroom(boardroomSnapshot);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load predictive executive intelligence",
      );
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    return pollingManager.registerTask({
      id: `analytics-forecast-${scope}`,
      tier: "heavy",
      immediate: true,
      run: refresh,
    });
  }, [refresh, scope]);

  return {
    forecast,
    boardroom,
    loading,
    error,
    refresh,
  };
}
