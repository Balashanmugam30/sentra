"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  connectIntegration,
  getIntegrationHubLogs,
  getIntegrationHubSummary,
  getIntegrationsLive,
  retryFailedIntegrations,
  testHubConnector,
  testIntegration,
} from "@/lib/integrations/api";
import { fallbackIntegrationHubLogs, fallbackIntegrationHubSummary } from "@/lib/integrations/runtime";
import type {
  IntegrationHubLogs,
  IntegrationHubSummary,
  IntegrationTestResponse,
  IntegrationsLiveResponse,
  RetryFailedResponse,
} from "@/lib/integrations/types";

type UseIntegrationsResult = {
  data: IntegrationsLiveResponse | null;
  loading: boolean;
  error: string | null;
  lastTest: IntegrationTestResponse | null;
  lastRetry: RetryFailedResponse | null;
  refresh: () => Promise<void>;
  runTestWebhook: () => Promise<void>;
  retryFailed: () => Promise<void>;
};

export function useIntegrations(): UseIntegrationsResult {
  const [data, setData] = useState<IntegrationsLiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<IntegrationTestResponse | null>(null);
  const [lastRetry, setLastRetry] = useState<RetryFailedResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await getIntegrationsLive();
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
      const receipt = await testIntegration({
        provider: "slack",
        message: "Sentra integration test",
      });
      setLastTest(receipt);
      setError(null);
      await refresh();
    } catch (runError) {
      setError(
        runError instanceof Error ? runError.message : "Failed to test integration",
      );
    }
  }, [refresh]);

  const retryFailed = useCallback(async () => {
    try {
      const result = await retryFailedIntegrations();
      setLastRetry(result);
      setError(null);
      await refresh();
    } catch (retryError) {
      setError(
        retryError instanceof Error
          ? retryError.message
          : "Failed to retry queued integrations",
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

  return {
    data,
    loading,
    error,
    lastTest,
    lastRetry,
    refresh,
    runTestWebhook,
    retryFailed,
  };
}

type IntegrationHubState = {
  summary: IntegrationHubSummary;
  logs: IntegrationHubLogs;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialHubState: IntegrationHubState = {
  summary: fallbackIntegrationHubSummary,
  logs: fallbackIntegrationHubLogs,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let hubState = initialHubState;
let hubRefreshInFlight: Promise<void> | null = null;
const hubSubscribers = new Set<(state: IntegrationHubState) => void>();

function notifyHubSubscribers() {
  hubSubscribers.forEach((subscriber) => subscriber(hubState));
}

export async function refreshIntegrationHub() {
  if (hubRefreshInFlight) {
    return hubRefreshInFlight;
  }
  hubState = { ...hubState, loading: true };
  notifyHubSubscribers();
  hubRefreshInFlight = (async () => {
    try {
      const [summary, logs] = await Promise.all([getIntegrationHubSummary(), getIntegrationHubLogs()]);
      hubState = {
        ...hubState,
        summary: summary.data,
        logs: logs.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      hubState = {
        ...hubState,
        loading: false,
        error: error instanceof Error ? error.message : "Integration hub is running in deterministic fallback mode",
      };
    } finally {
      hubRefreshInFlight = null;
      notifyHubSubscribers();
    }
  })();
  return hubRefreshInFlight;
}

async function withHubAction(label: string, action: () => Promise<{ message?: string }>) {
  hubState = { ...hubState, busyAction: label, error: null };
  notifyHubSubscribers();
  try {
    const response = await action();
    hubState = { ...hubState, busyAction: null, lastAction: response.message ?? "Integration action complete" };
    notifyHubSubscribers();
    await refreshIntegrationHub();
  } catch (error) {
    hubState = {
      ...hubState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Integration action could not be completed",
    };
    notifyHubSubscribers();
  }
}

export function useIntegrationHub() {
  const [state, setState] = useState(hubState);

  useEffect(() => {
    hubSubscribers.add(setState);
    if (hubState.loading && !hubRefreshInFlight) {
      void refreshIntegrationHub();
    }
    return () => {
      hubSubscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshIntegrationHub,
    connect: (provider?: string) => withHubAction("connect", () => connectIntegration(provider)),
    testConnector: (connectorId: string) =>
      withHubAction("test", async () => {
        await testHubConnector(connectorId);
        return { message: "Connector health test completed" };
      }),
  };
}
