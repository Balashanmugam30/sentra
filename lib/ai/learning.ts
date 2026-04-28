import { buildDecisionEvolution, localLearningMemory } from "@/lib/ai/memory";
import { buildPolicyRecommendations } from "@/lib/ai/policy";
import { buildTrustDrift } from "@/lib/ai/trust";
import { buildFutureBranches, buildWeakSignals } from "@/lib/ai/weakSignals";
import type { AILearningResponse, LearningStrategy, SimulationScenario } from "@/lib/ai/types";

function bestStrategies(): LearningStrategy[] {
  return [
    {
      strategy: "Phased evacuation + medical corridor",
      win_rate: 94,
      avg_response_gain: "+32%",
      best_for: "fire, hospital, high occupancy",
      evidence: "Reduced stairwell congestion across hotel and ICU simulations.",
      score: 96,
    },
    {
      strategy: "HVAC shutdown before broad gas evacuation",
      win_rate: 91,
      avg_response_gain: "+24%",
      best_for: "gas leak, basement utility rooms",
      evidence: "Lower false panic and faster source isolation.",
      score: 92,
    },
    {
      strategy: "Perimeter plus guided exit lanes",
      win_rate: 89,
      avg_response_gain: "+27%",
      best_for: "crowd surge, mall, stadium",
      evidence: "Reduced backflow and protected responder ingress.",
      score: 90,
    },
  ];
}

function worstStrategies(): LearningStrategy[] {
  return [
    {
      strategy: "Immediate full evacuation without lane control",
      failure_mode: "Stairwell congestion and medical access delay",
      correction: "Use phased movement and protected triage lane.",
      score: 61,
    },
    {
      strategy: "Public broadcast before verification",
      failure_mode: "Panic amplification and rumor acceleration",
      correction: "Send internal zone instructions first; hold public statement.",
      score: 58,
    },
  ];
}

export const simulationScenarios: SimulationScenario[] = [
  { scenario_id: "hotel_fire_night_shift", label: "Hotel fire night shift", runs: 420, improvement: "+29%", best_plan: "Phased evacuation + fire containment" },
  { scenario_id: "stadium_panic", label: "Stadium panic", runs: 260, improvement: "+22%", best_plan: "Guided exit lanes + perimeter" },
  { scenario_id: "oxygen_leak", label: "Oxygen leak", runs: 310, improvement: "+34%", best_plan: "Medical-first corridor preservation" },
  { scenario_id: "flood_outage", label: "Flood + outage", runs: 185, improvement: "+18%", best_plan: "Shelter route plus generator protection" },
  { scenario_id: "mall_surge", label: "Mall surge", runs: 295, improvement: "+27%", best_plan: "Crowd flow metering" },
];

export function buildLocalLearningSnapshot(): AILearningResponse {
  return {
    generated_at: new Date().toISOString(),
    learning_score: 88,
    learning_maturity: "adaptive",
    episodes_learned: localLearningMemory.length,
    memory: localLearningMemory,
    similar_incidents: localLearningMemory.slice(0, 3),
    best_strategies: bestStrategies(),
    worst_strategies: worstStrategies(),
    improvement_trend: [
      { label: "Baseline", score: 72 },
      { label: "Memory replay", score: 81 },
      { label: "Council overrides", score: 88 },
      { label: "Current", score: 90 },
    ],
    override_reasons: [
      { reason: "Need protected medical corridor", count: 8, policy_effect: "Medical weighting increased" },
      { reason: "Single sensor not trusted", count: 5, policy_effect: "Require second signal for broad evacuation" },
      { reason: "Public alert too early", count: 4, policy_effect: "Comms gating tightened" },
    ],
    trust_drift: buildTrustDrift(),
    policy_recommendations: buildPolicyRecommendations(),
    weak_signals: buildWeakSignals(),
    future_forecast: buildFutureBranches(),
    decision_evolution: buildDecisionEvolution(),
    simulation_lab: simulationScenarios,
    governance: {
      mode: "learn_with_approval",
      available_modes: ["observe_only", "recommend_only", "learn_with_approval", "learn_automatically_safe_scope"],
      policy_revision: 4,
      approved_policies: [],
    },
    executive_value: {
      response_time_improvement: "+31%",
      false_alarm_reduction: "+24%",
      trust_increase: "+18%",
      prevented_losses_estimate: "$1.9M",
      learning_maturity_score: 88,
      summary: "Sentra is converting incident outcomes and human overrides into safer, faster response policy.",
    },
    learning_timeline: [
      {
        timestamp: new Date().toISOString(),
        event: "Learning model loaded",
        detail: "Deterministic local adaptive model ready for fallback operation.",
        severity: "low",
      },
    ],
  };
}
