"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getLivePerception, getPerceptionDetections } from "@/lib/perception/api";
import type {
  PerceptionDetectionResponse,
  PerceptionLiveResponse,
} from "@/lib/perception/types";

type UsePerceptionResult = {
  live: PerceptionLiveResponse | null;
  detections: PerceptionDetectionResponse | null;
  loading: boolean;
  error: string | null;
};

export function usePerception(): UsePerceptionResult {
  const [live, setLive] = useState<PerceptionLiveResponse | null>(null);
  const [detections, setDetections] = useState<PerceptionDetectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadPerception = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const [nextLive, nextDetections] = await Promise.all([
          getLivePerception(),
          getPerceptionDetections(),
        ]);

        if (!active) {
          return;
        }

        setLive(nextLive);
        setDetections(nextDetections);
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load sensor intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadPerception();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadPerception();
        }, DEFAULT_REFRESH_MS)
      : null;

    return () => {
      active = false;
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, []);

  return { live, detections, loading, error };
}
