"use client";

import { restartIncidentSocket, subscribeToIncidents } from "@/lib/socket";

export type LiveSyncModule =
  | "soc"
  | "incidents"
  | "workflows"
  | "approvals"
  | "notifications"
  | "performance"
  | "agents";

export type LiveSyncStatus = "idle" | "connecting" | "connected" | "degraded" | "offline";

export type LiveSyncSnapshot = {
  status: LiveSyncStatus;
  socketHealthScore: number;
  activeSockets: number;
  reconnectAttempts: number;
  lastMessageAt: number | null;
  online: boolean;
  subscribedModules: string[];
};

type ModuleListener<T = unknown> = (payload: T) => void;

type LiveSyncState = {
  channel: BroadcastChannel | null;
  status: LiveSyncStatus;
  activeSockets: number;
  reconnectAttempts: number;
  lastMessageAt: number | null;
  unsubscribeSocket: (() => void) | null;
  moduleListeners: Map<LiveSyncModule, Set<ModuleListener>>;
  listeners: Set<() => void>;
};

declare global {
  interface Window {
    __sentraLiveSync?: LiveSyncState;
  }
}

function getState(): LiveSyncState {
  if (typeof window === "undefined") {
    return {
      status: "idle",
      activeSockets: 0,
      reconnectAttempts: 0,
      lastMessageAt: null,
      unsubscribeSocket: null,
      moduleListeners: new Map(),
      listeners: new Set(),
      channel: null,
    };
  }

  if (!window.__sentraLiveSync) {
    window.__sentraLiveSync = {
      status: "idle",
      activeSockets: 0,
      reconnectAttempts: 0,
      lastMessageAt: null,
      unsubscribeSocket: null,
      moduleListeners: new Map(),
      listeners: new Set(),
      channel: null,
    };
  }

  return window.__sentraLiveSync;
}

function notify() {
  const state = getState();
  for (const listener of state.listeners) {
    listener();
  }
}

function emitModuleUpdate(module: LiveSyncModule, payload: unknown) {
  const listeners = getState().moduleListeners.get(module);
  listeners?.forEach((listener) => listener(payload));
}

function ensureBroadcastChannel(state: LiveSyncState) {
  if (state.channel || typeof BroadcastChannel === "undefined") {
    return;
  }

  state.channel = new BroadcastChannel("sentra-live-sync");
  state.channel.onmessage = (event: MessageEvent<{ source?: string; message?: unknown }>) => {
    if (event.data?.source !== "sentra-tab-sync") {
      return;
    }

    const current = getState();
    current.lastMessageAt = Date.now();
    inferModulesFromMessage(event.data.message).forEach((module) =>
      emitModuleUpdate(module, event.data.message),
    );
    notify();
  };
}

function inferModulesFromMessage(message: unknown): LiveSyncModule[] {
  if (!message || typeof message !== "object") {
    return ["notifications"];
  }

  const type = "type" in message && typeof message.type === "string" ? message.type : "";
  if (type.includes("incident")) {
    return ["incidents", "soc", "performance"];
  }
  if (type.includes("workflow")) {
    return ["workflows", "approvals"];
  }
  if (type.includes("alert")) {
    return ["notifications", "soc"];
  }
  if (type.includes("prediction") || type.includes("agent")) {
    return ["agents"];
  }
  return ["notifications"];
}

function computeSocketHealth(state: LiveSyncState) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return 0;
  }
  if (state.status === "connected") {
    return state.lastMessageAt && Date.now() - state.lastMessageAt < 60_000 ? 96 : 82;
  }
  if (state.status === "connecting") {
    return 58;
  }
  if (state.status === "degraded") {
    return 34;
  }
  return 20;
}

export const liveSyncEngine = {
  start() {
    if (typeof window === "undefined") {
      return;
    }

    const state = getState();
    if (state.unsubscribeSocket) {
      ensureBroadcastChannel(state);
      return;
    }

    ensureBroadcastChannel(state);
    state.status = navigator.onLine ? "connecting" : "offline";
    notify();

    const markOnline = () => {
      const current = getState();
      current.status = current.unsubscribeSocket ? "connected" : "connecting";
      notify();
    };
    const markOffline = () => {
      const current = getState();
      current.status = "offline";
      notify();
    };

    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);

    state.unsubscribeSocket = subscribeToIncidents((message) => {
      const current = getState();
      current.status = "connected";
      current.activeSockets = 1;
      current.lastMessageAt = Date.now();
      inferModulesFromMessage(message).forEach((module) => emitModuleUpdate(module, message));
      current.channel?.postMessage({ source: "sentra-tab-sync", message });
      notify();
    });
    state.activeSockets = 1;
    state.status = navigator.onLine ? "connected" : "offline";
    notify();
  },

  subscribeModule<T>(module: LiveSyncModule, listener: ModuleListener<T>) {
    const state = getState();
    const listeners = state.moduleListeners.get(module) ?? new Set<ModuleListener>();
    listeners.add(listener as ModuleListener);
    state.moduleListeners.set(module, listeners);
    this.start();

    return () => {
      listeners.delete(listener as ModuleListener);
      if (listeners.size === 0) {
        state.moduleListeners.delete(module);
      }
      notify();
    };
  },

  subscribe(listener: () => void) {
    const state = getState();
    state.listeners.add(listener);
    return () => {
      state.listeners.delete(listener);
    };
  },

  getSnapshot(): LiveSyncSnapshot {
    const state = getState();
    return {
      status: state.status,
      socketHealthScore: computeSocketHealth(state),
      activeSockets: state.activeSockets,
      reconnectAttempts: state.reconnectAttempts,
      lastMessageAt: state.lastMessageAt,
      online: typeof navigator === "undefined" ? true : navigator.onLine,
      subscribedModules: [...state.moduleListeners.keys()],
    };
  },

  isRealtimeHealthy() {
    const snapshot = this.getSnapshot();
    return (
      snapshot.status === "connected" &&
      snapshot.socketHealthScore >= 75 &&
      snapshot.lastMessageAt !== null &&
      Date.now() - snapshot.lastMessageAt < 20_000
    );
  },

  restart() {
    const state = getState();
    state.unsubscribeSocket?.();
    state.unsubscribeSocket = null;
    restartIncidentSocket();
    state.activeSockets = 0;
    state.reconnectAttempts = 0;
    state.status = typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "connecting";
    notify();
    this.start();
  },
};
