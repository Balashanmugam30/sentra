import type { LiveIncident } from "@/lib/engines/incident-intelligence";

export type AIActionState = "pending" | "approved" | "rejected" | "auto-running";

export type LiveAIRecommendation = {
  id: string;
  action: string;
  confidence: number;
  impact: string;
  incidentId?: string;
  reason: string;
  state: AIActionState;
  urgency: number;
  zone: string;
};

const actionTemplates = [
  "Dispatch Fire Team Alpha",
  "Lockdown East Wing",
  "Send Public Alert",
  "Shut HVAC Zone B",
  "Escalate to Executive",
  "Open Medical Corridor",
] as const;

export function buildAIRecommendations(incidents: LiveIncident[], tick: number): LiveAIRecommendation[] {
  const active = incidents.filter((incident) => incident.status !== "resolved");
  const incidentActions = active.slice(0, 4).map((incident, index) => {
    const action =
      actionTemplates[(incident.severity + index + tick) % actionTemplates.length] ??
      "Dispatch Fire Team Alpha";
    const state: AIActionState = incident.severity >= 5 ? "auto-running" : "pending";
    return {
      action,
      confidence: Math.min(97, (incident.decision_confidence ?? 88) + index),
      id: `ai-${incident.id}-${index}`,
      impact:
        incident.severity >= 4
          ? "Reduces exposure window and keeps evacuation load below threshold."
          : "Improves verification speed and preserves responder reserve.",
      incidentId: incident.id,
      reason: `${incident.lifecycle_status} incident at ${incident.location} has ${incident.spread_probability}% spread probability.`,
      state,
      urgency: Math.min(99, incident.severity * 18 + incident.spread_probability / 3),
      zone: incident.location,
    } satisfies LiveAIRecommendation;
  });
  const reserveAction: LiveAIRecommendation = {
    action: "Rebalance reserve responders",
    confidence: 92,
    id: "ai-reserve-rebalance",
    impact: "Moves idle coverage closer to high-pressure zones without draining standby capacity.",
    reason: "Reserve capacity is healthy but response pressure is uneven across facilities.",
    state: "pending",
    urgency: 74,
    zone: "global",
  };

  return [
    ...incidentActions,
    reserveAction,
  ].sort((a, b) => b.urgency - a.urgency);
}
