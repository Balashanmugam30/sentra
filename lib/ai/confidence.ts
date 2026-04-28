import type { AIDecisionConfidence, AIDecisionIncident, AIDecisionStrategy } from "@/lib/ai/types";

export function buildDecisionConfidence(
  incident: AIDecisionIncident,
  strategy: AIDecisionStrategy,
): AIDecisionConfidence {
  const dataQuality = Math.max(52, Math.min(98, incident.node_health - incident.blocked_exits.length * 3));
  return {
    data_quality_score: dataQuality,
    sensor_confidence: incident.node_health,
    camera_confidence: incident.camera_confidence,
    recommendation_confidence: strategy.confidence,
    missing_data_warnings:
      dataQuality >= 75 ? [] : ["Some telemetry paths are degraded; keep human review active."],
    human_review_required: dataQuality < 70 || strategy.confidence < 65,
  };
}
