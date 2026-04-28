"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getPerceptionFusion } from "@/lib/perception/fusion";
import type { FusionResponse } from "@/lib/perception/types";

type UseFusionResult = {
  data: FusionResponse | null;
  loading: boolean;
  error: string | null;
};

export function useFusion(): UseFusionResult {
  const [data, setData] = useState<FusionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadFusion = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getPerceptionFusion();

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
            : "Failed to load fusion intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFusion();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadFusion();
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
