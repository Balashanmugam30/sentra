"use client";

import { useCallback, useEffect, useState } from "react";

import { getOpsCommunications, respondOpsCommunication, sendOpsCommunication } from "@/lib/ops/api";
import { buildLocalCommunicationsSnapshot, normalizeChannels } from "@/lib/ops/communications";
import type { OpsCommunicationsSnapshot, OpsCommsChannelId } from "@/lib/ops/types";

type OpsCommunicationsState = {
  snapshot: OpsCommunicationsSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useCommunications({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<OpsCommunicationsState>({
    snapshot: buildLocalCommunicationsSnapshot(),
    isLoading: enabled,
    isRefreshing: false,
    busyAction: null,
    error: null,
    usingFallback: false,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setState((current) => ({ ...current, isRefreshing: true }));
    try {
      const snapshot = await getOpsCommunications();
      setState((current) => ({
        ...current,
        snapshot,
        isLoading: false,
        isRefreshing: false,
        error: null,
        usingFallback: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local communications model.` : "Using local communications model.",
        usingFallback: true,
      }));
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const send = async (templateId: string, audienceId: string, channels: OpsCommsChannelId[]) => {
    setState((current) => ({ ...current, busyAction: templateId, error: null }));
    try {
      const snapshot = await sendOpsCommunication(templateId, audienceId, normalizeChannels(channels));
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Broadcast staged locally.` : "Broadcast staged locally.",
        usingFallback: true,
      }));
    }
  };

  const respond = async (response: string, personId = "USR-DEMO-COMMS") => {
    setState((current) => ({ ...current, busyAction: response, error: null }));
    try {
      const snapshot = await respondOpsCommunication(personId, response);
      setState((current) => ({ ...current, snapshot, busyAction: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Response staged locally.` : "Response staged locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    refresh,
    send,
    respond,
  };
}
