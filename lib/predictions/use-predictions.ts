"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getLivePredictions } from "@/lib/predictions/api";
import type { PredictionResponse } from "@/lib/predictions/types";

type UsePredictionsResult = {
  data: PredictionResponse | null;
  loading: boolean;
  error: string | null;
};

export function usePredictions(): UsePredictionsResult {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPredictions = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getLivePredictions();

        if (!active) {
          return;
        }

        setData(nextData);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load predictions");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPredictions();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadPredictions();
        }, DEFAULT_REFRESH_MS)
      : null;

    return () => {
      active = false;
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, []);

  return { data, loading, error };
}
