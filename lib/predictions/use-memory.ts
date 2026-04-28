"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getLearningDecisions,
  getMemorySnapshot,
} from "@/lib/predictions/memory";
import type {
  LearningDecisionResponse,
  MemoryResponse,
} from "@/lib/predictions/types";

type MemoryBundle = {
  memory: MemoryResponse | null;
  learning: LearningDecisionResponse | null;
};

type UseMemoryResult = {
  data: MemoryBundle;
  loading: boolean;
  error: string | null;
};

export function useMemory(): UseMemoryResult {
  const [data, setData] = useState<MemoryBundle>({
    memory: null,
    learning: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMemory = async () => {
      try {
        if (active) {
          setLoading(true);
        }

        const [memory, learning] = await Promise.all([
          getMemorySnapshot(),
          getLearningDecisions(),
        ]);

        if (!active) {
          return;
        }

        setData({ memory, learning });
        setError(null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load adaptive memory intelligence",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMemory();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void loadMemory();
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
