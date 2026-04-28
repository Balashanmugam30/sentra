"use client";

import { create } from "zustand";

import {
  advanceIncidentLifecycle,
  createLiveIncident,
  type LiveIncident,
} from "@/lib/engines/incident-intelligence";
import {
  buildAIRecommendations,
  type LiveAIRecommendation,
} from "@/lib/engines/ai-council-engine";
import {
  computeExecutiveMetrics,
  type ExecutiveLiveMetrics,
} from "@/lib/engines/executive-intelligence";
import {
  computeResources,
  type LiveResource,
} from "@/lib/engines/resource-deployment-engine";
import {
  computeTwinPulse,
  type LiveTwinPulse,
} from "@/lib/engines/live-twin-intelligence";

export type LiveNotification = {
  id: string;
  message: string;
  read: boolean;
  severity: "info" | "warning" | "critical" | "success";
  timestamp: string;
  title: string;
};

export type LiveChartPoint = {
  aiConfidence: number;
  exposure: number;
  readiness: number;
  threat: number;
  time: string;
};

type LiveDataState = {
  aiRecommendations: LiveAIRecommendation[];
  chartHistory: LiveChartPoint[];
  createIncident: (kind?: "fire" | "medical" | "crowd" | "cyber") => void;
  executive: ExecutiveLiveMetrics;
  incidents: LiveIncident[];
  lastUpdatedAt: string;
  markNotificationsRead: () => void;
  notifications: LiveNotification[];
  rejectRecommendation: (id: string) => void;
  approveRecommendation: (id: string) => void;
  resources: LiveResource[];
  runQuickAction: (action: string) => void;
  start: () => void;
  started: boolean;
  tick: number;
  twin: LiveTwinPulse;
};

const initialIncidents: LiveIncident[] = [
  createLiveIncident({
    category: "fire",
    id: "live-fire-kitchen-b",
    lat: 11.0168,
    lifecycle_status: "Responding",
    lng: 76.9558,
    location: "Kitchen Zone B",
    severity: 5,
    source: "Flame + CCTV fusion",
    title: "Fire detected in Kitchen Zone B",
  }),
  createLiveIncident({
    category: "crowd",
    id: "live-crowd-atrium",
    lat: 11.0179,
    lifecycle_status: "Investigating",
    lng: 76.9569,
    location: "Atrium",
    severity: 4,
    source: "Occupancy heatmap",
    title: "Crowd pressure building in Atrium",
  }),
  createLiveIncident({
    category: "clinical",
    id: "live-oxygen-icu",
    lat: 11.0159,
    lifecycle_status: "Detected",
    lng: 76.9546,
    location: "ICU Wing",
    severity: 3,
    source: "Oxygen manifold sensor",
    title: "Oxygen pressure instability",
  }),
];

function nowLabel(tick: number) {
  const date = new Date(Date.now() + tick * 30_000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function notificationForIncident(incident: LiveIncident, tick: number): LiveNotification {
  const critical = incident.severity >= 4;
  return {
    id: `note-${incident.id}-${tick}`,
    message: `${incident.lifecycle_status} at ${incident.location}. ETA ${incident.eta_minutes}m, confidence ${incident.decision_confidence ?? 91}%.`,
    read: false,
    severity: critical ? "critical" : "warning",
    timestamp: new Date().toISOString(),
    title: incident.title ?? "Incident update",
  };
}

function computeChartPoint(incidents: LiveIncident[], executive: ExecutiveLiveMetrics, tick: number): LiveChartPoint {
  const avgConfidence =
    incidents.reduce((sum, incident) => sum + (incident.decision_confidence ?? 90), 0) /
    Math.max(1, incidents.length);

  return {
    aiConfidence: Math.round(avgConfidence),
    exposure: Math.round(executive.financialExposure / 100_000) / 10,
    readiness: executive.readiness,
    threat: executive.threatScore,
    time: nowLabel(tick),
  };
}

function buildNextState(incidents: LiveIncident[], tick: number) {
  const executive = computeExecutiveMetrics(incidents, tick);
  const resources = computeResources(incidents, tick);
  const twin = computeTwinPulse(incidents, tick);
  const aiRecommendations = buildAIRecommendations(incidents, tick);

  return { aiRecommendations, executive, resources, twin };
}

const initialComputed = buildNextState(initialIncidents, 0);
const initialHistory = Array.from({ length: 8 }, (_, index) =>
  computeChartPoint(initialIncidents, initialComputed.executive, index),
);

let intervalId: number | null = null;

export const useLiveDataStore = create<LiveDataState>((set, get) => ({
  ...initialComputed,
  chartHistory: initialHistory,
  incidents: initialIncidents,
  lastUpdatedAt: new Date().toISOString(),
  notifications: [
    notificationForIncident(initialIncidents[0]!, 0),
    {
      id: "note-ai-route",
      message: "AI recommends route split, reserve rebalance, and corridor-first containment.",
      read: false,
      severity: "info" as const,
      timestamp: new Date().toISOString(),
      title: "AI recommendation ready",
    },
  ],
  started: false,
  tick: 0,

  approveRecommendation(id) {
    set((state) => ({
      aiRecommendations: state.aiRecommendations.map((action) =>
        action.id === id ? { ...action, state: "approved" } : action,
      ),
      notifications: [
        {
          id: `note-approved-${id}-${state.tick}`,
          message: "Action approved and written into the command timeline.",
          read: false,
          severity: "success" as const,
          timestamp: new Date().toISOString(),
          title: "Recommendation approved",
        },
        ...state.notifications,
      ].slice(0, 12),
    }));
  },

  createIncident(kind = "fire") {
    const tick = get().tick;
    const catalog = {
      crowd: {
        category: "crowd",
        lat: 11.0184,
        lng: 76.9574,
        location: "Food Court",
        severity: 4,
        source: "Camera density model",
        title: "Panic surge risk detected",
      },
      cyber: {
        category: "cyber",
        lat: 11.0148,
        lng: 76.9538,
        location: "Network Core",
        severity: 3,
        source: "SOC anomaly engine",
        title: "Command network anomaly",
      },
      fire: {
        category: "fire",
        lat: 11.0168,
        lng: 76.9558,
        location: "Kitchen Zone B",
        severity: 5,
        source: "Flame + CCTV fusion",
        title: "Fire detected in Kitchen Zone B",
      },
      medical: {
        category: "medical",
        lat: 11.0157,
        lng: 76.9547,
        location: "Medical Corridor",
        severity: 3,
        source: "Staff distress signal",
        title: "Medical corridor priority lane requested",
      },
    }[kind];
    const incident = createLiveIncident({ ...catalog, id: `live-${kind}-${tick}` });
    const nextIncidents = [incident, ...get().incidents].slice(0, 9);
    const computed = buildNextState(nextIncidents, tick);
    set((state) => ({
      ...computed,
      chartHistory: [...state.chartHistory.slice(-9), computeChartPoint(nextIncidents, computed.executive, tick)],
      incidents: nextIncidents,
      lastUpdatedAt: new Date().toISOString(),
      notifications: [notificationForIncident(incident, tick), ...state.notifications].slice(0, 12),
    }));
  },

  markNotificationsRead() {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  },

  rejectRecommendation(id) {
    set((state) => ({
      aiRecommendations: state.aiRecommendations.map((action) =>
        action.id === id ? { ...action, state: "rejected" } : action,
      ),
    }));
  },

  runQuickAction(action) {
    set((state) => {
      const severity: LiveNotification["severity"] = action.toLowerCase().includes("lockdown")
        ? "critical"
        : "info";
      return {
      notifications: [
        {
          id: `note-quick-${action}-${state.tick}`,
          message: `${action} queued through command mode with audit trail enabled.`,
          read: false,
          severity,
          timestamp: new Date().toISOString(),
          title: "Command action queued",
        },
        ...state.notifications,
      ].slice(0, 12),
    };
    });
  },

  start() {
    if (get().started || typeof window === "undefined") {
      set({ started: true });
      return;
    }

    set({ started: true });
    intervalId = window.setInterval(() => {
      set((state) => {
        const tick = state.tick + 1;
        const incidents = state.incidents.map((incident) => advanceIncidentLifecycle(incident, tick));
        const computed = buildNextState(incidents, tick);
        const featured = incidents.find((incident) => incident.status !== "resolved") ?? incidents[0];

        return {
          ...computed,
          chartHistory: [...state.chartHistory.slice(-11), computeChartPoint(incidents, computed.executive, tick)],
          incidents,
          lastUpdatedAt: new Date().toISOString(),
          notifications:
            tick % 2 === 0 && featured
              ? [notificationForIncident(featured, tick), ...state.notifications].slice(0, 12)
              : state.notifications,
          tick,
        };
      });
    }, 4500);
  },
}));

export function stopLiveDataEngineForTests() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}
