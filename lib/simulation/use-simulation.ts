"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getLiveSimulation } from "@/lib/simulation/api";
import type { SimulationResponse } from "@/lib/simulation/types";

type UseSimulationResult = {
  data: SimulationResponse | null;
  loading: boolean;
  error: string | null;
};

export function useSimulation(): UseSimulationResult {
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSimulation = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getLiveSimulation();

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
            : "Failed to load digital twin state",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSimulation();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadSimulation();
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
