import type { AIDecisionForecastItem, AIDecisionIncident, AIDecisionScores } from "@/lib/ai/types";

export function buildDecisionForecast(
  incident: AIDecisionIncident,
  scores: AIDecisionScores,
): AIDecisionForecastItem[] {
  const escalation = scores.escalation_risk;
  return [
    {
      window: "Next 5 min",
      prediction:
        escalation >= 70
          ? `${incident.incident_type} signature may spread beyond ${incident.zone}`
          : "Incident remains localized pending validation",
      risk: Math.min(100, escalation),
      recommended_watch: "camera visibility and nearest stairwell congestion",
    },
    {
      window: "Next 15 min",
      prediction: incident.blocked_exits.length
        ? `Congestion likely if ${incident.blocked_exits[0]} remains blocked`
        : "Responder containment likely if first action starts immediately",
      risk: Math.min(100, escalation + 6),
      recommended_watch: "evacuation throughput and responder ETA",
    },
    {
      window: "Next 60 min",
      prediction: "Operational disruption depends on containment success and executive communications",
      risk: Math.max(18, escalation - 14),
      recommended_watch: "re-entry readiness, agency handoff, and stakeholder updates",
    },
  ];
}
