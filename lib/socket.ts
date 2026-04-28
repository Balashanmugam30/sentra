import { appConfig } from "@/config";

const LEADER_KEY = "sentra_ws_leader";
const RECONNECT_DELAYS_MS = [1000, 2000, 5000, 10000] as const;
const LEADER_TTL = 5000;

type Listener = (message: unknown) => void;

type LeaderRecord = {
  id: string;
  ts: number;
};

type SocketState = {
  socket: WebSocket | null;
  reconnectTimeout: number | null;
  heartbeatInterval: number | null;
  reconnectAttempt: number;
  initialized: boolean;
  listeners: Set<Listener>;
  channel: BroadcastChannel | null;
  tabId: string;
};

declare global {
  interface Window {
    __SENTRA_SOCKET_STATE__?: SocketState;
  }
}

function canUseWindow() {
  return typeof window !== "undefined";
}

function createTabId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `sentra-tab-${Math.random().toString(36).slice(2)}`;
}

function getState(): SocketState | null {
  if (!canUseWindow()) {
    return null;
  }

  if (!window.__SENTRA_SOCKET_STATE__) {
    window.__SENTRA_SOCKET_STATE__ = {
      socket: null,
      reconnectTimeout: null,
      heartbeatInterval: null,
      reconnectAttempt: 0,
      initialized: false,
      listeners: new Set<Listener>(),
      channel:
        typeof BroadcastChannel !== "undefined"
          ? new BroadcastChannel("sentra_incidents")
          : null,
      tabId: createTabId(),
    };
  }

  return window.__SENTRA_SOCKET_STATE__;
}

function emit(message: unknown) {
  const state = getState();

  if (!state) {
    return;
  }

  state.listeners.forEach((listener) => {
    listener(message);
  });
}

function now() {
  return Date.now();
}

function getLeader(): LeaderRecord | null {
  if (!canUseWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(LEADER_KEY);

  if (!raw) {
    return null;
  }

  try {
    const leader = JSON.parse(raw) as Partial<LeaderRecord>;

    if (typeof leader.id !== "string" || typeof leader.ts !== "number") {
      return null;
    }

    return {
      id: leader.id,
      ts: leader.ts,
    };
  } catch {
    return null;
  }
}

function setLeader() {
  const state = getState();

  if (!state || !canUseWindow()) {
    return;
  }

  window.localStorage.setItem(
    LEADER_KEY,
    JSON.stringify({ id: state.tabId, ts: now() })
  );
}

function isLeader() {
  const state = getState();
  const leader = getLeader();

  return Boolean(state && leader?.id === state.tabId);
}

function isLeaderAlive() {
  const leader = getLeader();

  if (!leader) {
    return false;
  }

  return now() - leader.ts < LEADER_TTL;
}

function stopHeartbeat() {
  const state = getState();

  if (!state) {
    return;
  }

  if (state.heartbeatInterval !== null) {
    window.clearInterval(state.heartbeatInterval);
    state.heartbeatInterval = null;
  }
}

function startHeartbeat() {
  const state = getState();

  if (!state) {
    return;
  }

  stopHeartbeat();

  state.heartbeatInterval = window.setInterval(() => {
    if (isLeader()) {
      setLeader();
    }
  }, 2000);
}

function clearReconnectTimeout() {
  const state = getState();

  if (!state) {
    return;
  }

  if (state.reconnectTimeout !== null) {
    window.clearTimeout(state.reconnectTimeout);
    state.reconnectTimeout = null;
  }
}

function closeSocket(reason?: string) {
  const state = getState();

  if (!state) {
    return;
  }

  clearReconnectTimeout();
  stopHeartbeat();

  if (!state.socket) {
    return;
  }

  if (
    state.socket.readyState === WebSocket.OPEN ||
    state.socket.readyState === WebSocket.CONNECTING
  ) {
    state.socket.close();
  }

  state.socket = null;
}

function tryBecomeLeader() {
  if (!canUseWindow()) {
    return false;
  }

  const leader = getLeader();

  if (!leader || !isLeaderAlive()) {
    setLeader();
    return isLeader();
  }

  return isLeader();
}

function scheduleReconnect() {
  const state = getState();

  if (!state || !isLeader() || state.reconnectTimeout !== null) {
    return;
  }

  const delay =
    RECONNECT_DELAYS_MS[
      Math.min(state.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)
    ];
  state.reconnectAttempt += 1;

  state.reconnectTimeout = window.setTimeout(() => {
    const currentState = getState();

    if (currentState) {
      currentState.reconnectTimeout = null;
    }

    if (!isLeader()) {
      closeSocket("FOLLOWER");
      return;
    }

    connectLeaderSocket();
  }, delay);
}

function connectLeaderSocket() {
  const state = getState();

  if (!state) {
    return;
  }

  if (!isLeader()) {
    closeSocket("FOLLOWER");
    return;
  }

  if (
    state.socket &&
    (state.socket.readyState === WebSocket.OPEN ||
      state.socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  state.socket = new WebSocket(resolveSocketUrl());

  state.socket.onopen = () => {
    if (!isLeader()) {
      closeSocket("FOLLOWER");
      return;
    }

    startHeartbeat();
    state.reconnectAttempt = 0;
  };

  state.socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      emit(data);
      state.channel?.postMessage(data);
    } catch (error) {
      console.error("WS parse error", error);
    }
  };

  state.socket.onerror = (error) => {
    console.error("[WS ERROR]", error);
  };

  state.socket.onclose = () => {
    const currentState = getState();

    if (currentState) {
      currentState.socket = null;
    }

    if (!isLeader()) {
      return;
    }

    scheduleReconnect();
  };
}

function resolveSocketUrl() {
  if (!canUseWindow() || !appConfig.wsBaseUrl.startsWith("/")) {
    return appConfig.wsBaseUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${appConfig.wsBaseUrl}`;
}

function ensureLeaderSocket() {
  if (!tryBecomeLeader()) {
    closeSocket("FOLLOWER");
    return;
  }

  connectLeaderSocket();
}

function setupSharedInfrastructure() {
  const state = getState();

  if (!state || state.initialized || !canUseWindow()) {
    return;
  }

  state.initialized = true;

  state.channel?.addEventListener("message", (event) => {
    emit(event.data);
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== LEADER_KEY) {
      return;
    }

    if (!isLeader()) {
      closeSocket("FOLLOWER");
      return;
    }

    ensureLeaderSocket();
  });

  window.addEventListener("beforeunload", () => {
    if (isLeader()) {
      window.localStorage.removeItem(LEADER_KEY);
    }

    closeSocket("UNLOAD");
  });

  ensureLeaderSocket();
}

export function subscribeToIncidents(listener: Listener) {
  const state = getState();

  if (!state) {
    return () => {};
  }

  state.listeners.add(listener);
  setupSharedInfrastructure();

  return () => {
    const currentState = getState();

    if (!currentState) {
      return;
    }

    currentState.listeners.delete(listener);
  };
}

export function restartIncidentSocket() {
  const state = getState();

  if (!state) {
    return;
  }

  closeSocket("MANUAL_RESTART");
  if (isLeader()) {
    ensureLeaderSocket();
    return;
  }

  setupSharedInfrastructure();
}
