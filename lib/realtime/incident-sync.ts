import { getIncidents, type Incident } from "@/lib/api/incident";
import { subscribeToFirestoreIncidents } from "@/lib/firestore";
import { liveSyncEngine } from "@/services/realtime/live-sync-engine";

type IncidentMessage = {
  type?: string;
  data?: unknown;
};

type IncidentSubscriber = (incidents: Incident[]) => void;

type IncidentSyncState = {
  incidentStore: Map<string, Incident>;
  subscribers: Set<IncidentSubscriber>;
  initialLoadPromise: Promise<void> | null;
  socketInitialized: boolean;
  socketUnsubscribe: (() => void) | null;
  firestoreInitialized: boolean;
  firestoreUnavailable: boolean;
  firestoreUnsubscribe: (() => void) | null;
};

declare global {
  interface Window {
    __SENTRA_INCIDENT_SYNC__?: IncidentSyncState;
  }
}

function canUseWindow() {
  return typeof window !== "undefined";
}

function getSyncState(): IncidentSyncState {
  if (!canUseWindow()) {
    return {
      incidentStore: new Map<string, Incident>(),
      subscribers: new Set<IncidentSubscriber>(),
      initialLoadPromise: null,
      socketInitialized: false,
      socketUnsubscribe: null,
      firestoreInitialized: false,
      firestoreUnavailable: false,
      firestoreUnsubscribe: null,
    };
  }

  if (!window.__SENTRA_INCIDENT_SYNC__) {
    window.__SENTRA_INCIDENT_SYNC__ = {
      incidentStore: new Map<string, Incident>(),
      subscribers: new Set<IncidentSubscriber>(),
      initialLoadPromise: null,
      socketInitialized: false,
      socketUnsubscribe: null,
      firestoreInitialized: false,
      firestoreUnavailable: false,
      firestoreUnsubscribe: null,
    };
  }

  return window.__SENTRA_INCIDENT_SYNC__;
}

function isIncident(value: unknown): value is Incident {
  if (!value || typeof value !== "object") {
    return false;
  }

  const incident = value as Partial<Incident>;

  return typeof incident.id === "string" && incident.id.length > 0;
}

function sortIncidents(incidents: Incident[]) {
  return [...incidents].sort((left, right) => {
    const leftTimestamp = Date.parse(left.created_at ?? "");
    const rightTimestamp = Date.parse(right.created_at ?? "");

    if (Number.isNaN(leftTimestamp) && Number.isNaN(rightTimestamp)) {
      return right.id.localeCompare(left.id);
    }

    if (Number.isNaN(leftTimestamp)) {
      return 1;
    }

    if (Number.isNaN(rightTimestamp)) {
      return -1;
    }

    return rightTimestamp - leftTimestamp;
  });
}

function getSortedIncidents() {
  return sortIncidents(Array.from(getSyncState().incidentStore.values()));
}

function notifySubscribers() {
  const state = getSyncState();
  const incidents = getSortedIncidents();

  state.subscribers.forEach((subscriber) => {
    subscriber(incidents);
  });
}

function replaceIncidents(incidents: Incident[]) {
  const state = getSyncState();
  const nextStore = new Map<string, Incident>();

  incidents.forEach((incident) => {
    if (!isIncident(incident)) {
      return;
    }

    nextStore.set(incident.id, incident);
  });

  state.incidentStore = nextStore;
}

function handleSocketMessage(message: IncidentMessage) {
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type !== "incident_created" && message.type !== "incident_updated") {
    return;
  }

  if (!isIncident(message.data)) {
    return;
  }

  const state = getSyncState();

  if (message.type === "incident_created") {
    if (state.incidentStore.has(message.data.id)) {
      return;
    }

    state.incidentStore.set(message.data.id, message.data);
    notifySubscribers();
    return;
  }

  state.incidentStore.set(message.data.id, message.data);
  notifySubscribers();
}

async function ensureInitialData() {
  const state = getSyncState();

  if (!state.initialLoadPromise) {
    state.initialLoadPromise = (async () => {
      const response = await getIncidents();
      replaceIncidents(response.data ?? []);
      notifySubscribers();
    })().catch((error) => {
      state.initialLoadPromise = null;
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.name === "SentraRecoverableApiError" ||
          error.message.toLowerCase().includes("aborted"))
      ) {
        return;
      }
      throw error;
    });
  }

  try {
    await state.initialLoadPromise;
    state.initialLoadPromise = null;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.name === "SentraRecoverableApiError" ||
        error.message.toLowerCase().includes("aborted"))
    ) {
      return;
    }
    console.error("API error", error);
  }
}

function ensureSocketSubscription() {
  const state = getSyncState();

  if (state.socketInitialized) {
    return;
  }

  state.socketInitialized = true;

  state.socketUnsubscribe = liveSyncEngine.subscribeModule("incidents", (message) => {
    handleSocketMessage(message as IncidentMessage);
  });
}

function ensureFirestoreSubscription() {
  const state = getSyncState();
  if (state.firestoreInitialized) {
    return;
  }
  state.firestoreInitialized = true;
  state.firestoreUnsubscribe = subscribeToFirestoreIncidents(
    (incidents) => {
      state.firestoreUnavailable = false;
      replaceIncidents(incidents);
      notifySubscribers();
    },
    (error) => {
      state.firestoreUnavailable = true;
      console.warn("[SYNC] Firestore incident listener unavailable; websocket/API fallback remains active", error);
      void ensureInitialData();
    },
  );
  if (!state.firestoreUnsubscribe) {
    state.firestoreUnavailable = true;
  }
}

export function initIncidentSync(onUpdate: (incidents: Incident[]) => void) {
  const subscriber: IncidentSubscriber = (incidents) => {
    onUpdate(incidents);
  };

  const state = getSyncState();
  state.subscribers.add(subscriber);

  ensureFirestoreSubscription();
  ensureSocketSubscription();
  if (state.firestoreUnavailable) {
    void ensureInitialData();
  } else {
    window.setTimeout(() => {
      const currentState = getSyncState();
      if (currentState.incidentStore.size === 0 && currentState.subscribers.size > 0) {
        void ensureInitialData();
      }
    }, 1_200);
  }
  subscriber(getSortedIncidents());

  return () => {
    const currentState = getSyncState();
    currentState.subscribers.delete(subscriber);
    if (currentState.subscribers.size === 0) {
      currentState.firestoreUnsubscribe?.();
      currentState.firestoreUnsubscribe = null;
      currentState.firestoreInitialized = false;
      currentState.firestoreUnavailable = false;
      currentState.socketUnsubscribe?.();
      currentState.socketUnsubscribe = null;
      currentState.socketInitialized = false;
      currentState.initialLoadPromise = null;
    }
  };
}
