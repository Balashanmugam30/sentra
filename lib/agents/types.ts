export type AgentStatus = "active" | "watch" | "critical" | "offline";
export type AgentStance = "support" | "caution" | "oppose" | "urgent";
export type CouncilGlobalState = "stable" | "elevated" | "critical" | "emergency";
export type AgentScenario =
  | "critical_fire"
  | "gas_leak"
  | "mass_panic"
  | "resource_shortage"
  | "comms_breakdown";
export type DebateScenario = AgentScenario | "dual_incident";
export type DebateStatus = "idle" | "active" | "resolved";
export type DebateVote = "support" | "conditional" | "oppose";
export type ConflictType =
  | "lockdown_vs_evacuation_access"
  | "speed_vs_safety"
  | "cost_vs_response_strength"
  | "continuity_vs_shutdown"
  | "alert_volume_vs_alert_fatigue"
  | "resource_concentration_vs_coverage";
export type OptimizationScenario =
  | "critical_fire"
  | "dual_incident"
  | "gas_leak"
  | "mass_panic"
  | "resource_shortage"
  | "citywide_pressure";
export type OptimizationResourceType =
  | "fire_teams"
  | "medical_teams"
  | "security_teams"
  | "drones"
  | "ambulances"
  | "logistics_units";
export type LearningState = "cold" | "learning" | "mature" | "adaptive";
export type ConfidenceTrend = "up" | "down" | "stable";
export type LearningScenario = OptimizationScenario;

export type AgentLiveItem = {
  agent_id: string;
  name: string;
  domain: string;
  status: AgentStatus;
  confidence: number;
  stance: AgentStance;
  priority_zone: string | null;
  top_recommendation: string;
  reasoning_drivers: string[];
  memory_summary: string[];
  last_updated: string;
};

export type AgentMemoryItem = {
  agent_id: string;
  name: string;
  domain: string;
  recent_alerts: string[];
  recent_decisions: string[];
  recent_failures: string[];
  trusted_patterns: string[];
  preferred_actions: string[];
  last_updated: string;
};

export type AgentsLiveResponse = {
  generated_at: string;
  global_state: CouncilGlobalState;
  council_health: number;
  alignment_score: number;
  agents: AgentLiveItem[];
  top_priorities: string[];
  shared_risks: string[];
  recommended_joint_plan: string[];
  command_summary: string;
};

export type AgentsMemoryResponse = {
  generated_at: string;
  agents: AgentMemoryItem[];
};

export type AgentsResetResponse = {
  status: string;
  agents_reset: number;
};

export type AgentScenarioRequest = {
  scenario: AgentScenario;
};

export type AgentScenarioResponse = {
  generated_at: string;
  status: string;
  scenario: AgentScenario;
  council: AgentsLiveResponse;
};

export type DebateConflictItem = {
  conflict_type: ConflictType;
  title: string;
  description: string;
  parties: string[];
};

export type DebateParticipantItem = {
  agent_id: string;
  name: string;
  initial_position: string;
  concerns: string[];
  counterpoints: string[];
  revised_position: string;
  final_vote: DebateVote;
  confidence_before: number;
  confidence_after: number;
};

export type DebateSessionItem = {
  debate_id: string;
  started_at: string;
  scenario: string;
  status: DebateStatus;
  rounds: number;
  conflict_count: number;
  consensus_score: number;
  winning_strategy: string;
  participants: DebateParticipantItem[];
};

export type DebateLiveResponse = {
  generated_at: string;
  global_state: CouncilGlobalState;
  active_debate: DebateSessionItem;
  consensus_score: number;
  conflicts: DebateConflictItem[];
  participants: DebateParticipantItem[];
  final_plan: string[];
  executive_note: string;
  recommended_next_action: string;
};

export type DebateHistoryItem = {
  debate_id: string;
  started_at: string;
  scenario: string;
  status: DebateStatus;
  consensus_score: number;
  winning_strategy: string;
  outcome_summary: string;
};

export type DebateHistoryResponse = {
  generated_at: string;
  sessions: DebateHistoryItem[];
};

export type DebateRunRequest = {
  scenario: DebateScenario;
};

export type DebateResetResponse = {
  status: string;
  debates_cleared: number;
};

export type OptimizationAllocationItem = {
  zone: string;
  resource_type: OptimizationResourceType;
  units_assigned: number;
  eta_minutes: number;
  impact_score: number;
  route_hint: string;
  opportunity_cost: string;
  rationale: string;
};

export type OptimizationPlanResponse = {
  plan_id: string;
  generated_at: string;
  global_efficiency_score: number;
  reserve_readiness: number;
  estimated_containment_minutes: number;
  estimated_evacuation_support: number;
  cost_index: number;
  allocations: OptimizationAllocationItem[];
  unserved_demands: string[];
  tradeoffs: string[];
  recommended_followups: string[];
  summary: string;
};

export type OptimizationHistoryItem = {
  plan_id: string;
  generated_at: string;
  title: string;
  efficiency_score: number;
  reserve_readiness: number;
  summary: string;
};

export type OptimizationHistoryResponse = {
  generated_at: string;
  plans: OptimizationHistoryItem[];
};

export type OptimizationRunRequest = {
  scenario: OptimizationScenario;
};

export type OptimizationResetResponse = {
  status: string;
  plans_cleared: number;
};

export type LearningAgentCalibrationItem = {
  agent: string;
  current_accuracy: number;
  confidence_trend: ConfidenceTrend;
};

export type LearningEpisodeItem = {
  episode_id: string;
  recorded_at: string;
  incident_type: string;
  decision_strategy: string;
  resources_used: string[];
  debate_outcome: string;
  consensus_score: number;
  response_time: number;
  containment_minutes: number;
  evacuation_success: number;
  cost_index: number;
  casualty_risk: number;
  recovery_time: number;
  agent_accuracy_scores: Record<string, number>;
  performance_score: number;
};

export type LearningLiveResponse = {
  generated_at: string;
  global_learning_state: LearningState;
  episodes_tracked: number;
  best_strategy: string;
  best_strategy_score: number;
  worst_strategy: string;
  improvement_index: number;
  agent_calibration: LearningAgentCalibrationItem[];
  learned_patterns: string[];
  recommended_policy_updates: string[];
  executive_summary: string;
};

export type LearningHistoryItem = {
  recorded_at: string;
  message: string;
};

export type LearningHistoryResponse = {
  generated_at: string;
  events: LearningHistoryItem[];
};

export type LearningRunRequest = {
  scenario: LearningScenario;
};

export type LearningRunResponse = {
  generated_at: string;
  status: string;
  scenario: LearningScenario;
  episode: LearningEpisodeItem;
  learning: LearningLiveResponse;
};

export type LearningResetResponse = {
  status: string;
  episodes_cleared: number;
};
