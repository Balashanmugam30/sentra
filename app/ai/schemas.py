from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


AutonomyMode = Literal[
    "active",
    "advisory_only",
    "paused",
    "manual_control",
    "advisory",
    "approval_required",
    "semi_auto",
    "full_auto",
    "lockdown_emergency",
]
DecisionStatus = Literal["pending", "approved", "rejected", "modified", "observed"]


class RecommendationAction(BaseModel):
    recommendation_id: str
    title: str
    action_type: str
    zone: str | None = None
    why: str
    urgency: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    expected_impact: str
    approval_required: bool
    execute_action: str
    signals: list[str]


class AgentOpinion(BaseModel):
    agent_id: str
    name: str
    domain: str
    proposed_action: str
    confidence: int = Field(ge=0, le=100)
    urgency: int = Field(ge=0, le=100)
    rationale: str
    stance: Literal["support", "conditional", "concern"]


class CouncilSnapshot(BaseModel):
    generated_at: datetime
    agreement_percent: int = Field(ge=0, le=100)
    final_merged_strategy: str
    disagreements: list[str]
    minority_concerns: list[str]
    fallback_strategy: str
    agents: list[AgentOpinion]


class MultiAgentCouncilResponse(CouncilSnapshot):
    scenario_id: str
    incident: dict[str, object]
    specialist_agents: list[dict[str, object]]
    agent_recommendations: list[dict[str, object]]
    debate_rounds: list[dict[str, object]]
    conflict_matrix: list[dict[str, object]]
    consensus: dict[str, object]
    final_unified_plan: list[dict[str, object]]
    governance: dict[str, object]
    trust_by_agent: list[dict[str, object]]
    council_timeline: list[dict[str, object]]
    human_override_options: list[str]
    executive_summary: str


class AICouncilDataResponse(BaseModel):
    generated_at: datetime
    scenario_id: str
    agents: list[dict[str, object]] | None = None
    debate_rounds: list[dict[str, object]] | None = None
    consensus: dict[str, object] | None = None
    final_unified_plan: list[dict[str, object]] | None = None


class AICouncilRunRequest(BaseModel):
    scenario_id: str | None = Field(default=None, max_length=80)


class AICouncilActionRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=240)


class AILearningRunRequest(BaseModel):
    scenario_id: str | None = Field(default=None, max_length=80)


class AILearningActionRequest(BaseModel):
    policy_id: str = Field(..., max_length=80)


class AILearningDataResponse(BaseModel):
    generated_at: datetime
    memory: list[dict[str, object]] | None = None
    similar_incidents: list[dict[str, object]] | None = None
    decision_evolution: dict[str, object] | None = None
    weak_signals: list[dict[str, object]] | None = None
    future_forecast: list[dict[str, object]] | None = None
    trust_drift: list[dict[str, object]] | None = None
    learning_score: int | None = Field(default=None, ge=0, le=100)
    policy_recommendations: list[dict[str, object]] | None = None
    governance: dict[str, object] | None = None


class AILearningResponse(BaseModel):
    generated_at: datetime
    learning_score: int = Field(ge=0, le=100)
    learning_maturity: str
    episodes_learned: int
    memory: list[dict[str, object]]
    similar_incidents: list[dict[str, object]]
    best_strategies: list[dict[str, object]]
    worst_strategies: list[dict[str, object]]
    improvement_trend: list[dict[str, object]]
    override_reasons: list[dict[str, object]]
    trust_drift: list[dict[str, object]]
    policy_recommendations: list[dict[str, object]]
    weak_signals: list[dict[str, object]]
    future_forecast: list[dict[str, object]]
    decision_evolution: dict[str, object]
    simulation_lab: list[dict[str, object]]
    governance: dict[str, object]
    executive_value: dict[str, object]
    learning_timeline: list[dict[str, object]]


class ExplanationSnapshot(BaseModel):
    generated_at: datetime
    decision_id: str
    why_this_action: str
    signals_considered: list[str]
    rejected_alternatives: list[str]
    confidence_factors: list[str]
    human_readable_trace: list[str]


class DecisionMemoryEpisode(BaseModel):
    memory_id: str
    timestamp: datetime
    decision: str
    status: DecisionStatus
    scenario: str
    outcome_quality: int = Field(ge=0, le=100)
    response_speed: int = Field(ge=0, le=100)
    false_alarm: bool
    time_to_stabilize_minutes: int
    lesson: str


class AutonomousLiveResponse(BaseModel):
    generated_at: datetime
    autonomy_mode: AutonomyMode
    ai_posture: Literal["monitoring", "advising", "active_response", "manual_hold"]
    top_threat: str
    urgency_score: int = Field(ge=0, le=100)
    confidence_score: int = Field(ge=0, le=100)
    affected_zones: list[str]
    estimated_damage: str
    recovery_eta: str
    reasoning_summary: str
    top_decision: RecommendationAction
    recommended_actions: list[RecommendationAction]
    consensus: CouncilSnapshot
    explanation: ExplanationSnapshot
    memory_summary: dict[str, Any]


class RecommendationsResponse(BaseModel):
    generated_at: datetime
    recommendations: list[RecommendationAction]


class ExplanationsResponse(BaseModel):
    generated_at: datetime
    explanations: list[ExplanationSnapshot]


class MemoryResponse(BaseModel):
    generated_at: datetime
    episodes: list[DecisionMemoryEpisode]
    lessons: list[str]


class AIActionRequest(BaseModel):
    recommendation_id: str
    note: str | None = None


class AIOverrideRequest(BaseModel):
    recommendation_id: str | None = None
    mode: AutonomyMode | None = None
    modified_plan: str | None = None
    reason: str | None = None


class AIRunCycleRequest(BaseModel):
    scenario: str | None = None


class AITestScenarioRequest(BaseModel):
    scenario: Literal[
        "zone_fire_escalation",
        "gas_leak_north",
        "panic_gate_a",
        "coordinated_intrusion",
        "cyber_dashboard_attack",
        "city_power_failure",
        "fake_rumor_wave",
        "tower_fire_spread",
        "gas_leak_basement",
        "crowd_panic_gate_a",
        "city_grid_failure",
        "cyber_ransomware_attack",
        "cyclone_landfall",
        "misinformation_viral_wave",
    ]


class AIActionResponse(BaseModel):
    status: str
    recommendation_id: str | None = None
    autonomy_mode: AutonomyMode
    memory: DecisionMemoryEpisode
    live: AutonomousLiveResponse


class PredictiveForecastItem(BaseModel):
    horizon: str
    top_risks: list[str]
    containment_probability: int = Field(ge=0, le=100)
    escalation_probability: int = Field(ge=0, le=100)
    casualties_risk: int = Field(ge=0, le=100)
    downtime_minutes: int
    projected_loss: str
    recovery_eta: str
    confidence: int = Field(ge=0, le=100)


class PredictiveForecastResponse(BaseModel):
    generated_at: datetime
    forecasts: list[PredictiveForecastItem]


class StrategyBranch(BaseModel):
    option: str
    strategy: str
    casualty_risk: int = Field(ge=0, le=100)
    downtime_minutes: int
    financial_cost: str
    reputation_impact: int = Field(ge=0, le=100)
    containment_chance: int = Field(ge=0, le=100)
    recovery_speed: int = Field(ge=0, le=100)
    score: int
    rationale: str


class ScenarioBranchesResponse(BaseModel):
    generated_at: datetime
    branches: list[StrategyBranch]
    winning_strategy: StrategyBranch


class OrchestratedAction(BaseModel):
    action_id: str
    timestamp: datetime
    title: str
    target: str
    status: str
    system: str
    approval_required: bool


class OrchestrationResponse(BaseModel):
    generated_at: datetime
    autonomy_mode: str
    orchestration_state: str
    confidence_threshold_met: bool
    executed_actions: list[OrchestratedAction]
    pending_approvals: int
    next_action: str


class ResourceAllocation(BaseModel):
    resource: str
    zone: str
    assigned: int
    reserve: int
    eta_minutes: int
    rationale: str


class ResourceRebalancerResponse(BaseModel):
    generated_at: datetime
    reserve_readiness: int = Field(ge=0, le=100)
    rebalancing_state: str
    allocations: list[ResourceAllocation]
    recommended_shift: str


class FacilityAutomation(BaseModel):
    control: str
    zone: str
    state: str
    safe_rule: str


class FacilityBrainResponse(BaseModel):
    generated_at: datetime
    facility_posture: str
    automations: list[FacilityAutomation]


class CommsMessage(BaseModel):
    audience: str
    channel: str
    urgency: int = Field(ge=0, le=100)
    message: str
    status: str


class CommsBrainResponse(BaseModel):
    generated_at: datetime
    communications_state: str
    messages: list[CommsMessage]


class StrategyTimelineEvent(BaseModel):
    event_id: str
    timestamp: datetime
    event_type: str
    title: str
    detail: str


class StrategyTimelineResponse(BaseModel):
    generated_at: datetime
    events: list[StrategyTimelineEvent]


class AISetAutonomyModeRequest(BaseModel):
    mode: Literal["advisory", "approval_required", "semi_auto", "full_auto", "lockdown_emergency"]


class AIExecutePlanRequest(BaseModel):
    plan_id: str | None = None


StrategicScenario = Literal[
    "fire_corridor_blocked",
    "cyber_intrusion_lateral_move",
    "stadium_crowd_crush_risk",
    "toxic_air_false_rumor",
    "city_blackout_chain",
    "executive_targeted_threat",
    "dual_zone_fire",
    "responder_capacity_collapse",
]


class AIStrategicScenarioRequest(BaseModel):
    scenario: StrategicScenario | None = None


class AIWeakSignalScenarioRequest(BaseModel):
    scenario: StrategicScenario


class StrategyPerformance(BaseModel):
    strategy: str
    scenario_type: str
    score: int = Field(ge=0, le=100)
    success_rate: int = Field(ge=0, le=100)
    avg_stabilization_minutes: int
    confidence_delta: int
    reason: str


class FailurePattern(BaseModel):
    pattern: str
    scenario_type: str
    failure_signal: str
    recommended_fix: str
    evidence_count: int


class OverrideReason(BaseModel):
    reason: str
    count: int
    policy_implication: str


class ZoneBehaviorPattern(BaseModel):
    zone: str
    pattern: str
    recommended_watch: str
    confidence: int = Field(ge=0, le=100)


class AdvancedMemoryResponse(BaseModel):
    generated_at: datetime
    episodes_tracked: int
    learning_state: Literal["calibrating", "learning", "mature"]
    best_performing_strategies: list[StrategyPerformance]
    failure_patterns: list[FailurePattern]
    common_override_reasons: list[OverrideReason]
    trusted_playbooks: list[str]
    operator_preference_tendencies: list[str]
    zone_behavior_patterns: list[ZoneBehaviorPattern]
    learning_summary: str


class SpecialistAgentState(BaseModel):
    agent_id: str
    name: str
    domain: str
    mission: str
    preferred_strategy: str
    option: str
    strategy_score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    risk_tolerance: str
    current_position: str
    tradeoff: str


class SpecialistAgentsResponse(BaseModel):
    generated_at: datetime
    scenario: str
    agents: list[SpecialistAgentState]
    network_summary: str


class DebatePosition(BaseModel):
    agent: str
    position: str
    preferred_strategy: str
    score: int = Field(ge=0, le=100)
    non_negotiable: str


class DebateV2Response(BaseModel):
    generated_at: datetime
    scenario: str
    positions: list[DebatePosition]
    conflicts: list[str]
    negotiations: list[str]
    consensus_percent: int = Field(ge=0, le=100)
    final_merged_plan: str
    minority_concerns: list[str]
    fallback_plan: str


class WeakSignalItem(BaseModel):
    signal_id: str
    weak_signal: str
    source: str
    probability_of_incident: int = Field(ge=0, le=100)
    time_to_risk: str
    suggested_preventive_action: str
    confidence: int = Field(ge=0, le=100)
    affected_zones: list[str]
    evidence: list[str]


class WeakSignalsResponse(BaseModel):
    generated_at: datetime
    highest_probability: WeakSignalItem
    weak_signals: list[WeakSignalItem]
    preventive_summary: str


class PolicyWeight(BaseModel):
    policy_id: str
    policy_name: str
    previous_weight: int = Field(ge=0, le=100)
    current_weight: int = Field(ge=0, le=100)
    trend: Literal["up", "down", "stable"]
    reason: str


class PolicyEvolutionResponse(BaseModel):
    generated_at: datetime
    revision: int
    strategy_weights: list[PolicyWeight]
    recommended_policy_updates: list[str]


class ConfidenceTraceFactor(BaseModel):
    factor: str
    impact: int


class ConfidenceDriftResponse(BaseModel):
    generated_at: datetime
    decision_id: str
    confidence_before: int = Field(ge=0, le=100)
    confidence_after: int = Field(ge=0, le=100)
    delta: int
    direction: Literal["up", "down", "stable"]
    changed_because: list[str]
    confidence_trace: list[ConfidenceTraceFactor]


class CampaignPhase(BaseModel):
    phase_id: str
    window: str
    objective: str
    actions: list[str]
    owner: str
    success_metric: str


class CampaignPlanResponse(BaseModel):
    generated_at: datetime
    campaign_id: str
    scenario: str
    mission: str
    final_strategy: str
    triggering_weak_signal: WeakSignalItem
    phases: list[CampaignPhase]
    success_probability: int = Field(ge=0, le=100)


class DepartmentTrust(BaseModel):
    department: str
    trust_score: int = Field(ge=0, le=100)
    reason: str


class TrustDashboardResponse(BaseModel):
    generated_at: datetime
    accepted_decisions_percent: int = Field(ge=0, le=100)
    rejected_decisions_percent: int = Field(ge=0, le=100)
    override_rate_percent: int = Field(ge=0, le=100)
    avg_human_trust_score: int = Field(ge=0, le=100)
    departments_trusting_ai_most: list[DepartmentTrust]
    top_rejection_reasons: list[str]
    governance_summary: str


ExecutiveIntent = Literal[
    "stabilize_operations_now",
    "minimize_casualties",
    "protect_reputation",
    "preserve_revenue",
    "fastest_recovery",
]


class SwarmAgentState(BaseModel):
    swarm_id: str
    name: str
    units_active: int
    current_target: str
    efficiency_score: int = Field(ge=0, le=100)
    reroutes: int
    bottlenecks: list[str]
    autonomy_level: str


class SwarmResponse(BaseModel):
    generated_at: datetime
    swarm_posture: str
    global_efficiency: int = Field(ge=0, le=100)
    active_swarms: list[SwarmAgentState]
    priority_target: str
    coordination_summary: str


class CascadeNode(BaseModel):
    node_id: str
    label: str
    stage: Literal["first", "secondary", "tertiary"]
    probability: int = Field(ge=0, le=100)
    time_window: str
    interruption_value: int = Field(ge=0, le=100)


class CascadeResponse(BaseModel):
    generated_at: datetime
    scenario: str
    first_impact: str
    secondary_chain: list[str]
    tertiary_chain: list[str]
    chain_nodes: list[CascadeNode]
    containment_breakpoints: list[str]
    best_interruption_node: str
    cascade_risk_score: int = Field(ge=0, le=100)
    summary: str


class CopilotIntentPlan(BaseModel):
    intent: str
    label: str
    priority: str
    plan_steps: list[str]
    approvals_needed: int
    eta: str
    risks: list[str]
    departments_impacted: list[str]
    expected_outcome: str


class CopilotExecutedPlan(BaseModel):
    execution_id: str
    timestamp: datetime
    intent: str
    label: str
    status: str
    next_action: str


class CopilotResponse(BaseModel):
    generated_at: datetime
    copilot_state: str
    recommended_intent: str
    intent_plans: list[CopilotIntentPlan]
    executed_plans: list[CopilotExecutedPlan]
    summary: str


class CopilotExecuteRequest(BaseModel):
    intent: ExecutiveIntent


class BehaviorMetric(BaseModel):
    metric: str
    score: int = Field(ge=0, le=100)
    driver: str


class BehaviorResponse(BaseModel):
    generated_at: datetime
    behavior_state: str
    metrics: list[BehaviorMetric]
    recommended_interventions: list[str]
    summary: str


class NegotiationDemand(BaseModel):
    agent: str
    demand: str
    concession: str
    priority: int = Field(ge=0, le=100)


class NegotiationResponse(BaseModel):
    generated_at: datetime
    demands: list[NegotiationDemand]
    conflicts: list[str]
    winning_compromise: str
    rejected_alternatives: list[str]
    negotiation_score: int = Field(ge=0, le=100)
    summary: str


class SupremacyScoreResponse(BaseModel):
    generated_at: datetime
    score: int = Field(ge=0, le=100)
    label: Literal["fragile", "pressured", "strong", "dominant"]
    components: dict[str, int]
    summary: str


class CinematicDemoResponse(BaseModel):
    generated_at: datetime
    demo_id: str
    state: str
    chapters: list[str]
    active_chapter: str
    swarm_efficiency: int = Field(ge=0, le=100)
    cascade_risk: int = Field(ge=0, le=100)
    copilot_intent: str
    supremacy_score: int = Field(ge=0, le=100)


class AIDecisionRunRequest(BaseModel):
    scenario_id: str | None = Field(default=None, max_length=80)


class AIDecisionScenarioLoadRequest(BaseModel):
    scenario_id: str = Field(..., max_length=80)


class AIDecisionDataResponse(BaseModel):
    generated_at: datetime
    scenario_id: str | None = None
    data: dict[str, object]


class AIDecisionResponse(BaseModel):
    generated_at: datetime
    scenario_id: str
    active_incident: dict[str, object]
    scores: dict[str, object]
    recommended_strategy: dict[str, object]
    strategies: list[dict[str, object]]
    actions: list[dict[str, object]]
    explainability: list[str]
    confidence: dict[str, object]
    forecast: list[dict[str, object]]
    resources: dict[str, object]
    executive_summary: str
