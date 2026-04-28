"use client";

import { useCallback, useEffect, useState } from "react";

import { HEAVY_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { runScanAndInject } from "@/lib/perception/injector";
import type { ScanAndInjectResponse } from "@/lib/perception/types";

type UseInjectorResult = {
  data: ScanAndInjectResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  runManualScan: () => Promise<void>;
};

export function useInjector(): UseInjectorResult {
  const [data, setData] = useState<ScanAndInjectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeScan = useCallback(async () => {
    try {
      setLoading(true);
      const nextData = await runScanAndInject();
      setData(nextData);
      setError(null);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Failed to run autonomous response scan",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void executeScan();

    const interval = LIVE_POLLING_ENABLED
      ? window.setInterval(() => {
          void executeScan();
        }, HEAVY_REFRESH_MS)
      : null;

    return () => {
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [executeScan]);

  return {
    data,
    loading,
    error,
    refresh: executeScan,
    runManualScan: executeScan,
  };
}
