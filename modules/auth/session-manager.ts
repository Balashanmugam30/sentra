"use client";

import { signOut } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase";
import { captureError, captureEvent, captureWarning } from "@/lib/telemetry";
import { useAuthStore } from "@/store/auth-store";

import type { DeviceSession, DeviceSessionStatus } from "./types/auth";

const SESSION_STORAGE_KEY = "sentra-device-sessions";
const DEVICE_ID_STORAGE_KEY = "sentra-current-device-id";
const SESSION_CHANNEL_NAME = "sentra-device-session-sync";
const HEARTBEAT_INTERVAL_MS = 30_000;
const REVOKED_STATUS: DeviceSessionStatus = "revoked";

function isBrowser() {
  return typeof window !== "undefined";
}

function readRegistry(): DeviceSession[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as DeviceSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    captureError("Session registry read failed", error, {
      component: "AuthSessionManager",
    });
    return [];
  }
}

function writeRegistry(registry: DeviceSession[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(registry));
}

function createDeviceId() {
  if (!isBrowser()) {
    return "server-session";
  }

  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
  return generated;
}

class AuthSessionManager {
  private heartbeatTimer: number | null = null;
  private storageBound = false;
  private channel: BroadcastChannel | null = null;
  private trackedUserId: string | null = null;

  startTracking(userId: string) {
    if (!isBrowser()) {
      return;
    }

    this.trackedUserId = userId;
    const deviceId = createDeviceId();
    useAuthStore.getState().setCurrentDeviceId(deviceId);
    this.bindSynchronization();
    this.upsertSession({
      device_id: deviceId,
      user_id: userId,
      last_active: new Date().toISOString(),
      session_status: "active",
    });
    this.startHeartbeat();
  }

  listActiveSessions() {
    return useAuthStore.getState().activeSessions;
  }

  async logoutFromDevice(deviceId: string) {
    const currentDeviceId = useAuthStore.getState().currentDeviceId;
    const registry = readRegistry().map((session) =>
      session.device_id === deviceId
        ? {
            ...session,
            session_status: REVOKED_STATUS,
            last_active: new Date().toISOString(),
          }
        : session,
    );

    writeRegistry(registry);
    this.syncStoreFromRegistry();
    this.channel?.postMessage({ type: "session.revoked", device_id: deviceId });

    captureEvent("Authentication device session revoked", {
      component: "AuthSessionManager",
      metadata: {
        device_id: deviceId,
      },
    });

    if (deviceId === currentDeviceId) {
      await this.forceSignOutCurrentDevice();
    }
  }

  async logoutAllDevices() {
    const userId = this.trackedUserId ?? useAuthStore.getState().user?.uid;
    if (!userId) {
      return;
    }

    const now = new Date().toISOString();
    const registry = readRegistry().map((session) =>
      session.user_id === userId
        ? {
            ...session,
            session_status: REVOKED_STATUS,
            last_active: now,
          }
        : session,
    );

    writeRegistry(registry);
    this.syncStoreFromRegistry();
    this.channel?.postMessage({ type: "session.revoked.all", user_id: userId });

    captureEvent("Authentication all device sessions revoked", {
      component: "AuthSessionManager",
      metadata: {
        user_id: userId,
      },
    });

    await this.forceSignOutCurrentDevice();
  }

  stopTracking() {
    if (!isBrowser()) {
      return;
    }

    this.stopHeartbeat();
    const currentDeviceId = useAuthStore.getState().currentDeviceId;

    if (currentDeviceId) {
      const registry = readRegistry().filter((session) => session.device_id !== currentDeviceId);
      writeRegistry(registry);
      this.channel?.postMessage({ type: "session.removed", device_id: currentDeviceId });
    }

    this.trackedUserId = null;
    useAuthStore.getState().setCurrentDeviceId(null);
    useAuthStore.getState().setActiveSessions([]);
  }

  private bindSynchronization() {
    if (!isBrowser() || this.storageBound) {
      return;
    }

    this.storageBound = true;
    this.channel = "BroadcastChannel" in window ? new BroadcastChannel(SESSION_CHANNEL_NAME) : null;

    window.addEventListener("storage", this.handleStorageEvent);
    this.channel?.addEventListener("message", this.handleChannelMessage);
  }

  private readonly handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== SESSION_STORAGE_KEY) {
      return;
    }

    this.syncStoreFromRegistry();
    void this.signOutIfCurrentDeviceRevoked();
  };

  private readonly handleChannelMessage = () => {
    this.syncStoreFromRegistry();
    void this.signOutIfCurrentDeviceRevoked();
  };

  private syncStoreFromRegistry() {
    const userId = this.trackedUserId ?? useAuthStore.getState().user?.uid;
    if (!userId) {
      useAuthStore.getState().setActiveSessions([]);
      return;
    }

    const currentDeviceId = useAuthStore.getState().currentDeviceId;
    const sessions = readRegistry()
      .filter((session) => session.user_id === userId)
      .sort((left, right) => right.last_active.localeCompare(left.last_active))
      .map((session) => ({
        ...session,
        session_status:
          session.device_id === currentDeviceId && session.session_status === "revoked"
            ? "revoked"
            : session.session_status,
      }));

    useAuthStore.getState().setActiveSessions(sessions);
  }

  private upsertSession(nextSession: DeviceSession) {
    const registry = readRegistry();
    const existingIndex = registry.findIndex((session) => session.device_id === nextSession.device_id);

    if (existingIndex >= 0) {
      registry[existingIndex] = nextSession;
    } else {
      registry.unshift(nextSession);
    }

    writeRegistry(registry);
    this.syncStoreFromRegistry();
    this.channel?.postMessage({ type: "session.updated", device_id: nextSession.device_id });
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = window.setInterval(() => {
      const currentDeviceId = useAuthStore.getState().currentDeviceId;
      const userId = this.trackedUserId ?? useAuthStore.getState().user?.uid;

      if (!currentDeviceId || !userId) {
        return;
      }

      this.upsertSession({
        device_id: currentDeviceId,
        user_id: userId,
        last_active: new Date().toISOString(),
        session_status: "active",
      });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async signOutIfCurrentDeviceRevoked() {
    const currentDeviceId = useAuthStore.getState().currentDeviceId;
    if (!currentDeviceId) {
      return;
    }

    const currentSession = readRegistry().find((session) => session.device_id === currentDeviceId);
    if (currentSession?.session_status === "revoked") {
      await this.forceSignOutCurrentDevice();
    }
  }

  private async forceSignOutCurrentDevice() {
    if (!firebaseAuth) {
      captureWarning("Firebase Authentication is unavailable during device sign-out", {
        component: "AuthSessionManager",
      });
      return;
    }

    try {
      await signOut(firebaseAuth);
    } catch (error) {
      captureError("Authentication device sign-out failed", error, {
        component: "AuthSessionManager",
      });
    }
  }
}

export const authSessionManager = new AuthSessionManager();
