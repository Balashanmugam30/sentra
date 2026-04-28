"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getCommunicationsIntegrations,
  retryFailedDeliveries,
  testWebhook,
} from "@/lib/communications/integrations";
import type {
  CommunicationsIntegrationsResponse,
  RetryFailedResponse,
  TestWebhookResponse,
} from "@/lib/communications/types";

type UseIntegrationsResult = {
  data: CommunicationsIntegrationsResponse | null;
  loading: boolean;
  error: string | null;
  lastTest: TestWebhookResponse | null;
  lastRetry: RetryFailedResponse | null;
  refresh: () => Promise<void>;
  runTestWebhook: () => Promise<void>;
  retryFailed: () => Promise<void>;
};

export function useIntegrations(): UseIntegrationsResult {
  const [data, setData] = useState<CommunicationsIntegrationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<TestWebhookResponse | null>(null);
  const [lastRetry, setLastRetry] = useState<RetryFailedResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await getCommunicationsIntegrations();
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load automation integrations center",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const runTestWebhook = useCallback(async () => {
    try {
      const receipt = await testWebhook({
        event: "alert.created",
        channel: "whatsapp",
      });
      setLastTest(receipt);
      setError(null);
      await refresh();
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Failed to test webhook",
      );
    }
  }, [refresh]);

  const retryFailed = useCallback(async () => {
    try {
      const result = await retryFailedDeliveries();
      setLastRetry(result);
      setError(null);
      await refresh();
    } catch (retryError) {
      setError(
        retryError instanceof Error
          ? retryError.message
          : "Failed to retry queued deliveries",
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

  return { data, loading, error, lastTest, lastRetry, refresh, runTestWebhook, retryFailed };
}
