"use client";

import { useEffect } from "react";

import { pollingManager, type PollingTier } from "@/lib/core/polling-manager";

type UseSmartRefreshOptions = {
  id: string;
  tier: PollingTier;
  enabled?: boolean;
  sectionId?: string;
  realtimePreferred?: boolean;
  immediate?: boolean;
  refresh: () => Promise<void>;
};

export function useSmartRefresh({
  id,
  tier,
  enabled = true,
  sectionId,
  realtimePreferred = true,
  immediate = true,
  refresh,
}: UseSmartRefreshOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return pollingManager.registerTask({
      id,
      tier,
      sectionId,
      realtimePreferred,
      immediate,
      enabled: () => enabled,
      run: refresh,
    });
  }, [enabled, id, immediate, refresh, realtimePreferred, sectionId, tier]);
}
