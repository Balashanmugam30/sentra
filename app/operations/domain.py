"""Canonical operations domain models and enumerations for Phase 6."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
import hashlib
import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AutonomyMode(str, Enum):
    """Autonomy operating modes for crisis orchestration."""

    MODE_0_OBSERVE = "MODE_0_OBSERVE"
    MODE_1_RECOMMEND = "MODE_1_RECOMMEND"
    MODE_2_HUMAN_APPROVED = "MODE_2_HUMAN_APPROVED"
    MODE_3_BOUNDED_AUTOMATION = "MODE_3_BOUNDED_AUTOMATION"


class OperationLifecycleStatus(str, Enum):
    """Strict lifecycle states for incident operational workflows."""

    OPEN = "OPEN"
    ASSESSING = "ASSESSING"
    PLAN_READY = "PLAN_READY"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    EXECUTION_REQUESTED = "EXECUTION_REQUESTED"
    EXECUTING = "EXECUTING"
    EXECUTED = "EXECUTED"
    FAILED = "FAILED"
    VERIFYING = "VERIFYING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class ActionRiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ActionReversibility(str, Enum):
    REVERSIBLE = "REVERSIBLE"
    PARTIALLY_REVERSIBLE = "PARTIALLY_REVERSIBLE"
    IRREVERSIBLE = "IRREVERSIBLE"


class ActionType(str, Enum):
    LOCKDOWN_ACCESS = "LOCKDOWN_ACCESS"
    SUPPRESSION_TRIGGER = "SUPPRESSION_TRIGGER"
    EVACUATION_ALERT = "EVACUATION_ALERT"
    NOTIFICATION_BROADCAST = "NOTIFICATION_BROADCAST"
    DRONE_DISPATCH = "DRONE_DISPATCH"
    HVAC_ISOLATION = "HVAC_ISOLATION"
    MUTUAL_AID_REQUEST = "MUTUAL_AID_REQUEST"
    SENSOR_RECALIBRATION = "SENSOR_RECALIBRATION"
    DIAGNOSTIC_PING = "DIAGNOSTIC_PING"
    READ_STATUS = "READ_STATUS"
    SIMULATE_EVACUATION = "SIMULATE_EVACUATION"
    SIMULATE_PLUME = "SIMULATE_PLUME"
    SIMULATE_STRUCTURAL = "SIMULATE_STRUCTURAL"
    SIMULATE_GRID = "SIMULATE_GRID"


class SafetyDecision(str, Enum):
    ALLOW_READ_ONLY = "ALLOW_READ_ONLY"
    ALLOW_RECOMMENDATION = "ALLOW_RECOMMENDATION"
    REQUIRE_HUMAN_APPROVAL = "REQUIRE_HUMAN_APPROVAL"
    REQUIRE_ADDITIONAL_EVIDENCE = "REQUIRE_ADDITIONAL_EVIDENCE"
    DENY = "DENY"
    SIMULATION_ONLY = "SIMULATION_ONLY"
    UNAVAILABLE = "UNAVAILABLE"


class AdapterOutcome(str, Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    EXECUTION_OUTCOME_UNKNOWN = "EXECUTION_OUTCOME_UNKNOWN"
    UNCONFIGURED = "UNCONFIGURED"
    SIMULATED = "SIMULATED"


class PlaybookStatus(str, Enum):
    DRAFT = "DRAFT"
    REVIEWED = "REVIEWED"
    ACTIVE = "ACTIVE"
    RETIRED = "RETIRED"


def compute_proposal_hash(
    action_type: str,
    target_zone: str,
    parameters: Dict[str, Any],
    incident_id: str,
    tenant_id: str,
) -> str:
    """Computes deterministic SHA-256 hash of action proposal payload."""
    payload_repr = {
        "action_type": action_type,
        "target_zone": target_zone,
        "parameters": sorted(parameters.items()),
        "incident_id": incident_id,
        "tenant_id": tenant_id,
    }
    dumped = json.dumps(payload_repr, sort_keys=True, default=str)
    return hashlib.sha256(dumped.encode("utf-8")).hexdigest()


class PlaybookStepDefinition(BaseModel):
    step_id: str
    title: str
    description: str
    action_type: ActionType
    risk_level: ActionRiskLevel
    reversibility: ActionReversibility
    required_role: str = "commander"
    requires_human_approval: bool = True
    prerequisites: List[str] = Field(default_factory=list)
    timeout_seconds: int = 60
    retry_limit: int = 1
    is_critical: bool = False


class PlaybookDefinition(BaseModel):
    id: str
    name: str
    version: str = "1.0.0"
    status: PlaybookStatus = PlaybookStatus.ACTIVE
    description: str
    applicable_categories: List[str]
    severity_threshold: int = Field(3, ge=1, le=5)
    steps: List[PlaybookStepDefinition]
    safety_constraints: List[str] = Field(default_factory=list)
    provenance_standard: str = "ISO 22320 / NFPA 1600"


class ActionProposalRecord(BaseModel):
    id: str
    incident_id: str
    tenant_id: str = "TEN-BALA-UNI"
    plan_id: Optional[str] = None
    title: str
    description: str
    action_type: ActionType
    risk_level: ActionRiskLevel
    reversibility: ActionReversibility
    target_zone: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    proposal_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    status: OperationLifecycleStatus = OperationLifecycleStatus.AWAITING_APPROVAL
    proposer_id: str = "system_incident_commander"
    proposer_role: str = "ai_agent"
    safety_decision: SafetyDecision = SafetyDecision.REQUIRE_HUMAN_APPROVAL
    safety_reasons: List[str] = Field(default_factory=list)
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    approval_hash: Optional[str] = None
    rejection_reason: Optional[str] = None
    execution_idempotency_key: Optional[str] = None
    execution_outcome: Optional[AdapterOutcome] = None
    adapter_name: Optional[str] = None
    adapter_details: Dict[str, Any] = Field(default_factory=dict)


class ResponsePlanStepRecord(BaseModel):
    step_id: str
    title: str
    action_type: ActionType
    risk_level: ActionRiskLevel
    reversibility: ActionReversibility
    status: OperationLifecycleStatus = OperationLifecycleStatus.PLAN_READY
    proposal_id: Optional[str] = None
    requires_approval: bool = True
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class ResponsePlanRecord(BaseModel):
    plan_id: str
    incident_id: str
    tenant_id: str = "TEN-BALA-UNI"
    playbook_id: str
    playbook_version: str
    title: str
    status: OperationLifecycleStatus = OperationLifecycleStatus.PLAN_READY
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    steps: List[ResponsePlanStepRecord] = Field(default_factory=list)
    proposals: List[ActionProposalRecord] = Field(default_factory=list)
    rationale: str
    uncertainty_notes: List[str] = Field(default_factory=list)
    confidence_score: float = Field(0.85, ge=0.0, le=1.0)


class TimelineEventRecord(BaseModel):
    event_id: str
    incident_id: str
    tenant_id: str = "TEN-BALA-UNI"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: str
    source: str
    actor_id: str
    actor_role: str
    summary: str
    details: Dict[str, Any] = Field(default_factory=dict)
    is_simulation: bool = False


class SimulationScenario(BaseModel):
    scenario_id: str
    name: str
    description: str
    incident_id: str
    ambient_temp_delta: float = 0.0
    spread_rate_mult: float = 1.0
    sensor_outage_zones: List[str] = Field(default_factory=list)
    blocked_routes: List[str] = Field(default_factory=list)
    dispatch_delay_seconds: int = 0
    is_simulation: bool = True


class SimulationResult(BaseModel):
    simulation_id: str
    scenario_id: str
    run_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    disclaimer: str = "SIMULATION / NOT LIVE OPERATIONAL DATA"
    projected_duration_mins: float
    projected_containment_prob: float
    projected_casualties: int
    projected_damage_index: float
    recommended_adjustments: List[str]
    is_simulation: bool = True


class AutonomyState(BaseModel):
    mode: AutonomyMode = AutonomyMode.MODE_1_RECOMMEND
    kill_switch_engaged: bool = False
    kill_switch_tripped_at: Optional[datetime] = None
    kill_switch_tripped_by: Optional[str] = None
    kill_switch_reason: Optional[str] = None
    last_updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: str = "system"
    reason: str = "Default initialization"
