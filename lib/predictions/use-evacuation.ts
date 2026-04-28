"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getEvacuationRecommendations } from "@/lib/predictions/evacuation";
import type { EvacuationResponse } from "@/lib/predictions/types";

type UseEvacuationResult = {
  data: EvacuationResponse | null;
  loading: boolean;
  error: string | null;
};

export function useEvacuation(): UseEvacuationResult {
  const [data, setData] = useState<EvacuationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getEvacuationRecommendations();

        if (!active) {
          return;
        }

        setData(nextData);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load evacuation intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRecommendations();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadRecommendations();
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
