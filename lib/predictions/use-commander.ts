"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getCommanderDecisions } from "@/lib/predictions/commander";
import type { CommanderResponse } from "@/lib/predictions/types";

type UseCommanderResult = {
  data: CommanderResponse | null;
  loading: boolean;
  error: string | null;
};

export function useCommander(): UseCommanderResult {
  const [data, setData] = useState<CommanderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCommander = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getCommanderDecisions();

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
            : "Failed to load commander decisions",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCommander();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadCommander();
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
