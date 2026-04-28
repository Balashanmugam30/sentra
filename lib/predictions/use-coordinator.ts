"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getCoordinatorIntelligence } from "@/lib/predictions/coordinator";
import type { CoordinatorResponse } from "@/lib/predictions/types";

type UseCoordinatorResult = {
  data: CoordinatorResponse | null;
  loading: boolean;
  error: string | null;
};

export function useCoordinator(): UseCoordinatorResult {
  const [data, setData] = useState<CoordinatorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCoordinator = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getCoordinatorIntelligence();

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
            : "Failed to load coordination intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCoordinator();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadCoordinator();
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
