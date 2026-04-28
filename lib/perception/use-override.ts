"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getPerceptionOverrides } from "@/lib/perception/override";
import type { OverrideResponse } from "@/lib/perception/types";

type UseOverrideResult = {
  data: OverrideResponse | null;
  loading: boolean;
  error: string | null;
};

export function useOverride(): UseOverrideResult {
  const [data, setData] = useState<OverrideResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOverrides = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getPerceptionOverrides();

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
            : "Failed to load adaptive decision overrides",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOverrides();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadOverrides();
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
