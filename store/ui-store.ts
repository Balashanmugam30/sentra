import { create } from "zustand";

import type { AppTheme } from "@/types/env";
import type { RealtimeEventType } from "@/services/realtime/types";

interface UiState {
  theme: AppTheme;
  isAppLoading: boolean;
  mapZoom: number;
  realtimeConnection: "idle" | "connecting" | "connected" | "degraded" | "simulated";
  lastRealtimeEvent: RealtimeEventType | null;
  feedbackMessage: string | null;
  setTheme: (theme: AppTheme) => void;
  setAppLoading: (value: boolean) => void;
  setMapZoom: (value: number) => void;
  setRealtimeConnection: (value: UiState["realtimeConnection"]) => void;
  setLastRealtimeEvent: (value: RealtimeEventType | null) => void;
  setFeedbackMessage: (value: string | null) => void;
  resetRuntimeState: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  isAppLoading: false,
  mapZoom: 1,
  realtimeConnection: "idle",
  lastRealtimeEvent: null,
  feedbackMessage: null,
  setTheme: (theme) => set({ theme }),
  setAppLoading: (isAppLoading) => set({ isAppLoading }),
  setMapZoom: (mapZoom) => set({ mapZoom }),
  setRealtimeConnection: (realtimeConnection) => set({ realtimeConnection }),
  setLastRealtimeEvent: (lastRealtimeEvent) => set({ lastRealtimeEvent }),
  setFeedbackMessage: (feedbackMessage) => set({ feedbackMessage }),
  resetRuntimeState: () =>
    set({
      isAppLoading: false,
      mapZoom: 1,
      realtimeConnection: "idle",
      lastRealtimeEvent: null,
      feedbackMessage: null,
    }),
}));
