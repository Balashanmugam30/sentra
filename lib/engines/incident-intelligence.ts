import type { Incident } from "@/lib/api/incident";

export type LiveIncidentStatus =
  | "Detected"
  | "Investigating"
  | "Escalated"
  | "Responding"
  | "Contained"
  | "Recovered"
  | "Closed";

export type IncidentTimelineLog = {
  id: string;
  message: string;
  timestamp: string;
  type: "ai" | "operator" | "sensor" | "system";
};

export type LiveIncident = Incident & {
  assigned_team: string;
  eta_minutes: number;
  lifecycle_status: LiveIncidentStatus;
  responders_assigned: string[];
  spread_probability: number;
  timeline_logs: IncidentTimelineLog[];
};

const lifecycle: LiveIncidentStatus[] = [
  "Detected",
  "Investigating",
  "Escalated",
  "Responding",
  "Contained",
  "Recovered",
  "Closed",
];

function statusToIncidentStatus(status: LiveIncidentStatus) {
  if (status === "Closed" || status === "Recovered") {
    return "resolved";
  }
  if (status === "Contained") {
    return "contained";
  }
  if (status === "Escalated") {
    return "critical";
  }
  return "active";
}

function statusMessage(status: LiveIncidentStatus, location: string) {
  if (status === "Investigating") {
    return `Signal confirmed at ${location}; AI verification is above threshold.`;
  }
  if (status === "Escalated") {
    return `Escalation opened for ${location}; executive watch is active.`;
  }
  if (status === "Responding") {
    return `Responders are moving toward ${location}; ETA is improving.`;
  }
  if (status === "Contained") {
    return `Containment boundary is holding at ${location}.`;
  }
  if (status === "Recovered") {
    return `Recovery tasks are underway at ${location}.`;
  }
  if (status === "Closed") {
    return `Incident closed at ${location}; evidence package is audit-ready.`;
  }
  return `New signal detected at ${location}.`;
}

export function advanceIncidentLifecycle(incident: LiveIncident, tick: number): LiveIncident {
  const currentIndex = lifecycle.indexOf(incident.lifecycle_status);
  const shouldAdvance = tick % 3 === 0 || incident.spread_probability >= 82;
  const nextIndex = shouldAdvance ? Math.min(lifecycle.length - 1, currentIndex + 1) : currentIndex;
  const lifecycle_status = lifecycle[nextIndex] ?? incident.lifecycle_status;
  const improving = nextIndex > currentIndex && nextIndex >= lifecycle.indexOf("Responding");
  const etaDelta = improving ? -1 : incident.lifecycle_status === "Detected" ? 1 : 0;
  const spreadDelta = improving ? -6 : lifecycle_status === "Escalated" ? 4 : -2;
  const timestamp = new Date(Date.now() + tick * 30_000).toISOString();
  const nextLog =
    nextIndex > currentIndex
      ? [
          {
            id: `${incident.id}-log-${tick}`,
            message: statusMessage(lifecycle_status, incident.location),
            timestamp,
            type: "ai" as const,
          },
        ]
      : [];

  return {
    ...incident,
    confidence: Math.min(98, (incident.confidence ?? 88) + (improving ? 1 : 0)),
    decision_confidence: Math.min(98, (incident.decision_confidence ?? 89) + (improving ? 1 : 0)),
    eta_minutes: Math.max(1, incident.eta_minutes + etaDelta),
    lifecycle_status,
    spread_probability: Math.max(8, Math.min(96, incident.spread_probability + spreadDelta)),
    status: statusToIncidentStatus(lifecycle_status),
    timeline_logs: [...nextLog, ...incident.timeline_logs].slice(0, 6),
    updated_at: timestamp,
  };
}

export function createLiveIncident(seed: {
  category: string;
  id: string;
  lat: number;
  lifecycle_status?: LiveIncidentStatus;
  lng: number;
  location: string;
  severity: number;
  source: string;
  title: string;
}): LiveIncident {
  const lifecycle_status = seed.lifecycle_status ?? "Detected";
  const now = new Date().toISOString();
  return {
    ai_summary: `${seed.title} verified by sensor fusion and local command policy.`,
    assigned_team: seed.severity >= 4 ? "Fire Team Alpha" : "Security Bravo",
    assigned_to: seed.severity >= 4 ? "Fire Team Alpha" : "Security Bravo",
    category: seed.category,
    confidence: 90 + seed.severity,
    created_at: now,
    decision_confidence: 88 + seed.severity,
    description: `${seed.source} reported ${seed.title.toLowerCase()} at ${seed.location}.`,
    detected_by: seed.source,
    eta_minutes: Math.max(2, 8 - seed.severity),
    id: seed.id,
    incident_type: seed.category,
    lat: seed.lat,
    lifecycle_status,
    lng: seed.lng,
    location: seed.location,
    priority: seed.severity >= 4 ? "critical" : seed.severity >= 3 ? "high" : "watch",
    recommended_action:
      seed.severity >= 4
        ? "Dispatch responders, isolate zone, and open evacuation route."
        : "Verify signal, stage responders, and monitor route pressure.",
    responders_assigned: seed.severity >= 4 ? ["Fire Team Alpha", "Medic Unit 2"] : ["Security Bravo"],
    risk_level: seed.severity >= 4 ? "critical" : "elevated",
    severity: seed.severity,
    source: seed.source,
    spread_probability: Math.min(92, 38 + seed.severity * 11),
    status: statusToIncidentStatus(lifecycle_status),
    timeline_logs: [
      {
        id: `${seed.id}-log-0`,
        message: statusMessage(lifecycle_status, seed.location),
        timestamp: now,
        type: "sensor",
      },
    ],
    title: seed.title,
    type: seed.category,
    updated_at: now,
  };
}
