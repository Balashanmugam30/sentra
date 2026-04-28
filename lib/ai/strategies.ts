import type { AIDecisionIncident, AIDecisionScores, AIDecisionStrategy } from "@/lib/ai/types";

export function compareDecisionStrategies(
  incident: AIDecisionIncident,
  scores: AIDecisionScores,
): AIDecisionStrategy[] {
  const blockedPenalty = incident.blocked_exits.length * 3;
  const severity = scores.severity_score;
  const eta = incident.responders_eta_minutes;
  const strategies: AIDecisionStrategy[] = [
    {
      option_id: "A",
      name: "Immediate evacuation",
      success_probability: Math.min(97, 68 + Math.floor(severity / 4) - blockedPenalty),
      estimated_evacuation_time: `${Math.max(4, 12 - eta)} min`,
      casualty_reduction_estimate: Math.min(94, 54 + Math.floor(severity / 3)),
      operational_disruption: 78,
      confidence: 88,
      score: 0,
    },
    {
      option_id: "B",
      name: "Targeted zone lockdown",
      success_probability: severity < 85 ? 74 : 62,
      estimated_evacuation_time: "6 min",
      casualty_reduction_estimate: 66,
      operational_disruption: 42,
      confidence: 72,
      score: 0,
    },
    {
      option_id: "C",
      name: "Responder-first containment",
      success_probability: eta <= 3 ? 82 : 68,
      estimated_evacuation_time: "8 min",
      casualty_reduction_estimate: 71,
      operational_disruption: 50,
      confidence: 79,
      score: 0,
    },
    {
      option_id: "D",
      name: "Shelter in place",
      success_probability: incident.incident_type === "utility" || incident.incident_type === "validation" ? 76 : 41,
      estimated_evacuation_time: "not applicable",
      casualty_reduction_estimate: 44,
      operational_disruption: 22,
      confidence: 58,
      score: 0,
    },
  ];

  return strategies
    .map((strategy) => ({
      ...strategy,
      score: Math.round(
        strategy.success_probability * 0.38 +
          strategy.casualty_reduction_estimate * 0.32 +
          strategy.confidence * 0.2 -
          strategy.operational_disruption * 0.1,
      ),
    }))
    .sort((a, b) => b.score - a.score);
}
