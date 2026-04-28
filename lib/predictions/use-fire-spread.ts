"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getFireSpreadForecast } from "@/lib/predictions/fire-spread";
import type { FireSpreadResponse } from "@/lib/predictions/types";

type UseFireSpreadResult = {
  data: FireSpreadResponse | null;
  loading: boolean;
  error: string | null;
};

export function useFireSpread(): UseFireSpreadResult {
  const [data, setData] = useState<FireSpreadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadForecast = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getFireSpreadForecast();

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
            : "Failed to load fire spread forecast",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadForecast();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadForecast();
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
