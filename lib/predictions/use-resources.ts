"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getResourceDeployments } from "@/lib/predictions/resources";
import type { ResourceDeploymentResponse } from "@/lib/predictions/types";

type UseResourcesResult = {
  data: ResourceDeploymentResponse | null;
  loading: boolean;
  error: string | null;
};

export function useResources(): UseResourcesResult {
  const [data, setData] = useState<ResourceDeploymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadResources = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getResourceDeployments();

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
            : "Failed to load resource deployment intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadResources();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadResources();
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
