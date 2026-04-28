"use client";

import { useEffect } from "react";

import { websocketManager } from "@/services/realtime/websocket-manager";
import type { RealtimeEnvelope, RealtimeEventType } from "@/services/realtime/types";

export function useWebsocketEvent<TPayload>(
  type: RealtimeEventType,
  listener: (message: RealtimeEnvelope<TPayload>) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return websocketManager.subscribe(type, listener);
  }, [enabled, listener, type]);
}
