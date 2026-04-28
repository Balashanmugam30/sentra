"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  getIotCameraLatest,
  getIotEvents,
  getIotFeed,
  getIotFleet,
  getIotHealth,
  renameIotNode,
  runIotNodeAction,
} from "@/lib/iot/api";
import { buildMockIotSnapshot } from "@/lib/iot/mock";
import { simulateIotStream } from "@/lib/iot/simulator";
import type {
  IotCameraLatestResponse,
  IotEventRecord,
  IotFeedResponse,
  IotFleetResponse,
  IotFleetSummary,
  IotHealthResponse,
  IotMode,
  IotNode,
} from "@/lib/iot/types";

type IotState = {
  fleet: IotFleetResponse | null;
  nodes: IotNode[];
  events: IotEventRecord[];
  camera: IotCameraLatestResponse | null;
  health: IotHealthResponse | null;
  feed: IotFeedResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdatedAt: number | null;
  mode: IotMode;
  usingMockBackend: boolean;
  busyNodeId: string | null;
};

const initialState: IotState = {
  fleet: null,
  nodes: [],
  events: [],
  camera: null,
  health: null,
  feed: null,
  loading: true,
  error: null,
  lastUpdatedAt: null,
  mode: "HYBRID",
  usingMockBackend: false,
  busyNodeId: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollerId: ReturnType<typeof setInterval> | null = null;
const subscribers = new Set<(state: IotState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

function summarize(nodes: IotNode[], previous: IotFleetSummary | undefined, events: IotEventRecord[]): IotFleetSummary {
  const activeNodes = nodes.filter((node) => ["online", "warning", "critical"].includes(node.status)).length;
  const offlineNodes = nodes.length - activeNodes;
  const criticalAlerts = events.filter((event) => event.risk_level === "CRITICAL" || event.risk_level === "CRITICAL+").length;
  const avgHealthScore = Math.round(nodes.reduce((sum, node) => sum + node.health_score, 0) / Math.max(1, nodes.length));
  const latencyNodes = nodes.filter((node) => node.latency_ms > 0);
  const avgLatency = Math.round(latencyNodes.reduce((sum, node) => sum + node.latency_ms, 0) / Math.max(1, latencyNodes.length));
  return {
    active_nodes: activeNodes,
    offline_nodes: offlineNodes,
    critical_alerts: Math.max(criticalAlerts, previous?.critical_alerts ?? 0),
    avg_health_score: avgHealthScore,
    avg_latency_ms: avgLatency,
    total_events_today: Math.max(events.length, previous?.total_events_today ?? 0),
    camera_nodes_online: nodes.filter((node) => node.node_type === "corridor_camera" && node.status !== "offline").length,
    mode: sharedState.mode,
  };
}

function applyMode(fleet: IotFleetResponse, events: IotEventRecord[]) {
  const simulated = simulateIotStream(fleet.nodes, sharedState.mode);
  const mergedEvents = sharedState.mode === "REAL" ? events : [...simulated.events, ...events].slice(0, 40);
  const summary = summarize(simulated.nodes, fleet.summary, mergedEvents);
  return {
    fleet: { ...fleet, summary, nodes: simulated.nodes },
    nodes: simulated.nodes,
    events: mergedEvents,
  };
}

export async function refreshIotTelemetry() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: sharedState.nodes.length === 0, error: null };
  notify();

  refreshInFlight = (async () => {
    try {
      const source =
        sharedState.mode === "DEMO"
          ? buildMockIotSnapshot()
          : await Promise.all([getIotFleet(), getIotEvents(), getIotCameraLatest(), getIotHealth(), getIotFeed()]).then(
              ([fleet, eventsResponse, camera, health, feed]) => ({
                fleet,
                events: eventsResponse.events,
                camera,
                health,
                feed,
              }),
            );

      const applied = applyMode(source.fleet, source.events);
      sharedState = {
        ...sharedState,
        fleet: applied.fleet,
        nodes: applied.nodes,
        events: applied.events,
        camera: source.camera,
        health: source.health,
        feed: source.feed,
        loading: false,
        error: null,
        lastUpdatedAt: Date.now(),
        usingMockBackend: sharedState.mode === "DEMO",
      };
    } catch (error) {
      const fallback = buildMockIotSnapshot();
      const applied = applyMode(fallback.fleet, fallback.events);
      sharedState = {
        ...sharedState,
        fleet: applied.fleet,
        nodes: applied.nodes,
        events: applied.events,
        camera: fallback.camera,
        health: fallback.health,
        feed: fallback.feed,
        loading: false,
        error: error instanceof Error ? `${error.message}. Switched to mock telemetry mode.` : "Switched to mock telemetry mode.",
        lastUpdatedAt: Date.now(),
        usingMockBackend: true,
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();

  return refreshInFlight;
}

function startSharedPolling() {
  if (pollerId || !LIVE_POLLING_ENABLED) {
    return;
  }

  pollerId = setInterval(() => {
    if (!sharedState.fleet?.summary || sharedState.fleet.summary.mode !== "REAL") {
      void refreshIotTelemetry();
      return;
    }
    void refreshIotTelemetry();
  }, DEFAULT_REFRESH_MS);
}

function stopSharedPollingIfIdle() {
  if (subscribers.size > 0 || !pollerId) {
    return;
  }

  clearInterval(pollerId);
  pollerId = null;
}

async function executeNodeAction(nodeId: string, action: "restart" | "mute" | "snapshot" | "ping" | "disable") {
  sharedState = {
    ...sharedState,
    busyNodeId: nodeId,
    nodes: sharedState.nodes.map((node) =>
      node.node_id === nodeId
        ? {
            ...node,
            muted: action === "mute" ? true : node.muted,
            status: action === "disable" ? "disabled" : action === "restart" || action === "ping" ? "online" : node.status,
            disabled: action === "disable" ? true : node.disabled,
          }
        : node,
    ),
  };
  notify();
  try {
    if (!sharedState.usingMockBackend && sharedState.mode !== "DEMO") {
      await runIotNodeAction(nodeId, action);
    }
    await refreshIotTelemetry();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyNodeId: null,
      error: error instanceof Error ? error.message : "Node command failed",
    };
    notify();
  } finally {
    sharedState = { ...sharedState, busyNodeId: null };
    notify();
  }
}

async function renameNode(nodeId: string, label: string) {
  sharedState = {
    ...sharedState,
    busyNodeId: nodeId,
    nodes: sharedState.nodes.map((node) => (node.node_id === nodeId ? { ...node, label } : node)),
  };
  notify();
  try {
    if (!sharedState.usingMockBackend && sharedState.mode !== "DEMO") {
      await renameIotNode(nodeId, label);
    }
    await refreshIotTelemetry();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyNodeId: null,
      error: error instanceof Error ? error.message : "Node rename failed",
    };
    notify();
  } finally {
    sharedState = { ...sharedState, busyNodeId: null };
    notify();
  }
}

export function setIotMode(mode: IotMode) {
  sharedState = { ...sharedState, mode };
  notify();
  void refreshIotTelemetry();
}

export function useIotTelemetry() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    startSharedPolling();
    void refreshIotTelemetry();

    return () => {
      subscribers.delete(setState);
      stopSharedPollingIfIdle();
    };
  }, []);

  return {
    ...state,
    refresh: refreshIotTelemetry,
    setMode: setIotMode,
    executeNodeAction,
    renameNode,
  };
}
