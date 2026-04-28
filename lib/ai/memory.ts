import type { DecisionEvolution, LearningMemoryEpisode } from "@/lib/ai/types";

export const localLearningMemory: LearningMemoryEpisode[] = [
  {
    memory_id: "LEARN-001",
    incident_type: "hotel_fire",
    severity: 84,
    chosen_plan: "Full evacuation",
    final_outcome: "Contained with stairwell congestion",
    response_time_minutes: 14,
    casualties_avoided: 41,
    overrides: ["Medical lane added after congestion observed"],
    confidence_at_time: 81,
    environmental_conditions: "Dinner rush, west corridor smoke, 428 occupants",
    strategy_score: 78,
  },
  {
    memory_id: "LEARN-002",
    incident_type: "gas_leak",
    severity: 79,
    chosen_plan: "HVAC shutdown plus targeted evacuation",
    final_outcome: "Gas isolated before public panic",
    response_time_minutes: 11,
    casualties_avoided: 27,
    overrides: [],
    confidence_at_time: 86,
    environmental_conditions: "Basement generator bay, humid night, low occupancy",
    strategy_score: 89,
  },
  {
    memory_id: "LEARN-003",
    incident_type: "hospital_oxygen",
    severity: 88,
    chosen_plan: "Responder-first containment",
    final_outcome: "ICU route preserved, medics staged late",
    response_time_minutes: 18,
    casualties_avoided: 64,
    overrides: ["Medical weighting increased by command"],
    confidence_at_time: 78,
    environmental_conditions: "ICU oxygen manifold, vulnerable patients, service lift blocked",
    strategy_score: 74,
  },
  {
    memory_id: "LEARN-004",
    incident_type: "crowd_surge",
    severity: 82,
    chosen_plan: "Perimeter plus guided exit lanes",
    final_outcome: "Crowd pressure reduced without stampede",
    response_time_minutes: 9,
    casualties_avoided: 112,
    overrides: [],
    confidence_at_time: 90,
    environmental_conditions: "Rain outside, weekend peak, escalator blockage",
    strategy_score: 93,
  },
];

export function findSimilarIncidents(incidentType: string) {
  return localLearningMemory
    .filter((episode) => episode.incident_type.includes(incidentType) || incidentType.includes(episode.incident_type))
    .slice(0, 3);
}

export function buildDecisionEvolution(): DecisionEvolution {
  return {
    past_recommendation: "Full evacuation",
    current_recommendation: "Phased evacuation + medical corridor",
    benefit: "32% faster movement with lower stairwell congestion",
    confidence_before: 78,
    confidence_after: 91,
    why_changed: [
      "Medical overrides repeatedly improved outcomes.",
      "Corridor congestion was the dominant failure mode.",
      "Camera validation reduced false-positive evacuation pressure.",
    ],
  };
}
