import type {
  AICouncilAgent,
  AICouncilDebate,
  AICouncilLearning,
  AICouncilPlan,
  AICouncilScenario,
  AICouncilSummary,
} from "@/lib/ai/types";

export const aiCouncilScenarios: AICouncilScenario[] = [
  { scenario_id: "hotel_fire_dual_incident", label: "Hotel fire dual incident", objective: "minimize casualties", threat_stack: ["floor 3 kitchen fire", "corridor smoke", "guest panic cluster", "west stairwell blocked"], mlops_signal: 91, soc_signal: 23, route_health: 84, resource_load: 62, finance_exposure: 72, public_pressure: 68, cyber_pressure: 18, human_risk: 87, eta_to_stability: "11 min" },
  { scenario_id: "gas_leak_with_panic", label: "Gas leak with panic", objective: "minimize casualties", threat_stack: ["gas spike", "panic on floor 8", "mixed alarm compliance", "HVAC isolation pending"], mlops_signal: 86, soc_signal: 14, route_health: 79, resource_load: 58, finance_exposure: 61, public_pressure: 55, cyber_pressure: 12, human_risk: 82, eta_to_stability: "14 min" },
  { scenario_id: "cyber_attack_during_evac", label: "Cyber attack during evacuation", objective: "maintain continuity", threat_stack: ["access control anomaly", "camera dropout", "evacuation active", "webhook retries failing"], mlops_signal: 78, soc_signal: 88, route_health: 67, resource_load: 71, finance_exposure: 79, public_pressure: 64, cyber_pressure: 92, human_risk: 74, eta_to_stability: "18 min" },
  { scenario_id: "stadium_rush_behavior", label: "Stadium rush behavior", objective: "minimize casualties", threat_stack: ["gate A compression", "rumor spread", "medical lane blocked", "security perimeter strain"], mlops_signal: 83, soc_signal: 18, route_health: 61, resource_load: 76, finance_exposure: 66, public_pressure: 81, cyber_pressure: 20, human_risk: 93, eta_to_stability: "16 min" },
  { scenario_id: "hospital_system_outage", label: "Hospital system outage", objective: "maintain continuity", threat_stack: ["oxygen telemetry degraded", "backup generator watch", "ICU routing constrained", "communications fallback active"], mlops_signal: 80, soc_signal: 31, route_health: 73, resource_load: 69, finance_exposure: 74, public_pressure: 59, cyber_pressure: 42, human_risk: 71, eta_to_stability: "22 min" },
  { scenario_id: "enterprise_pr_crisis", label: "Enterprise PR crisis", objective: "protect reputation", threat_stack: ["viral misinformation", "board inquiry", "customer churn risk", "incident footage requested"], mlops_signal: 62, soc_signal: 47, route_health: 91, resource_load: 38, finance_exposure: 84, public_pressure: 94, cyber_pressure: 56, human_risk: 48, eta_to_stability: "28 min" },
];

export const aiCouncilAgents: AICouncilAgent[] = [
  { agent_id: "commander_agent", name: "Commander Agent", role: "speed + containment", avatar: "CMD", priority: "fastest stabilized outcome", trust_score: 94, accepted_recommendations: 82, override_rate: 9, false_positive_rate: 4, success_rate: 91, confidence_calibration: 93, color: "cyan", current_focus: "Drive stability in 11 min", recommended_option: "surge_response", recommended_option_label: "Surge response", alignment_with_plan: 94, urgency: 91, confidence: 93, option_scores: [], reasoning: "Surge response is favored because stability must be achieved before smoke and panic couple." },
  { agent_id: "safety_agent", name: "Safety Agent", role: "life protection", avatar: "SAFE", priority: "minimize casualties", trust_score: 96, accepted_recommendations: 88, override_rate: 6, false_positive_rate: 3, success_rate: 94, confidence_calibration: 95, color: "emerald", current_focus: "Reduce human risk 87/100", recommended_option: "surge_response", recommended_option_label: "Surge response", alignment_with_plan: 97, urgency: 91, confidence: 95, option_scores: [], reasoning: "Life safety dominates because human risk and MLOps escalation are both high." },
  { agent_id: "logistics_agent", name: "Logistics Agent", role: "resources + routing", avatar: "LOG", priority: "move people and teams efficiently", trust_score: 92, accepted_recommendations: 79, override_rate: 11, false_positive_rate: 5, success_rate: 90, confidence_calibration: 91, color: "blue", current_focus: "Protect route health 84/100", recommended_option: "corridor_first", recommended_option_label: "Corridor first", alignment_with_plan: 88, urgency: 62, confidence: 91, option_scores: [], reasoning: "Corridor-first sequencing keeps responder and evacuee flows from crossing." },
  { agent_id: "finance_agent", name: "Finance Agent", role: "loss minimization", avatar: "FIN", priority: "protect revenue without slowing safety", trust_score: 88, accepted_recommendations: 71, override_rate: 15, false_positive_rate: 7, success_rate: 86, confidence_calibration: 89, color: "amber", current_focus: "Limit exposure 72/100", recommended_option: "targeted_lockdown", recommended_option_label: "Targeted lockdown", alignment_with_plan: 82, urgency: 72, confidence: 89, option_scores: [], reasoning: "Targeted lockdown limits business interruption after safety actions begin." },
  { agent_id: "reputation_agent", name: "Reputation Agent", role: "brand + public trust", avatar: "PR", priority: "clear public narrative", trust_score: 90, accepted_recommendations: 74, override_rate: 13, false_positive_rate: 6, success_rate: 87, confidence_calibration: 90, color: "violet", current_focus: "Manage public pressure 68/100", recommended_option: "corridor_first", recommended_option_label: "Corridor first", alignment_with_plan: 86, urgency: 68, confidence: 90, option_scores: [], reasoning: "Corridor-first creates a credible public story: organized, targeted, and safe." },
  { agent_id: "cyber_agent", name: "Cyber Agent", role: "digital threats", avatar: "CYB", priority: "protect command systems", trust_score: 91, accepted_recommendations: 76, override_rate: 12, false_positive_rate: 5, success_rate: 89, confidence_calibration: 92, color: "indigo", current_focus: "Contain cyber pressure 18/100", recommended_option: "surge_response", recommended_option_label: "Surge response", alignment_with_plan: 91, urgency: 18, confidence: 92, option_scores: [], reasoning: "Digital pressure is low, so cyber fallback stays queued rather than blocking field action." },
  { agent_id: "human_behavior_agent", name: "Human Behavior Agent", role: "panic + compliance", avatar: "HUM", priority: "stabilize people", trust_score: 95, accepted_recommendations: 86, override_rate: 7, false_positive_rate: 4, success_rate: 93, confidence_calibration: 94, color: "rose", current_focus: "Increase compliance and prevent panic rebound", recommended_option: "surge_response", recommended_option_label: "Surge response", alignment_with_plan: 96, urgency: 87, confidence: 94, option_scores: [], reasoning: "High human risk requires immediate calm guidance paired with visible responder motion." },
  { agent_id: "governance_agent", name: "Governance Agent", role: "policy + legal guardrails", avatar: "GOV", priority: "safe autonomy", trust_score: 93, accepted_recommendations: 81, override_rate: 10, false_positive_rate: 3, success_rate: 92, confidence_calibration: 93, color: "slate", current_focus: "Keep autonomy inside approval guardrails", recommended_option: "surge_response", recommended_option_label: "Surge response", alignment_with_plan: 92, urgency: 72, confidence: 93, option_scores: [], reasoning: "Plan is acceptable if public-impact actions remain approval gated and logged." },
];

export const aiCouncilPlan: AICouncilPlan = {
  generated_at: "2026-04-26T00:00:00.000Z",
  plan_id: "PLAN-HOTEL_FIRE_DUAL_INCIDENT-SURGE_RESPONSE",
  objective: "minimize casualties",
  winner: { option_id: "surge_response", label: "Surge response", base_score: 91, speed: 94, safety: 93, continuity: 78, reputation: 86, cost_control: 66, score: 93, objective_fit: 88, pressure_adjustment: 65 },
  ranked_actions: [
    { action_id: "ACT-001", rank: 1, title: "Execute Surge response response", owner: "Commander Agent", system: "Workflow automations", decision: "approve", confidence: 93, approval_required: true },
    { action_id: "ACT-002", rank: 2, title: "Dispatch resources to highest-risk zone", owner: "Logistics Agent", system: "Resource systems", decision: "queue", confidence: 92, approval_required: false },
    { action_id: "ACT-003", rank: 3, title: "Send targeted human-stabilizing communications", owner: "Human Behavior Agent", system: "Communications", decision: "execute", confidence: 91, approval_required: false },
    { action_id: "ACT-004", rank: 4, title: "Open executive continuity brief", owner: "Finance Agent", system: "Finance impact models", decision: "approve", confidence: 86, approval_required: true },
  ],
  resource_orders: [
    { resource: "Ops Alpha", order: "Move to primary incident zone", eta: "3 min" },
    { resource: "Security Bravo", order: "Hold perimeter while keeping safe exits open", eta: "4 min" },
    { resource: "Comms Desk", order: "Send role and zone targeted message", eta: "90 sec" },
  ],
  eta_to_stability: "11 min",
  approval_required: true,
  explainability: [
    "MLOps risk signal 91 and human risk 87 increased urgency.",
    "Objective 'minimize casualties' shifted weights toward Surge response.",
    "Cyber, communications, workflow, resources, and finance signals were included before ranking actions.",
  ],
};

export const aiCouncilDebate: AICouncilDebate = {
  generated_at: "2026-04-26T00:00:00.000Z",
  scenario: aiCouncilScenarios[0] as AICouncilScenario,
  objective: "minimize casualties",
  options: [aiCouncilPlan.winner],
  rounds: [
    { round: 1, theme: "Objective interpretation", speaker: "Commander Agent", position: "Objective is minimize casualties; stabilize dual incident with surge response.", challenge: "Governance Agent requires approval before public-impact actions." },
    { round: 2, theme: "Safety versus continuity", speaker: "Safety Agent", position: "Life safety weighting dominates while preserving responder lanes.", challenge: "Finance Agent accepts higher cost if ETA to stability improves." },
    { round: 3, theme: "Cross-module orchestration", speaker: "Logistics Agent", position: "Use MLOps risk, route health, communications, and resources to sequence actions.", challenge: "Cyber Agent demands fallback channels if SOC pressure rises." },
    { round: 4, theme: "Final merge", speaker: "Governance Agent", position: "Approve surge response with human checkpoint and audit evidence.", challenge: "All agents accept policy guardrails and rollback path." },
  ],
  conflicts: [
    { conflict: "Speed vs safety", agents: ["Commander Agent", "Safety Agent"], resolution: "Surge response keeps intervention fast while preserving life-safety checkpoints.", severity: "high" },
    { conflict: "Public clarity vs legal exposure", agents: ["Reputation Agent", "Governance Agent"], resolution: "Use pre-approved holding statement and board-visible audit trail.", severity: "medium" },
    { conflict: "Cyber isolation vs evacuation continuity", agents: ["Cyber Agent", "Logistics Agent"], resolution: "Shift to fallback channels while route orchestration remains live.", severity: "low" },
  ],
  consensus: {
    consensus_score: 92,
    alignment_score: 93,
    dissenting_agents: [],
    merged_plan: "Surge response governed by minimize casualties, with cross-module execution and human approval checkpoints.",
    winner: aiCouncilPlan.winner,
  },
};

export const aiCouncilLearning: AICouncilLearning = {
  generated_at: "2026-04-26T00:00:00.000Z",
  episodes: [
    { episode_id: "EP-AC-001", scenario: "hotel_fire_dual_incident", decision: "corridor_first plus surge response", outcome: "stabilized in 12 minutes", accepted: true, override_reason: "none", delay_cost: "$42k avoided", strategy_win_rate: 94, confidence_before: 87, confidence_after: 92, lesson: "Medical lane protection improves evacuation speed without raising panic." },
    { episode_id: "EP-AC-002", scenario: "cyber_attack_during_evac", decision: "targeted lockdown with cyber isolation", outcome: "camera command recovered", accepted: true, override_reason: "executive required cyber proof", delay_cost: "$18k delay cost", strategy_win_rate: 88, confidence_before: 80, confidence_after: 86, lesson: "Cyber isolation should start before evacuation webhook retries saturate." },
    { episode_id: "EP-AC-003", scenario: "stadium_rush_behavior", decision: "surge response and calm multilingual messaging", outcome: "gate density reduced 31 percent", accepted: true, override_reason: "communications tone softened", delay_cost: "$63k avoided", strategy_win_rate: 91, confidence_before: 84, confidence_after: 90, lesson: "Calm authority messaging beats strict commands during rumor-driven surges." },
    { episode_id: "EP-AC-004", scenario: "enterprise_pr_crisis", decision: "public holding statement plus customer sponsor calls", outcome: "churn risk contained", accepted: false, override_reason: "legal asked to delay statement", delay_cost: "$210k exposure", strategy_win_rate: 79, confidence_before: 82, confidence_after: 78, lesson: "Legal review delay needs pre-approved holding templates." },
  ],
  accepted_decisions: 3,
  rejected_decisions: 1,
  override_reasons: [
    { reason: "legal asked to delay statement", count: 1, policy_update: "pre-approve holding statements" },
    { reason: "communications tone softened", count: 1, policy_update: "prefer calm authority during rumor-driven surges" },
    { reason: "executive required cyber proof", count: 1, policy_update: "include SOC evidence in hybrid-crisis plans" },
  ],
  strategy_win_rates: [],
  confidence_drift: [
    { domain: "human behavior", before: 84, after: 90, driver: "crowd response outcomes" },
    { domain: "cyber orchestration", before: 80, after: 86, driver: "access-control failure recovery" },
    { domain: "public reputation", before: 82, after: 78, driver: "legal delay on public statement" },
  ],
  policy_updates: [
    { policy_id: "POL-COMMS-HOLDING", title: "Pre-approved holding statement library", status: "pending_approval", impact: "reduces PR delay cost" },
    { policy_id: "POL-CYBER-EVIDENCE", title: "Hybrid crisis SOC evidence packet", status: "approved", impact: "raises executive trust" },
    { policy_id: "POL-MEDICAL-LANE", title: "Protect medical lane in every high-density evacuation", status: "approved", impact: "improves evacuation speed" },
  ],
  best_playbooks: ["corridor_first plus surge response", "targeted lockdown with cyber isolation", "surge response and calm multilingual messaging"],
  summary: "The council is learning strongest gains from human behavior outcomes, hybrid cyber evidence, and pre-approved communications playbooks.",
};

export const aiCouncilSummary: AICouncilSummary = {
  generated_at: "2026-04-26T00:00:00.000Z",
  scenario: aiCouncilScenarios[0] as AICouncilScenario,
  objective: "minimize casualties",
  governance_mode: "approval_required",
  plan_status: "awaiting_approval",
  alignment_score: 93,
  consensus_score: 92,
  trust_score: 91,
  active_agents: aiCouncilAgents.length,
  current_debate: aiCouncilDebate.rounds,
  conflicts: aiCouncilDebate.conflicts,
  recommended_plan: aiCouncilPlan,
  ranked_actions: aiCouncilPlan.ranked_actions,
  confidence_trail: [
    { signal: "MLOps predictions", score: 91, effect: "raised urgency and selected earlier intervention" },
    { signal: "Human behavior model", score: 87, effect: "increased communications and crowd-control priority" },
    { signal: "Route health", score: 84, effect: "validated route-aware action sequencing" },
    { signal: "Agent calibration", score: 92, effect: "kept recommendation above approval threshold" },
  ],
  learning_summary: aiCouncilLearning.summary,
  executive_copilot: {
    recommended_objective: "minimize casualties",
    one_click_actions: ["Reduce Losses Now", "Fastest Recovery", "Protect Reputation", "Preserve Revenue", "Safety First"],
    summary: "Best governed plan is Surge response with 92% consensus and 91/100 trust.",
  },
};

export function objectiveLabel(objective: string) {
  return objective.replaceAll("_", " ");
}

