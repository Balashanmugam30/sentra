"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getRoleCommunications, sendRoleTest } from "@/lib/communications/roles";
import type {
  RoleCommunicationsResponse,
  RoleTestResponse,
} from "@/lib/communications/types";

type UseRoleMessagesResult = {
  data: RoleCommunicationsResponse | null;
  loading: boolean;
  error: string | null;
  lastTest: RoleTestResponse | null;
  refresh: () => Promise<void>;
  sendTest: () => Promise<void>;
};

export function useRoleMessages(): UseRoleMessagesResult {
  const [data, setData] = useState<RoleCommunicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<RoleTestResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await getRoleCommunications();
      setData(nextData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load role messaging center",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    try {
      const receipt = await sendRoleTest({
        role: "executives",
        zone: "HQ",
      });
      setLastTest(receipt);
      setError(null);
      await refresh();
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send role test",
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
