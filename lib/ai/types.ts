export type AutonomyMode =
  | "active"
  | "advisory_only"
  | "paused"
  | "manual_control"
  | "advisory"
  | "approval_required"
  | "semi_auto"
  | "full_auto"
  | "lockdown_emergency";

export type RecommendationAction = {
  recommendation_id: string;
  title: string;
  action_type: string;
  zone: string | null;
  why: string;
  urgency: number;
  confidence: number;
  expected_impact: string;
  approval_required: boolean;
  execute_action: string;
  signals: string[];
};

export type AgentOpinion = {
  agent_id: string;
  name: string;
  domain: string;
  proposed_action: string;
  confidence: number;
  urgency: number;
  rationale: string;
  stance: "support" | "conditional" | "concern";
};

export type CouncilSnapshot = {
  generated_at: string;
  agreement_percent: number;
  final_merged_strategy: string;
  disagreements: string[];
  minority_concerns: string[];
  fallback_strategy: string;
  agents: AgentOpinion[];
};

export type ExplanationSnapshot = {
  generated_at: string;
  decision_id: string;
  why_this_action: string;
  signals_considered: string[];
  rejected_alternatives: string[];
  confidence_factors: string[];
  human_readable_trace: string[];
};

export type DecisionMemoryEpisode = {
  memory_id: string;
  timestamp: string;
  decision: string;
  status: "pending" | "approved" | "rejected" | "modified" | "observed";
  scenario: string;
  outcome_quality: number;
  response_speed: number;
  false_alarm: boolean;
  time_to_stabilize_minutes: number;
  lesson: string;
};

export type AutonomousLiveResponse = {
  generated_at: string;
  autonomy_mode: AutonomyMode;
  ai_posture: "monitoring" | "advising" | "active_response" | "manual_hold";
  top_threat: string;
  urgency_score: number;
  confidence_score: number;
  affected_zones: string[];
  estimated_damage: string;
  recovery_eta: string;
  reasoning_summary: string;
  top_decision: RecommendationAction;
  recommended_actions: RecommendationAction[];
  consensus: CouncilSnapshot;
  explanation: ExplanationSnapshot;
  memory_summary: {
    episodes_tracked: number;
    accepted_or_observed: number;
    average_outcome_quality: number;
    best_lesson: string;
  };
};

export type RecommendationsResponse = {
  generated_at: string;
  recommendations: RecommendationAction[];
};

export type ExplanationsResponse = {
  generated_at: string;
  explanations: ExplanationSnapshot[];
};

export type MemoryResponse = {
  generated_at: string;
  episodes: DecisionMemoryEpisode[];
  lessons: string[];
};

export type AIActionResponse = {
  status: string;
  recommendation_id: string | null;
  autonomy_mode: AutonomyMode;
  memory: DecisionMemoryEpisode;
  live: AutonomousLiveResponse;
};

export type AITestScenario =
  | "zone_fire_escalation"
  | "gas_leak_north"
  | "panic_gate_a"
  | "coordinated_intrusion"
  | "cyber_dashboard_attack"
  | "city_power_failure"
  | "fake_rumor_wave"
  | "tower_fire_spread"
  | "gas_leak_basement"
  | "crowd_panic_gate_a"
  | "city_grid_failure"
  | "cyber_ransomware_attack"
  | "cyclone_landfall"
  | "misinformation_viral_wave";

export type PredictiveForecastItem = {
  horizon: string;
  top_risks: string[];
  containment_probability: number;
  escalation_probability: number;
  casualties_risk: number;
  downtime_minutes: number;
  projected_loss: string;
  recovery_eta: string;
  confidence: number;
};

export type PredictiveForecastResponse = {
  generated_at: string;
  forecasts: PredictiveForecastItem[];
};

export type StrategyBranch = {
  option: string;
  strategy: string;
  casualty_risk: number;
  downtime_minutes: number;
  financial_cost: string;
  reputation_impact: number;
  containment_chance: number;
  recovery_speed: number;
  score: number;
  rationale: string;
};

export type ScenarioBranchesResponse = {
  generated_at: string;
  branches: StrategyBranch[];
  winning_strategy: StrategyBranch;
};

export type OrchestratedAction = {
  action_id: string;
  timestamp: string;
  title: string;
  target: string;
  status: string;
  system: string;
  approval_required: boolean;
};

export type OrchestrationResponse = {
  generated_at: string;
  autonomy_mode: string;
  orchestration_state: string;
  confidence_threshold_met: boolean;
  executed_actions: OrchestratedAction[];
  pending_approvals: number;
  next_action: string;
};

export type ResourceAllocation = {
  resource: string;
  zone: string;
  assigned: number;
  reserve: number;
  eta_minutes: number;
  rationale: string;
};

export type ResourceRebalancerResponse = {
  generated_at: string;
  reserve_readiness: number;
  rebalancing_state: string;
  allocations: ResourceAllocation[];
  recommended_shift: string;
};

export type FacilityBrainResponse = {
  generated_at: string;
  facility_posture: string;
  automations: Array<{
    control: string;
    zone: string;
    state: string;
    safe_rule: string;
  }>;
};

export type CommsBrainResponse = {
  generated_at: string;
  communications_state: string;
  messages: Array<{
    audience: string;
    channel: string;
    urgency: number;
    message: string;
    status: string;
  }>;
};

export type StrategyTimelineResponse = {
  generated_at: string;
  events: Array<{
    event_id: string;
    timestamp: string;
    event_type: string;
    title: string;
    detail: string;
  }>;
};

export type AIStrategicScenario =
  | "fire_corridor_blocked"
  | "cyber_intrusion_lateral_move"
  | "stadium_crowd_crush_risk"
  | "toxic_air_false_rumor"
  | "city_blackout_chain"
  | "executive_targeted_threat"
  | "dual_zone_fire"
  | "responder_capacity_collapse";

export type StrategyPerformance = {
  strategy: string;
  scenario_type: string;
  score: number;
  success_rate: number;
  avg_stabilization_minutes: number;
  confidence_delta: number;
  reason: string;
};

export type AdvancedMemoryResponse = {
  generated_at: string;
  episodes_tracked: number;
  learning_state: "calibrating" | "learning" | "mature";
  best_performing_strategies: StrategyPerformance[];
  failure_patterns: Array<{
    pattern: string;
    scenario_type: string;
    failure_signal: string;
    recommended_fix: string;
    evidence_count: number;
  }>;
  common_override_reasons: Array<{
    reason: string;
    count: number;
    policy_implication: string;
  }>;
  trusted_playbooks: string[];
  operator_preference_tendencies: string[];
  zone_behavior_patterns: Array<{
    zone: string;
    pattern: string;
    recommended_watch: string;
    confidence: number;
  }>;
  learning_summary: string;
};

export type SpecialistAgentsResponse = {
  generated_at: string;
  scenario: string;
  agents: Array<{
    agent_id: string;
    name: string;
    domain: string;
    mission: string;
    preferred_strategy: string;
    option: string;
    strategy_score: number;
    confidence: number;
    risk_tolerance: string;
    current_position: string;
    tradeoff: string;
  }>;
  network_summary: string;
};

export type DebateV2Response = {
  generated_at: string;
  scenario: string;
  positions: Array<{
    agent: string;
    position: string;
    preferred_strategy: string;
    score: number;
    non_negotiable: string;
  }>;
  conflicts: string[];
  negotiations: string[];
  consensus_percent: number;
  final_merged_plan: string;
  minority_concerns: string[];
  fallback_plan: string;
};

export type WeakSignalItem = {
  signal_id: string;
  weak_signal: string;
  source: string;
  probability_of_incident: number;
  time_to_risk: string;
  suggested_preventive_action: string;
  confidence: number;
  affected_zones: string[];
  evidence: string[];
};

export type WeakSignalsResponse = {
  generated_at: string;
  highest_probability: WeakSignalItem;
  weak_signals: WeakSignalItem[];
  preventive_summary: string;
};

export type PolicyEvolutionResponse = {
  generated_at: string;
  revision: number;
  strategy_weights: Array<{
    policy_id: string;
    policy_name: string;
    previous_weight: number;
    current_weight: number;
    trend: "up" | "down" | "stable";
    reason: string;
  }>;
  recommended_policy_updates: string[];
};

export type ConfidenceDriftResponse = {
  generated_at: string;
  decision_id: string;
  confidence_before: number;
  confidence_after: number;
  delta: number;
  direction: "up" | "down" | "stable";
  changed_because: string[];
  confidence_trace: Array<{
    factor: string;
    impact: number;
  }>;
};

export type CampaignPlanResponse = {
  generated_at: string;
  campaign_id: string;
  scenario: string;
  mission: string;
  final_strategy: string;
  triggering_weak_signal: WeakSignalItem;
  phases: Array<{
    phase_id: string;
    window: string;
    objective: string;
    actions: string[];
    owner: string;
    success_metric: string;
  }>;
  success_probability: number;
};

export type TrustDashboardResponse = {
  generated_at: string;
  accepted_decisions_percent: number;
  rejected_decisions_percent: number;
  override_rate_percent: number;
  avg_human_trust_score: number;
  departments_trusting_ai_most: Array<{
    department: string;
    trust_score: number;
    reason: string;
  }>;
  top_rejection_reasons: string[];
  governance_summary: string;
};

export type ExecutiveIntent =
  | "stabilize_operations_now"
  | "minimize_casualties"
  | "protect_reputation"
  | "preserve_revenue"
  | "fastest_recovery";

export type SwarmResponse = {
  generated_at: string;
  swarm_posture: string;
  global_efficiency: number;
  active_swarms: Array<{
    swarm_id: string;
    name: string;
    units_active: number;
    current_target: string;
    efficiency_score: number;
    reroutes: number;
    bottlenecks: string[];
    autonomy_level: string;
  }>;
  priority_target: string;
  coordination_summary: string;
};

export type CascadeResponse = {
  generated_at: string;
  scenario: string;
  first_impact: string;
  secondary_chain: string[];
  tertiary_chain: string[];
  chain_nodes: Array<{
    node_id: string;
    label: string;
    stage: "first" | "secondary" | "tertiary";
    probability: number;
    time_window: string;
    interruption_value: number;
  }>;
  containment_breakpoints: string[];
  best_interruption_node: string;
  cascade_risk_score: number;
  summary: string;
};

export type CopilotResponse = {
  generated_at: string;
  copilot_state: string;
  recommended_intent: string;
  intent_plans: Array<{
    intent: string;
    label: string;
    priority: string;
    plan_steps: string[];
    approvals_needed: number;
    eta: string;
    risks: string[];
    departments_impacted: string[];
    expected_outcome: string;
  }>;
  executed_plans: Array<{
    execution_id: string;
    timestamp: string;
    intent: string;
    label: string;
    status: string;
    next_action: string;
  }>;
  summary: string;
};

export type BehaviorResponse = {
  generated_at: string;
  behavior_state: string;
  metrics: Array<{
    metric: string;
    score: number;
    driver: string;
  }>;
  recommended_interventions: string[];
  summary: string;
};

export type NegotiationResponse = {
  generated_at: string;
  demands: Array<{
    agent: string;
    demand: string;
    concession: string;
    priority: number;
  }>;
  conflicts: string[];
  winning_compromise: string;
  rejected_alternatives: string[];
  negotiation_score: number;
  summary: string;
};

export type SupremacyScoreResponse = {
  generated_at: string;
  score: number;
  label: "fragile" | "pressured" | "strong" | "dominant";
  components: Record<string, number>;
  summary: string;
};

export type CinematicDemoResponse = {
  generated_at: string;
  demo_id: string;
  state: string;
  chapters: string[];
  active_chapter: string;
  swarm_efficiency: number;
  cascade_risk: number;
  copilot_intent: string;
  supremacy_score: number;
};

export type AICouncilScenario = {
  scenario_id: string;
  label: string;
  objective: string;
  threat_stack: string[];
  mlops_signal: number;
  soc_signal: number;
  route_health: number;
  resource_load: number;
  finance_exposure: number;
  public_pressure: number;
  cyber_pressure: number;
  human_risk: number;
  eta_to_stability: string;
};

export type AICouncilOptionScore = {
  option_id: string;
  label: string;
  score: number;
};

export type AICouncilAgent = {
  agent_id: string;
  name: string;
  role: string;
  avatar: string;
  priority: string;
  trust_score: number;
  accepted_recommendations: number;
  override_rate: number;
  false_positive_rate: number;
  success_rate: number;
  confidence_calibration: number;
  color: string;
  current_focus: string;
  recommended_option: string;
  recommended_option_label: string;
  alignment_with_plan: number;
  urgency: number;
  confidence: number;
  option_scores: AICouncilOptionScore[];
  reasoning: string;
};

export type AICouncilStrategyOption = {
  option_id: string;
  label: string;
  base_score: number;
  speed: number;
  safety: number;
  continuity: number;
  reputation: number;
  cost_control: number;
  score: number;
  objective_fit: number;
  pressure_adjustment: number;
};

export type AICouncilAction = {
  action_id: string;
  rank: number;
  title: string;
  owner: string;
  system: string;
  decision: "execute" | "queue" | "approve" | string;
  confidence: number;
  approval_required: boolean;
};

export type AICouncilPlan = {
  generated_at: string;
  plan_id: string;
  objective: string;
  winner: AICouncilStrategyOption;
  ranked_actions: AICouncilAction[];
  resource_orders: Array<{ resource: string; order: string; eta: string }>;
  eta_to_stability: string;
  approval_required: boolean;
  explainability: string[];
};

export type AICouncilDebateRound = {
  round: number;
  theme: string;
  speaker: string;
  position: string;
  challenge: string;
};

export type AICouncilConflict = {
  conflict: string;
  agents: string[];
  resolution: string;
  severity: string;
};

export type AICouncilConsensus = {
  consensus_score: number;
  alignment_score: number;
  dissenting_agents: string[];
  merged_plan: string;
  winner: AICouncilStrategyOption;
};

export type AICouncilDebate = {
  generated_at: string;
  scenario: AICouncilScenario;
  objective: string;
  options: AICouncilStrategyOption[];
  rounds: AICouncilDebateRound[];
  conflicts: AICouncilConflict[];
  consensus: AICouncilConsensus;
};

export type AICouncilLearningEpisode = {
  episode_id: string;
  scenario: string;
  decision: string;
  outcome: string;
  accepted: boolean;
  override_reason: string;
  delay_cost: string;
  strategy_win_rate: number;
  confidence_before: number;
  confidence_after: number;
  lesson: string;
};

export type AICouncilLearning = {
  generated_at: string;
  episodes: AICouncilLearningEpisode[];
  accepted_decisions: number;
  rejected_decisions: number;
  override_reasons: Array<{ reason: string; count: number; policy_update: string }>;
  strategy_win_rates: Array<{ strategy: string; scenario: string; win_rate: number; lesson: string }>;
  confidence_drift: Array<{ domain: string; before: number; after: number; driver: string }>;
  policy_updates: Array<{ policy_id: string; title: string; status: string; impact: string }>;
  best_playbooks: string[];
  summary: string;
};

export type AICouncilSummary = {
  generated_at: string;
  scenario: AICouncilScenario;
  objective: string;
  governance_mode: string;
  plan_status: string;
  alignment_score: number;
  consensus_score: number;
  trust_score: number;
  active_agents: number;
  current_debate: AICouncilDebateRound[];
  conflicts: AICouncilConflict[];
  recommended_plan: AICouncilPlan;
  ranked_actions: AICouncilAction[];
  confidence_trail: Array<{ signal: string; score: number; effect: string }>;
  learning_summary: string;
  executive_copilot: {
    recommended_objective: string;
    one_click_actions: string[];
    summary: string;
  };
};

export type AICouncilEnvelope<T> = {
  data: T;
};

export type AICouncilListEnvelope<T> = {
  items: T[];
};

export type AICouncilMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type AIDecisionScenario = {
  scenario_id: string;
  label: string;
};

export type AIDecisionIncident = {
  label: string;
  incident_type: string;
  building: string;
  zone: string;
  floor: string;
  building_type: string;
  occupancy: number;
  responders_eta_minutes: number;
  blocked_exits: string[];
  signals: string[];
  node_health: number;
  camera_confidence: number;
  weather: string;
  time_of_day: string;
  prior_incidents: number;
};

export type AIDecisionScores = {
  severity_score: number;
  escalation_risk: number;
  people_impact_score: number;
  business_impact_score: number;
  urgency_level: "watch" | "high" | "critical" | string;
};

export type AIDecisionStrategy = {
  option_id: string;
  name: string;
  success_probability: number;
  estimated_evacuation_time: string;
  casualty_reduction_estimate: number;
  operational_disruption: number;
  confidence: number;
  score: number;
};

export type AIDecisionAction = {
  rank: number;
  title: string;
  detail: string;
  owner: string;
  priority: number;
  strategy_dependency: string;
};

export type AIDecisionForecastItem = {
  window: string;
  prediction: string;
  risk: number;
  recommended_watch: string;
};

export type AIDecisionConfidence = {
  data_quality_score: number;
  sensor_confidence: number;
  camera_confidence: number;
  recommendation_confidence: number;
  missing_data_warnings: string[];
  human_review_required: boolean;
};

export type AIDecisionResources = {
  responders_needed: number;
  medics_needed: number;
  security_needed: number;
  route_marshals_needed: number;
  external_agency_required: boolean;
  resource_summary: string;
};

export type AIDecisionResponse = {
  generated_at: string;
  scenario_id: string;
  active_incident: AIDecisionIncident;
  scores: AIDecisionScores;
  recommended_strategy: AIDecisionStrategy;
  strategies: AIDecisionStrategy[];
  actions: AIDecisionAction[];
  explainability: string[];
  confidence: AIDecisionConfidence;
  forecast: AIDecisionForecastItem[];
  resources: AIDecisionResources;
  executive_summary: string;
};

export type AIDecisionDataResponse<TData = Record<string, unknown>> = {
  generated_at: string;
  scenario_id?: string | null;
  data: TData;
};

export type CouncilGovernanceMode = "advisory" | "approval_required" | "semi_auto" | "full_auto";

export type CouncilScenario = {
  scenario_id: string;
  label: string;
};

export type CouncilSpecialistAgent = {
  agent_id: string;
  name: string;
  domain: string;
  avatar: string;
  priority: string;
  color: string;
  urgency_score: number;
  confidence: number;
  top_actions: string[];
  constraints: string[];
  reasoning: string;
  stance: "support" | "conditional" | "concern" | string;
  historical_accuracy: number;
  trust_score: number;
  override_rate: number;
  speed_score: number;
  confidence_drift: string;
};

export type CouncilRecommendation = {
  agent_id: string;
  agent: string;
  actions: string[];
  confidence: number;
};

export type CouncilDebateExchange = {
  agent: string;
  position: string;
  challenge: string;
};

export type CouncilDebateRound = {
  round: number;
  theme: string;
  exchanges: CouncilDebateExchange[];
};

export type CouncilConflict = {
  conflict: string;
  agents: string[];
  risk: string;
  resolution: string;
  score: number;
};

export type CouncilConsensus = {
  consensus_score: number;
  alignment_percent: number;
  dissenting_agents: string[];
  final_merged_strategy: string;
  confidence: number;
};

export type CouncilPlanStep = {
  step: number;
  title: string;
  owner: string;
  eta: string;
};

export type CouncilGovernance = {
  mode: CouncilGovernanceMode;
  status: string;
  available_modes: CouncilGovernanceMode[];
  override_options: string[];
};

export type CouncilTrustMetric = {
  agent_id: string;
  name: string;
  historical_accuracy: number;
  trust_score: number;
  override_rate: number;
  speed_score: number;
  confidence_drift: string;
};

export type CouncilTimelineEvent = {
  timestamp: string;
  event: string;
  detail: string;
  severity: "low" | "medium" | "high" | string;
};

export type MultiAgentCouncilResponse = CouncilSnapshot & {
  scenario_id: string;
  incident: AIDecisionIncident;
  specialist_agents: CouncilSpecialistAgent[];
  agent_recommendations: CouncilRecommendation[];
  debate_rounds: CouncilDebateRound[];
  conflict_matrix: CouncilConflict[];
  consensus: CouncilConsensus;
  final_unified_plan: CouncilPlanStep[];
  governance: CouncilGovernance;
  trust_by_agent: CouncilTrustMetric[];
  council_timeline: CouncilTimelineEvent[];
  human_override_options: string[];
  executive_summary: string;
};

export type CouncilDataResponse<TData extends Record<string, unknown> = Record<string, unknown>> = {
  generated_at: string;
  scenario_id: string;
} & TData;

export type LearningMemoryEpisode = {
  memory_id: string;
  incident_type: string;
  severity: number;
  chosen_plan: string;
  final_outcome: string;
  response_time_minutes: number;
  casualties_avoided: number;
  overrides: string[];
  confidence_at_time: number;
  environmental_conditions: string;
  strategy_score: number;
};

export type LearningStrategy = {
  strategy: string;
  win_rate?: number;
  avg_response_gain?: string;
  best_for?: string;
  evidence?: string;
  failure_mode?: string;
  correction?: string;
  score: number;
};

export type LearningTrendPoint = {
  label: string;
  score: number;
};

export type LearningOverrideReason = {
  reason: string;
  count: number;
  policy_effect: string;
};

export type LearningTrustDrift = {
  subject: string;
  trust_score: number;
  drift: string;
  driver: string;
};

export type LearningPolicyRecommendation = {
  policy_id: string;
  title: string;
  current_weight: number;
  recommended_weight: number;
  reason: string;
  status: "pending_approval" | "approved" | string;
  revision: number;
};

export type LearningWeakSignal = {
  signal_id: string;
  signal: string;
  source: string;
  probability: number;
  time_to_risk: string;
  recommended_action: string;
};

export type LearningFutureBranch = {
  window: string;
  branch: string;
  probability: number;
  impact: string;
};

export type DecisionEvolution = {
  past_recommendation: string;
  current_recommendation: string;
  benefit: string;
  confidence_before: number;
  confidence_after: number;
  why_changed: string[];
};

export type SimulationScenario = {
  scenario_id: string;
  label: string;
  runs: number;
  improvement: string;
  best_plan: string;
};

export type LearningGovernance = {
  mode: "observe_only" | "recommend_only" | "learn_with_approval" | "learn_automatically_safe_scope" | string;
  available_modes: string[];
  policy_revision: number;
  approved_policies: string[];
};

export type LearningExecutiveValue = {
  response_time_improvement: string;
  false_alarm_reduction: string;
  trust_increase: string;
  prevented_losses_estimate: string;
  learning_maturity_score: number;
  summary: string;
};

export type LearningTimelineEvent = {
  timestamp: string;
  event: string;
  detail: string;
  severity: "low" | "medium" | "high" | string;
};

export type AILearningResponse = {
  generated_at: string;
  learning_score: number;
  learning_maturity: string;
  episodes_learned: number;
  memory: LearningMemoryEpisode[];
  similar_incidents: LearningMemoryEpisode[];
  best_strategies: LearningStrategy[];
  worst_strategies: LearningStrategy[];
  improvement_trend: LearningTrendPoint[];
  override_reasons: LearningOverrideReason[];
  trust_drift: LearningTrustDrift[];
  policy_recommendations: LearningPolicyRecommendation[];
  weak_signals: LearningWeakSignal[];
  future_forecast: LearningFutureBranch[];
  decision_evolution: DecisionEvolution;
  simulation_lab: SimulationScenario[];
  governance: LearningGovernance;
  executive_value: LearningExecutiveValue;
  learning_timeline: LearningTimelineEvent[];
};

export type AILearningDataResponse<TData extends Record<string, unknown> = Record<string, unknown>> = {
  generated_at: string;
} & TData;
