"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useWebsocketEvent } from "@/hooks/use-websocket-event";
import { mapRealtimeEventToState } from "@/services/realtime/event-mapper";

export function useIncidentStream() {
  const realtimeEnabled = useFeatureFlag("realtime");

  useWebsocketEvent("incident.update", mapRealtimeEventToState, realtimeEnabled);
}
