"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getCommunicationsAcks,
  respondBulkTest,
  respondToAlert,
} from "@/lib/communications/acks";
import type {
  AckBulkTestResponse,
  AckRespondResponse,
  AckStatusInput,
  CommunicationsAcksResponse,
} from "@/lib/communications/types";

type UseAcksResult = {
  data: CommunicationsAcksResponse | null;
  loading: boolean;
  error: string | null;
  lastResponse: AckRespondResponse | null;
  lastBulk: AckBulkTestResponse | null;
  refresh: () => Promise<void>;
  submitQuickResponse: (status: AckStatusInput) => Promise<void>;
  bulkInject: () => Promise<void>;
};

export function useAcks(): UseAcksResult {
  const [data, setData] = useState<CommunicationsAcksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AckRespondResponse | null>(null);
  const [lastBulk, setLastBulk] = useState<AckBulkTestResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await getCommunicationsAcks();
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load live response feedback",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuickResponse = useCallback(
    async (status: AckStatusInput) => {
      const targetZone = data?.hotspots?.[0] ?? "Zone 2";
      const messageMap: Record<AckStatusInput, string> = {
        SAFE: "Reached safe area",
        NEED_HELP: "Need assistance near corridor",
        TRAPPED: "Unable to exit current area",
        EVACUATED: "Evacuation completed",
        ON_SITE: "Responder on site",
        TEAM_DEPLOYED: "Team deployed to zone",
        MEDICAL_REQUIRED: "Medical support needed",
        FALSE_ALARM: "Conditions appear stable",
      };

      try {
        const result = await respondToAlert({
          zone: targetZone,
          role: "occupants",
          status,
          message: messageMap[status],
        });
        setLastResponse(result);
        setError(null);
        await refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Failed to submit quick response",
        );
      }
    },
    [data?.hotspots, refresh],
  );

  const bulkInject = useCallback(async () => {
    const targetZone = data?.hotspots?.[0] ?? "Zone 2";
    try {
      const result = await respondBulkTest({
        zone: targetZone,
        count: 5,
        status: "NEED_HELP",
      });
      setLastBulk(result);
      setError(null);
      await refresh();
    } catch (bulkError) {
      setError(
        bulkError instanceof Error
          ? bulkError.message
          : "Failed to inject bulk responses",
      );
    }
  }, [data?.hotspots, refresh]);

  useEffect(() => {
    void refresh();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void refresh();
        }, DEFAULT_REFRESH_MS)
      : null;

    return () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [refresh]);

  return {
    data,
    loading,
    error,
    lastResponse,
    lastBulk,
    refresh,
    submitQuickResponse,
    bulkInject,
  };
}
