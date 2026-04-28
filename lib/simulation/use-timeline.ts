"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getSimulationTimeline } from "@/lib/simulation/timeline";
import type { TimelineResponse } from "@/lib/simulation/types";

type UseTimelineResult = {
  data: TimelineResponse | null;
  loading: boolean;
  error: string | null;
};

export function useTimeline(): UseTimelineResult {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTimeline = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getSimulationTimeline();

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
            : "Failed to load timeline forecast",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTimeline();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadTimeline();
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
