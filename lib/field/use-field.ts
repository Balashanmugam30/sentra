"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  acknowledgeFieldTask,
  getFieldLive,
  getFieldResponders,
  getFieldTasks,
  registerFieldResponder,
  requestFieldBackup,
  submitFieldCheckpoint,
  syncFieldEvents,
  updateFieldTaskStatus,
} from "@/lib/field/api";
import type {
  FieldLiveResponse,
  FieldRespondersResponse,
  FieldStatusUpdateRequest,
  FieldSyncEvent,
  FieldTasksResponse,
} from "@/lib/field/types";

type FieldStoreState = {
  live: FieldLiveResponse | null;
  responders: FieldRespondersResponse | null;
  tasks: FieldTasksResponse | null;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
};

type UseFieldResult = FieldStoreState & {
  refresh: () => Promise<void>;
  createDemoDispatch: () => Promise<void>;
  acknowledge: (taskId: string, responderId: string) => Promise<void>;
  updateStatus: (payload: FieldStatusUpdateRequest) => Promise<void>;
  requestBackup: (responderId: string, zone: string, reason: string) => Promise<void>;
  checkpoint: (responderId: string, zone: string, checkpoint: string) => Promise<void>;
  syncEvents: (responderId: string, queuedEvents: FieldSyncEvent[]) => Promise<void>;
};

const initialState: FieldStoreState = {
  live: null,
  responders: null,
  tasks: null,
  loading: true,
  error: null,
  lastAction: null,
};

let sharedState: FieldStoreState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: FieldStoreState) => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshSharedState() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notifySubscribers();

  refreshInFlight = (async () => {
    try {
      const [live, responders, tasks] = await Promise.all([
        getFieldLive(),
        getFieldResponders(),
        getFieldTasks(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        responders,
        tasks,
        loading: false,
        error: null,
      };
    } catch (loadError) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: loadError instanceof Error ? loadError.message : "Failed to load field state",
      };
    } finally {
      refreshInFlight = null;
      notifySubscribers();
    }
  })();

  return refreshInFlight;
}

function startPolling() {
  if (typeof window === "undefined" || pollingInterval !== null) {
    return;
  }
  void refreshSharedState();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    void refreshSharedState();
  }, DEFAULT_REFRESH_MS);
}

function stopPollingIfUnused() {
  if (typeof window === "undefined" || subscribers.size > 0 || pollingInterval === null) {
    return;
  }
  window.clearInterval(pollingInterval);
  pollingInterval = null;
}

async function withAction(action: () => Promise<string>) {
  try {
    const lastAction = await action();
    sharedState = { ...sharedState, lastAction, error: null };
    notifySubscribers();
    await refreshSharedState();
  } catch (actionError) {
    sharedState = {
      ...sharedState,
      error: actionError instanceof Error ? actionError.message : "Field action failed",
    };
    notifySubscribers();
  }
}

export function useField(): UseFieldResult {
  const [state, setState] = useState<FieldStoreState>(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    startPolling();

    return () => {
      subscribers.delete(setState);
      stopPollingIfUnused();
    };
  }, []);

  return {
    ...state,
    refresh: refreshSharedState,
    createDemoDispatch: async () => {
      await withAction(async () => {
        const result = await registerFieldResponder({
          responder_id: "RSP-201",
          name: "Team Alpha",
          role: "firefighter",
          device: "android",
          zone: "Zone 2",
        });
        return `registered ${result.call_sign}`;
      });
    },
    acknowledge: async (taskId, responderId) => {
      await withAction(async () => {
        const result = await acknowledgeFieldTask({ task_id: taskId, responder_id: responderId });
        return `${result.status} ${result.task.task_id}`;
      });
    },
    updateStatus: async (payload) => {
      await withAction(async () => {
        const result = await updateFieldTaskStatus(payload);
        return `${result.status} ${result.task.task_id} -> ${result.task.status}`;
      });
    },
    requestBackup: async (responderId, zone, reason) => {
      await withAction(async () => {
        const result = await requestFieldBackup({
          responder_id: responderId,
          zone,
          reason,
        });
        return `${result.status} ${result.request_id}`;
      });
    },
    checkpoint: async (responderId, zone, checkpoint) => {
      await withAction(async () => {
        const result = await submitFieldCheckpoint({
          responder_id: responderId,
          zone,
          checkpoint,
        });
        return `${result.status} ${result.checkpoint}`;
      });
    },
    syncEvents: async (responderId, queuedEvents) => {
      await withAction(async () => {
        const result = await syncFieldEvents({
          responder_id: responderId,
          queued_events: queuedEvents,
        });
        return `${result.status} ${result.processed_events} events`;
      });
    },
  };
}
