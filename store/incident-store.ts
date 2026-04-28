import { create } from "zustand";

import type {
  ActiveAlert,
  AIInsight,
  EvacuationState,
  IncidentSummary,
  IncidentSeverity,
} from "@/modules/incident/types/incident";

const defaultAiInsight: AIInsight = {
  summary: "No active anomalies detected.",
  recommendation: "Continue monitoring building telemetry and standby procedures.",
  explanation: "No rerouting or intervention is currently required.",
};

const defaultEvacuationState: EvacuationState = {
  progressPercent: 0,
  routeHealth: "clear",
  activeAlerts: 0,
};

function normalizeIncident(incident: IncidentSummary): IncidentSummary {
  return {
    ...incident,
    aiInsight: {
      ...defaultAiInsight,
      ...incident.aiInsight,
    },
    evacuation: {
      ...defaultEvacuationState,
      ...incident.evacuation,
    },
    alerts: incident.alerts ?? [],
  };
}

interface IncidentState {
  activeIncident: IncidentSummary | null;
  incidents: IncidentSummary[];
  lastPredictionSummary: string | null;
  setActiveIncident: (incident: IncidentSummary | null) => void;
  upsertIncident: (incident: IncidentSummary) => void;
  updateInsight: (payload: Partial<AIInsight>) => void;
  updateEvacuationState: (payload: Partial<EvacuationState>) => void;
  setAlerts: (alerts: ActiveAlert[]) => void;
  setSeverity: (severity: IncidentSeverity) => void;
  recordPredictionSummary: (summary: string) => void;
  resetIncidentState: () => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  activeIncident: null,
  incidents: [],
  lastPredictionSummary: null,
  setActiveIncident: (activeIncident) =>
    set({ activeIncident: activeIncident ? normalizeIncident(activeIncident) : null }),
  upsertIncident: (incident) => {
    const incidents = [...get().incidents];
    const existingIndex = incidents.findIndex((item) => item.incidentId === incident.incidentId);
    const normalizedIncident = normalizeIncident(incident);

    if (existingIndex >= 0) {
      incidents[existingIndex] = normalizedIncident;
    } else {
      incidents.unshift(normalizedIncident);
    }

    set({
      incidents,
      activeIncident:
        get().activeIncident?.incidentId === normalizedIncident.incidentId
          ? normalizedIncident
          : get().activeIncident ?? normalizedIncident,
    });
  },
  updateInsight: (payload) => {
    const activeIncident = get().activeIncident;
    if (!activeIncident) {
      return;
    }

    const nextIncident = {
      ...activeIncident,
      aiInsight: {
        ...activeIncident.aiInsight,
        ...payload,
      },
      updatedAt: payload.updatedAt ?? activeIncident.updatedAt,
    };

    get().upsertIncident(nextIncident);
  },
  updateEvacuationState: (payload) => {
    const activeIncident = get().activeIncident;
    if (!activeIncident) {
      return;
    }

    const nextIncident = {
      ...activeIncident,
      evacuation: {
        ...activeIncident.evacuation,
        ...payload,
      },
      updatedAt: payload.lastUpdatedAt ?? activeIncident.updatedAt,
    };

    get().upsertIncident(nextIncident);
  },
  setAlerts: (alerts) => {
    const activeIncident = get().activeIncident;
    if (!activeIncident) {
      return;
    }

    const nextIncident = {
      ...activeIncident,
      alerts,
      evacuation: {
        ...activeIncident.evacuation,
        activeAlerts: alerts.filter((alert) => alert.state !== "idle").length,
        lastAlertChannel: alerts[0]?.channel,
      },
    };

    get().upsertIncident(nextIncident);
  },
  setSeverity: (severity) => {
    const activeIncident = get().activeIncident;
    if (!activeIncident) {
      return;
    }

    get().upsertIncident({
      ...activeIncident,
      severity,
    });
  },
  recordPredictionSummary: (summary) => {
    set({ lastPredictionSummary: summary });
  },
  resetIncidentState: () =>
    set({
      activeIncident: null,
      incidents: [],
      lastPredictionSummary: null,
    }),
}));
