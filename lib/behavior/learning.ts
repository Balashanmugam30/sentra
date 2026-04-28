import { apiClient } from "@/lib/core/api-client";

export type LearnedIncident = {
  incident_id: string;
  name: string;
  scenario: string;
  population_type: string;
  action_chosen: string;
  crowd_outcome: string;
  evacuation_time_minutes: number;
  baseline_time_minutes: number;
  injuries_prevented: number;
  compliance_percent: number;
  panic_reduction_percent: number;
  trust_delta: number;
  success_score: number;
  failed_actions: string[];
  improved_weight: string;
  future_recommendation: string;
  best_next_move: string;
  roi_saved: number;
};

export type UpdatedPlaybook = {
  playbook_id: string;
  title: string;
  improvement: string;
  population_type: string;
  confidence: number;
};

export type FutureSignal = {
  signal: string;
  probability: number;
  trigger: string;
  countermeasure: string;
};

export type TrustDrift = {
  source: string;
  trust: number;
  drift: string;
};

export type LearningSnapshot = {
  generated_at: string;
  model_improvement_score: number;
  episodes_learned: number;
  avg_panic_reduction: number;
  avg_compliance: number;
  evacuation_minutes_saved: number;
  injuries_prevented: number;
  roi_saved_estimate: number;
  incident_memory_ledger: LearnedIncident[];
  successful_actions: string[];
  failed_actions: string[];
  population_pattern_insights: string[];
  updated_playbooks: UpdatedPlaybook[];
  future_risk_signals: FutureSignal[];
  learning_timeline: Array<{ phase: string; gain: string; detail: string }>;
  trust_drift: TrustDrift[];
  executive_summary: string;
};

export type MemoryGraph = {
  generated_at: string;
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ from: string; to: string; strength: number }>;
  memory_depth: number;
};

export type BehaviorAgent = {
  agent_id: string;
  name: string;
  priority: string;
  plan: string;
  confidence: number;
  constraint: string;
  reasoning: string;
};

export type CouncilSnapshot = {
  generated_at: string;
  agents: BehaviorAgent[];
  debate_feed: Array<{ round: number; speaker: string; message: string }>;
  consensus: {
    score: number;
    alignment: string;
    dissent: string;
    confidence: number;
  };
  final_unified_plan: string[];
  human_approval_gate: {
    required: boolean;
    pending_action: string;
    safe_autonomous_scope: string;
    sla_minutes: number;
  };
  secondary_reactions: FutureSignal[];
  adaptive_messages: Array<{ population: string; style: string }>;
};

export type LearningMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export function calculateLearningGain(incident: Pick<LearnedIncident, "panic_reduction_percent" | "compliance_percent" | "success_score">) {
  return Math.min(100, Math.round(incident.success_score * 0.5 + incident.panic_reduction_percent * 0.25 + incident.compliance_percent * 0.25));
}

export function forecastSecondaryReaction(signal: FutureSignal) {
  if (signal.probability >= 50) {
    return "preempt now";
  }
  if (signal.probability >= 35) {
    return "watch and prepare";
  }
  return "monitor";
}

export function adaptiveMessageForPopulation(population: string) {
  const normalized = population.toLowerCase();
  if (normalized.includes("student")) {
    return "authoritative campus voice plus app confirmation";
  }
  if (normalized.includes("patient") || normalized.includes("elderly")) {
    return "quiet clinical escort instructions";
  }
  if (normalized.includes("guest")) {
    return "staff-led calm instructions with floor specificity";
  }
  return "short translated commands plus visible arrows";
}

export const fallbackLearning: LearningSnapshot = {
  generated_at: "2026-04-26T00:00:00.000Z",
  model_improvement_score: 89,
  episodes_learned: 5,
  avg_panic_reduction: 31,
  avg_compliance: 79,
  evacuation_minutes_saved: 55,
  injuries_prevented: 72,
  roi_saved_estimate: 2910000,
  incident_memory_ledger: [
    { incident_id: "LEARN-MALL-PANIC", name: "Mall Panic Reduced by Calm Messaging", scenario: "Mall Fire Panic", population_type: "families and retail visitors", action_chosen: "calm authority announcement with exit marshals", crowd_outcome: "panic pockets stabilized and food court flow split cleanly", evacuation_time_minutes: 19, baseline_time_minutes: 27, injuries_prevented: 14, compliance_percent: 78, panic_reduction_percent: 31, trust_delta: 9, success_score: 91, failed_actions: ["single-exit signage", "generic alarm repetition"], improved_weight: "increase message clarity weight by 8%", future_recommendation: "launch calm authority message before full siren escalation", best_next_move: "split high-density food court flow before stairwell pressure crosses 80", roi_saved: 480000 },
    { incident_id: "LEARN-HOTEL-SPLIT", name: "Hotel Floor Congestion Solved by Exit Split", scenario: "Hotel Smoke Floor 8", population_type: "hotel guests and staff", action_chosen: "split Floor 8 between Stairwell B and service stair", crowd_outcome: "corridor pressure dropped and assisted guests moved first", evacuation_time_minutes: 16, baseline_time_minutes: 24, injuries_prevented: 8, compliance_percent: 83, panic_reduction_percent: 24, trust_delta: 11, success_score: 94, failed_actions: ["elevator reassurance", "delayed staff dispatch"], improved_weight: "raise stairwell load penalty by 6%", future_recommendation: "reserve service stair earlier for mobility support", best_next_move: "send visible floor captain before smoke visibility falls below 60", roi_saved: 340000 },
    { incident_id: "LEARN-STADIUM-RUMOR", name: "Stadium Rumor Stopped by Targeted Alerts", scenario: "Stadium Exit Rush", population_type: "event crowd and multilingual visitors", action_chosen: "targeted rumor correction plus controlled gate release", crowd_outcome: "rumor spread slowed and gate pressure normalized", evacuation_time_minutes: 22, baseline_time_minutes: 35, injuries_prevented: 22, compliance_percent: 71, panic_reduction_percent: 38, trust_delta: 7, success_score: 89, failed_actions: ["silent security movement", "non-localized public address"], improved_weight: "increase rumor signal sensitivity by 10%", future_recommendation: "publish verified localized message within 60 seconds", best_next_move: "activate multilingual gate stewards and route confidence boards", roi_saved: 760000 },
  ],
  successful_actions: ["calm authority announcement with exit marshals", "split Floor 8 between Stairwell B and service stair", "targeted rumor correction plus controlled gate release"],
  failed_actions: ["single-exit signage", "generic alarm repetition", "elevator reassurance", "delayed staff dispatch"],
  population_pattern_insights: [
    "Hotel guests comply faster when staff are visible before smoke becomes visible.",
    "Students need rumor correction and app confirmation before phased release.",
    "Patients require quiet clinical instructions and escort teams before public routing.",
    "Event crowds respond best to localized gate messages and visible flow stewards.",
  ],
  updated_playbooks: [
    { playbook_id: "PLAYBOOK-001", title: "launch calm authority message before full siren escalation", improvement: "increase message clarity weight by 8%", population_type: "families and retail visitors", confidence: 95 },
    { playbook_id: "PLAYBOOK-002", title: "reserve service stair earlier for mobility support", improvement: "raise stairwell load penalty by 6%", population_type: "hotel guests and staff", confidence: 98 },
  ],
  future_risk_signals: [
    { signal: "panic rebound", probability: 34, trigger: "announcement gap exceeds 90 seconds", countermeasure: "repeat calm authority message" },
    { signal: "rumor spread", probability: 52, trigger: "social chatter rises before official update", countermeasure: "publish localized verified update" },
  ],
  learning_timeline: [
    { phase: "Incident captured", gain: "+6%", detail: "Action, crowd outcome, panic reduction, and compliance stored" },
    { phase: "Weights improved", gain: "+9%", detail: "Message clarity and stairwell pressure weights adjusted" },
    { phase: "Playbook evolved", gain: "+12%", detail: "Population-specific intervention plans generated" },
  ],
  trust_drift: [
    { source: "Safety Agent", trust: 96, drift: "+7" },
    { source: "Crowd Dynamics Agent", trust: 94, drift: "+9" },
    { source: "Communications Agent", trust: 95, drift: "+11" },
  ],
  executive_summary: "Sentra learned that early visible leadership, population-specific messaging, and split-flow routing produce the strongest reduction in panic and evacuation delay.",
};

export const fallbackMemory: MemoryGraph = {
  generated_at: fallbackLearning.generated_at,
  nodes: fallbackLearning.incident_memory_ledger.flatMap((incident) => [
    { id: `scenario:${incident.scenario}`, label: incident.scenario, type: "scenario" },
    { id: `action:${incident.action_chosen}`, label: incident.action_chosen, type: "action" },
    { id: `outcome:${incident.crowd_outcome}`, label: incident.crowd_outcome, type: "outcome" },
  ]),
  edges: fallbackLearning.incident_memory_ledger.flatMap((incident) => [
    { from: `scenario:${incident.scenario}`, to: `action:${incident.action_chosen}`, strength: incident.success_score },
    { from: `action:${incident.action_chosen}`, to: `outcome:${incident.crowd_outcome}`, strength: incident.panic_reduction_percent },
  ]),
  memory_depth: 15,
};

export const fallbackCouncil: CouncilSnapshot = {
  generated_at: fallbackLearning.generated_at,
  agents: [
    { agent_id: "AGENT-SAFETY", name: "Safety Agent", priority: "reduce harm first", plan: "meter exits and prevent pushing at convergence points", confidence: 91, constraint: "do not overload stairwells", reasoning: "Safety improves fastest when flow is controlled before panic peaks." },
    { agent_id: "AGENT-CROWD", name: "Crowd Dynamics Agent", priority: "stabilize movement", plan: "split high-density zones into two exit streams", confidence: 91, constraint: "keep corridor pressure under 80", reasoning: "Split flow reduces stampede risk and preserves route trust." },
    { agent_id: "AGENT-COMMS", name: "Communications Agent", priority: "increase compliance", plan: "broadcast localized calm authority message every 45 seconds", confidence: 94, constraint: "avoid conflicting instructions", reasoning: "Repeated clear messages prevent rumor rebound and freeze behavior." },
  ],
  debate_feed: [
    { round: 1, speaker: "Crowd Dynamics Agent", message: "Split flow now; single-gate pressure is the highest stampede driver." },
    { round: 2, speaker: "Communications Agent", message: "Message must name the alternate route and repeat every 45 seconds." },
    { round: 3, speaker: "Safety Agent", message: "Consensus: split flow, preserve assisted lane, and issue localized calm authority instructions." },
  ],
  consensus: { score: 89, alignment: "strong", dissent: "Ethics Agent requires approval for hard lockdown only", confidence: 92 },
  final_unified_plan: ["Broadcast population-specific calm authority message immediately", "Split crowd between primary and secondary exits using 60/40 flow", "Reserve assisted evacuation lane with medical escort team", "Require human approval before lockdown or coercive intervention"],
  human_approval_gate: { required: true, pending_action: "hard lockdown and high-coercion broadcast remain approval-gated", safe_autonomous_scope: "messages, responder staging, exit metering, and assistance lane preservation", sla_minutes: 2 },
  secondary_reactions: fallbackLearning.future_risk_signals,
  adaptive_messages: [
    { population: "students", style: "authoritative campus voice plus app confirmation" },
    { population: "hotel guests", style: "staff-led calm instructions with floor specificity" },
    { population: "patients", style: "quiet clinical escort instructions" },
  ],
};

export function getLearning() {
  return apiClient.requestData<{ data: LearningSnapshot }>("/behavior/learning", {
    priority: "high",
    cacheTtlMs: 10_000,
  });
}

export function getMemory() {
  return apiClient.requestData<{ data: MemoryGraph }>("/behavior/memory", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function getCouncil() {
  return apiClient.requestData<{ data: CouncilSnapshot }>("/behavior/council", {
    priority: "high",
    cacheTtlMs: 10_000,
  });
}

export function runLearningCycle(scenario = "latest_human_outcome") {
  return apiClient.requestData<LearningMutationResponse>("/behavior/learn", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function runBehaviorCouncil(scenario = "active_crisis") {
  return apiClient.requestData<LearningMutationResponse>("/behavior/council/run", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function approveBehaviorPolicy(policy_id = "POLICY-MSG-CLARITY-001") {
  return apiClient.requestData<LearningMutationResponse>("/behavior/policy/approve", {
    method: "POST",
    body: { policy_id },
    priority: "high",
  });
}
