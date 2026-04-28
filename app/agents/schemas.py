from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AgentStatus = Literal["active", "watch", "critical", "offline"]
AgentStance = Literal["support", "caution", "oppose", "urgent"]
CouncilGlobalState = Literal["stable", "elevated", "critical", "emergency"]
AgentScenario = Literal[
    "critical_fire",
    "gas_leak",
    "mass_panic",
    "resource_shortage",
    "comms_breakdown",
]
DebateScenario = Literal[
    "critical_fire",
    "gas_leak",
    "mass_panic",
    "resource_shortage",
    "comms_breakdown",
    "dual_incident",
]
DebateStatus = Literal["idle", "active", "resolved"]
DebateVote = Literal["support", "conditional", "oppose"]
ConflictType = Literal[
    "lockdown_vs_evacuation_access",
    "speed_vs_safety",
    "cost_vs_response_strength",
    "continuity_vs_shutdown",
    "alert_volume_vs_alert_fatigue",
    "resource_concentration_vs_coverage",
]
OptimizationScenario = Literal[
    "critical_fire",
    "dual_incident",
    "gas_leak",
    "mass_panic",
    "resource_shortage",
    "citywide_pressure",
]
OptimizationResourceType = Literal[
    "fire_teams",
    "medical_teams",
    "security_teams",
    "drones",
    "ambulances",
    "logistics_units",
]
LearningState = Literal["cold", "learning", "mature", "adaptive"]
ConfidenceTrend = Literal["up", "down", "stable"]
LearningScenario = OptimizationScenario


class AgentLiveItem(BaseModel):
    agent_id: str
    name: str
    domain: str
    status: AgentStatus
    confidence: int = Field(..., ge=0, le=100)
    stance: AgentStance
    priority_zone: str | None = None
    top_recommendation: str
    reasoning_drivers: list[str]
    memory_summary: list[str]
    last_updated: datetime


class AgentMemoryItem(BaseModel):
    agent_id: str
    name: str
    domain: str
    recent_alerts: list[str]
    recent_decisions: list[str]
    recent_failures: list[str]
    trusted_patterns: list[str]
    preferred_actions: list[str]
    last_updated: datetime


class AgentsLiveResponse(BaseModel):
    generated_at: datetime
    global_state: CouncilGlobalState
    council_health: int = Field(..., ge=0, le=100)
    alignment_score: int = Field(..., ge=0, le=100)
    agents: list[AgentLiveItem]
    top_priorities: list[str]
    shared_risks: list[str]
    recommended_joint_plan: list[str]
    command_summary: str


class AgentsMemoryResponse(BaseModel):
    generated_at: datetime
    agents: list[AgentMemoryItem]


class AgentsResetResponse(BaseModel):
    status: str
    agents_reset: int = Field(..., ge=0)


class AgentScenarioRequest(BaseModel):
    scenario: AgentScenario


class AgentScenarioResponse(BaseModel):
    generated_at: datetime
    status: str
    scenario: AgentScenario
    council: AgentsLiveResponse


class DebateConflictItem(BaseModel):
    conflict_type: ConflictType
    title: str
    description: str
    parties: list[str]


class DebateParticipantItem(BaseModel):
    agent_id: str
    name: str
    initial_position: str
    concerns: list[str]
    counterpoints: list[str]
    revised_position: str
    final_vote: DebateVote
    confidence_before: int = Field(..., ge=0, le=100)
    confidence_after: int = Field(..., ge=0, le=100)


class DebateSessionItem(BaseModel):
    debate_id: str
    started_at: datetime
    scenario: str
    status: DebateStatus
    rounds: int = Field(..., ge=0)
    conflict_count: int = Field(..., ge=0)
    consensus_score: int = Field(..., ge=0, le=100)
    winning_strategy: str
    participants: list[DebateParticipantItem]


class DebateLiveResponse(BaseModel):
    generated_at: datetime
    global_state: CouncilGlobalState
    active_debate: DebateSessionItem
    consensus_score: int = Field(..., ge=0, le=100)
    conflicts: list[DebateConflictItem]
    participants: list[DebateParticipantItem]
    final_plan: list[str]
    executive_note: str
    recommended_next_action: str


class DebateHistoryItem(BaseModel):
    debate_id: str
    started_at: datetime
    scenario: str
    status: DebateStatus
    consensus_score: int = Field(..., ge=0, le=100)
    winning_strategy: str
    outcome_summary: str


class DebateHistoryResponse(BaseModel):
    generated_at: datetime
    sessions: list[DebateHistoryItem]


class DebateRunRequest(BaseModel):
    scenario: DebateScenario


class DebateResetResponse(BaseModel):
    status: str
    debates_cleared: int = Field(..., ge=0)


class OptimizationAllocationItem(BaseModel):
    zone: str
    resource_type: OptimizationResourceType
    units_assigned: int = Field(..., ge=0)
    eta_minutes: int = Field(..., ge=0)
    impact_score: int = Field(..., ge=0, le=100)
    route_hint: str
    opportunity_cost: str
    rationale: str


class OptimizationPlanResponse(BaseModel):
    plan_id: str
    generated_at: datetime
    global_efficiency_score: int = Field(..., ge=0, le=100)
    reserve_readiness: int = Field(..., ge=0, le=100)
    estimated_containment_minutes: int = Field(..., ge=0)
    estimated_evacuation_support: int = Field(..., ge=0, le=100)
    cost_index: int = Field(..., ge=0, le=100)
    allocations: list[OptimizationAllocationItem]
    unserved_demands: list[str]
    tradeoffs: list[str]
    recommended_followups: list[str]
    summary: str


class OptimizationHistoryItem(BaseModel):
    plan_id: str
    generated_at: datetime
    title: str
    efficiency_score: int = Field(..., ge=0, le=100)
    reserve_readiness: int = Field(..., ge=0, le=100)
    summary: str


class OptimizationHistoryResponse(BaseModel):
    generated_at: datetime
    plans: list[OptimizationHistoryItem]


class OptimizationRunRequest(BaseModel):
    scenario: OptimizationScenario


class OptimizationResetResponse(BaseModel):
    status: str
    plans_cleared: int = Field(..., ge=0)


class LearningAgentCalibrationItem(BaseModel):
    agent: str
    current_accuracy: int = Field(..., ge=0, le=100)
    confidence_trend: ConfidenceTrend


class LearningEpisodeItem(BaseModel):
    episode_id: str
    recorded_at: datetime
    incident_type: str
    decision_strategy: str
    resources_used: list[str]
    debate_outcome: str
    consensus_score: int = Field(..., ge=0, le=100)
    response_time: int = Field(..., ge=0)
    containment_minutes: int = Field(..., ge=0)
    evacuation_success: int = Field(..., ge=0, le=100)
    cost_index: int = Field(..., ge=0, le=100)
    casualty_risk: int = Field(..., ge=0, le=100)
    recovery_time: int = Field(..., ge=0)
    agent_accuracy_scores: dict[str, int]
    performance_score: int = Field(..., ge=0, le=100)


class LearningLiveResponse(BaseModel):
    generated_at: datetime
    global_learning_state: LearningState
    episodes_tracked: int = Field(..., ge=0)
    best_strategy: str
    best_strategy_score: int = Field(..., ge=0, le=100)
    worst_strategy: str
    improvement_index: int = Field(..., ge=0, le=100)
    agent_calibration: list[LearningAgentCalibrationItem]
    learned_patterns: list[str]
    recommended_policy_updates: list[str]
    executive_summary: str


class LearningHistoryItem(BaseModel):
    recorded_at: datetime
    message: str


class LearningHistoryResponse(BaseModel):
    generated_at: datetime
    events: list[LearningHistoryItem]


class LearningRunRequest(BaseModel):
    scenario: LearningScenario


class LearningRunResponse(BaseModel):
    generated_at: datetime
    status: str
    scenario: LearningScenario
    episode: LearningEpisodeItem
    learning: LearningLiveResponse


class LearningResetResponse(BaseModel):
    status: str
    episodes_cleared: int = Field(..., ge=0)
