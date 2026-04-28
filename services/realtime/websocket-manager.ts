"use client";

import { appConfig } from "@/config";
import { logger } from "@/lib/logger";
import { captureWarning } from "@/lib/telemetry";
import { useUiStore } from "@/store/ui-store";

import type { RealtimeEnvelope, RealtimeEventType } from "./types";

type Listener<TPayload = unknown> = (message: RealtimeEnvelope<TPayload>) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempt = 0;
  private listeners = new Map<RealtimeEventType, Set<Listener>>();
  private statusListeners = new Set<() => void>();
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private lastMessageAt: number | null = null;

  private notifyStatus() {
    for (const listener of this.statusListeners) {
      listener();
    }
  }

  connect(token: string) {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.shouldReconnect = true;
    useUiStore.getState().setRealtimeConnection("connecting");
    this.notifyStatus();
    this.socket = new WebSocket(this.resolveSocketUrl(token));

    this.socket.addEventListener("open", () => {
      this.reconnectAttempt = 0;
      useUiStore.getState().setRealtimeConnection("connected");
      this.notifyStatus();
      logger.info("Realtime connection opened");
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const parsed = JSON.parse(event.data) as RealtimeEnvelope;
        this.lastMessageAt = Date.now();
        useUiStore.getState().setLastRealtimeEvent(parsed.type);
        const eventListeners = this.listeners.get(parsed.type);
        eventListeners?.forEach((listener) => listener(parsed));
      } catch (error) {
        captureWarning("Realtime payload parsing failed", {
          component: "WebSocketManager",
          metadata: {
            error,
          },
        });
      }
    });

    this.socket.addEventListener("close", () => {
      useUiStore.getState().setRealtimeConnection("degraded");
      this.notifyStatus();
      captureWarning("Realtime connection closed", {
        component: "WebSocketManager",
      });
      if (this.shouldReconnect) {
        this.scheduleReconnect(token);
      }
    });

    this.socket.addEventListener("error", () => {
      useUiStore.getState().setRealtimeConnection("degraded");
      this.notifyStatus();
      logger.warn("Realtime connection error");
      captureWarning("Realtime connection error", {
        component: "WebSocketManager",
      });
    });
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
    useUiStore.getState().setRealtimeConnection("idle");
    this.notifyStatus();
  }

  send(message: RealtimeEnvelope) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      logger.warn("Realtime message dropped because socket is unavailable", {
        type: message.type,
      });
      return;
    }

    this.socket.send(JSON.stringify(message));
  }

  subscribe<TPayload>(type: RealtimeEventType, listener: Listener<TPayload>) {
    const listeners = this.listeners.get(type) ?? new Set<Listener>();
    listeners.add(listener as Listener);
    this.listeners.set(type, listeners);

    return () => {
      listeners.delete(listener as Listener);
    };
  }

  subscribeStatus(listener: () => void) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getSnapshot() {
    const closedState = typeof WebSocket === "undefined" ? 3 : WebSocket.CLOSED;
    return {
      activeSockets:
        typeof WebSocket !== "undefined" &&
        this.socket &&
        (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
          ? 1
          : 0,
      reconnectAttempt: this.reconnectAttempt,
      readyState: this.socket?.readyState ?? closedState,
      lastMessageAt: this.lastMessageAt,
    };
  }

  private scheduleReconnect(token: string) {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempt += 1;
    const backoff = Math.min(15000, 1000 * 2 ** this.reconnectAttempt);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect(token);
    }, backoff);
  }

  private resolveSocketUrl(token: string) {
    const separator = appConfig.wsBaseUrl.includes("?") ? "&" : "?";
    const target = `${appConfig.wsBaseUrl}${separator}ws_token=${encodeURIComponent(token)}`;
    if (!target.startsWith("/")) {
      return target;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${target}`;
  }
}

export const websocketManager = new WebSocketManager();
