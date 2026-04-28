"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getCommunications } from "@/lib/predictions/communications";
import type { CommunicationResponse } from "@/lib/predictions/types";

type UseCommunicationsResult = {
  data: CommunicationResponse | null;
  loading: boolean;
  error: string | null;
};

export function useCommunications(): UseCommunicationsResult {
  const [data, setData] = useState<CommunicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCommunications = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getCommunications();

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
            : "Failed to load communications intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCommunications();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadCommunications();
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
