"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { getAuditEvents, getAuditExport, getAuditLive, postAuditSearch } from "@/lib/audit/api";
import type {
  AuditEventsResponse,
  AuditExportResponse,
  AuditLiveResponse,
  AuditSearchPayload,
} from "@/lib/audit/types";

type UseAuditResult = {
  live: AuditLiveResponse | null;
  events: AuditEventsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  search: (payload: AuditSearchPayload) => Promise<void>;
  exportLogs: (format: "json" | "csv") => Promise<AuditExportResponse | null>;
};

export function useAudit(): UseAuditResult {
  const [live, setLive] = useState<AuditLiveResponse | null>(null);
  const [events, setEvents] = useState<AuditEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const liveSnapshot = await getAuditLive();
      setLive(liveSnapshot);

      if (!liveSnapshot.summary_only) {
        const eventsSnapshot = await getAuditEvents(1, 25);
        setEvents(eventsSnapshot);
      } else {
        setEvents(null);
      }

      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load audit state");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (payload: AuditSearchPayload) => {
    try {
      setLoading(true);
      const result = await postAuditSearch(payload);
      setEvents(result);
      setError(null);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Failed to search audit state");
    } finally {
      setLoading(false);
    }
  }, []);

  const exportLogs = useCallback(async (format: "json" | "csv") => {
    try {
      return await getAuditExport(format);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export audit logs");
      return null;
    }
  }, []);

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
    live,
    events,
    loading,
    error,
    refresh,
    search,
    exportLogs,
  };
}
