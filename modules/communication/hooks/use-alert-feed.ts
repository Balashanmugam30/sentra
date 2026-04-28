"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useWebsocketEvent } from "@/hooks/use-websocket-event";

export function useAlertFeed(listener: (alertId: string) => void) {
  const realtimeEnabled = useFeatureFlag("realtime");

  useWebsocketEvent<{ alert_id: string }>("alert.notification", (message) => {
    listener(message.payload.alert_id);
  }, realtimeEnabled);
}
