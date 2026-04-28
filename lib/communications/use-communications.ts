"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getLiveCommunications, sendTestAlert } from "@/lib/communications/api";
import type {
  CommunicationsLiveResponse,
  SendTestResponse,
} from "@/lib/communications/types";

type UseEnterpriseCommunicationsResult = {
  data: CommunicationsLiveResponse | null;
  loading: boolean;
  error: string | null;
  lastTest: SendTestResponse | null;
  refresh: () => Promise<void>;
  sendTest: () => Promise<void>;
};

export function useEnterpriseCommunications(): UseEnterpriseCommunicationsResult {
  const [data, setData] = useState<CommunicationsLiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<SendTestResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await getLiveCommunications();
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load communications hub",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    try {
      const receipt = await sendTestAlert({
        channel: "sms",
        target: "Zone 2",
        message: "Test alert",
      });
      setLastTest(receipt);
      setError(null);
      await refresh();
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send test alert",
      );
    }
  }, [refresh]);

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

  return { data, loading, error, lastTest, refresh, sendTest };
}
