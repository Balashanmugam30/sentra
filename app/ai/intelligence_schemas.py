from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SourceType(str, Enum):
    CAMERA = "CAMERA"
    FLIR_THERMAL = "FLIR_THERMAL"
    IOT_SENSOR = "IOT_SENSOR"
    AIR_QUALITY = "AIR_QUALITY"
    ACCESS_CONTROL = "ACCESS_CONTROL"
    HUMAN_REPORT = "HUMAN_REPORT"
    SEISMIC = "SEISMIC"
    DRONE = "DRONE"
    HISTORICAL = "HISTORICAL"


class ActionApprovalStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"


class SourceNode(BaseModel):
    id: str = Field(..., description="Unique source node ID")
    name: str = Field(..., description="Device or reporter name")
    source_type: SourceType = Field(..., description="Type of intelligence source")
    location: str = Field(..., description="Zone or coordinates of source")
    calibration_index: float = Field(1.0, ge=0.0, le=1.0, description="Source calibration factor (0.0 to 1.0)")
    status: str = Field("active", description="Operational status: active, degraded, offline")
    simulated: bool = Field(False, description="Whether this feed is synthetic/simulated")


class ObservationNode(BaseModel):
    id: str = Field(..., description="Unique observation ID")
    source_id: str = Field(..., description="Source node ID producing this observation")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metric_type: str = Field(..., description="Metric: thermal, particulate, motion, acoustics, human_voice")
    raw_value: float = Field(..., description="Raw observed value")
    unit: str = Field(..., description="Unit of measurement (°C, ppm, dB, count)")
    normalized_severity: float = Field(..., ge=0.0, le=1.0, description="Normalized severity rating (0.0 to 1.0)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Observation certainty (0.0 to 1.0)")
    bounding_box: Optional[List[float]] = Field(None, description="[ymin, xmin, ymax, xmax] normalized (0.0 to 1.0)")
    label: str = Field(..., description="Categorical label e.g. 'Smoke Plume', 'Thermal Influx'")
    simulated: bool = Field(False, description="Flag indicating synthetic provenance")


class CorroborationEdge(BaseModel):
    source_obs_id: str
    target_obs_id: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    cross_modal_factor: float = Field(1.0, description="Cross-modal multiplier")
    corroboration_rationale: str


class ConflictEdge(BaseModel):
    obs_a_id: str
    obs_b_id: str
    discrepancy_metric: float = Field(..., ge=0.0, le=1.0)
    conflict_severity: str = Field("moderate", description="low, moderate, high, critical")
    explanation: str


class EvidenceNode(BaseModel):
    id: str = Field(..., description="Evidence ID e.g. EV-01")
    title: str
    description: str
    observation_ids: List[str] = Field(default_factory=list)
    primary_source_type: SourceType
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    variance_penalty: float = Field(0.0, ge=0.0, le=1.0)
    conflict_score: float = Field(0.0, ge=0.0, le=1.0)
    verification_status: str = Field("verified", description="unverified, corroborated, conflicted, verified")
    provenance_chain: List[str] = Field(default_factory=list)


class EvidenceGraph(BaseModel):
    sources: List[SourceNode] = Field(default_factory=list)
    observations: List[ObservationNode] = Field(default_factory=list)
    evidence: List[EvidenceNode] = Field(default_factory=list)
    corroborations: List[CorroborationEdge] = Field(default_factory=list)
    conflicts: List[ConflictEdge] = Field(default_factory=list)
    fused_confidence: float = Field(..., ge=0.0, le=1.0)
    cross_modal_conflict_detected: bool = False
    conflict_summary: Optional[str] = None


class RAGCitation(BaseModel):
    doc_id: str
    title: str
    standard: str
    chunk_id: str
    section: str
    excerpt: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)


class SpecialistAgentAssessment(BaseModel):
    role: str = Field(..., description="Fire Commander, Medical Triage, Evacuation Coordinator, Crowd Dynamics, Structural Safety")
    agent_id: str
    severity_rating: int = Field(..., ge=1, le=5)
    confidence: float = Field(..., ge=0.0, le=1.0)
    rationale: str
    proposed_actions: List[str] = Field(default_factory=list)
    dissent_or_caveats: Optional[str] = None


class ActionProposal(BaseModel):
    id: str
    title: str
    description: str
    action_type: str = Field(..., description="ZONE_CONTAINMENT, TACTICAL_DISPATCH, MASS_EVACUATION, HVAC_QUARANTINE, PERIMETER_LOCKDOWN")
    priority: str = Field("HIGH", description="CRITICAL, HIGH, MODERATE, LOW")
    risk_level: str = Field("HIGH", description="EXTREME, HIGH, MEDIUM, LOW")
    target_zone: str
    sop_citations: List[str] = Field(default_factory=list)
    approval_status: ActionApprovalStatus = ActionApprovalStatus.PENDING_REVIEW
    requires_operator_role: str = Field("commander", description="Role needed to approve")
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)


class IncidentCommanderAssessment(BaseModel):
    incident_id: str
    tenant_id: str = "TEN-BALA-UNI"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    threat_level: str = Field("HIGH", description="CRITICAL, HIGH, MODERATE, LOW")
    consensus_score: float = Field(..., ge=0.0, le=1.0)
    executive_summary: str
    inference_source: str = Field("GEMINI_LIVE_INFERENCE", description="GEMINI_LIVE_INFERENCE or RULE_BASED_FALLBACK")
    model_name: str = Field("gemini-2.5-flash")
    is_degraded: bool = False
    degradation_reason: Optional[str] = None
    evidence_graph: EvidenceGraph
    specialist_debates: List[SpecialistAgentAssessment] = Field(default_factory=list)
    action_proposals: List[ActionProposal] = Field(default_factory=list)
    citations: List[RAGCitation] = Field(default_factory=list)
    latency_ms: float = 0.0
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class ProposalReviewRequest(BaseModel):
    operator_id: str
    operator_name: str
    decision: str = Field(..., description="'approve' or 'reject'")
    rejection_reason: Optional[str] = None
    modified_parameters: Optional[Dict[str, Any]] = None
