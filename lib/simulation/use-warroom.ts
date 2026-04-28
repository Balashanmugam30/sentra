"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getWarRoomState } from "@/lib/simulation/warroom";
import type { WarRoomResponse } from "@/lib/simulation/types";

type UseWarRoomResult = {
  data: WarRoomResponse | null;
  loading: boolean;
  error: string | null;
};

export function useWarRoom(): UseWarRoomResult {
  const [data, setData] = useState<WarRoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadWarRoom = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const nextData = await getWarRoomState();

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
            : "Failed to load AI war room state",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadWarRoom();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadWarRoom();
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
