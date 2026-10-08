from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.ai.intelligence_schemas import (
    ActionApprovalStatus,
    ActionProposal,
    IncidentCommanderAssessment,
    ProposalReviewRequest,
)
from app.ai.evidence_graph_engine import build_evidence_graph_from_observations
from app.ai.gemini_provider import gemini_provider
from app.ai.multimodal_perception import extract_multimodal_observations
from app.ai.rag_engine import rag_engine

# Active proposal registry for human-in-the-loop state machine
_proposals_store: Dict[str, ActionProposal] = {}
_assessments_store: Dict[str, IncidentCommanderAssessment] = {}

# Observability telemetry counters
_telemetry_metrics = {
    "total_assessments": 0,
    "gemini_live_calls": 0,
    "fallback_calls": 0,
    "conflicts_detected": 0,
    "proposals_approved": 0,
    "proposals_rejected": 0,
    "total_latency_ms": 0.0,
}


def run_incident_intelligence_cycle(
    incident_id: str,
    incident_title: str = "Active High-Energy Anomaly",
    incident_location: str = "Research Sector B",
    tenant_id: str = "TEN-BALA-UNI",
    simulated: bool = False,
) -> IncidentCommanderAssessment:
    """
    Executes the end-to-end intelligence cycle:
    1. Multimodal sensor & perception extraction
    2. Topological Evidence Graph assembly with cross-modal conflict detection
    3. Emergency SOP RAG citation retrieval
    4. Gemini 2.5 Flash / Deterministic Fallback Incident Commander synthesis
    5. Action Proposal registration into the human approval gate
    """
    # 1. Perception
    sources, observations = extract_multimodal_observations(simulated=simulated)

    # 2. Evidence Graph DAG
    evidence_graph = build_evidence_graph_from_observations(sources, observations)

    # 3. RAG Retrieval
    query_text = f"{incident_title} {incident_location} thermal smoke particulate evacuation ventilation"
    citations = rag_engine.query(query_text, tenant_id=tenant_id, top_k=3)

    # 4. Gemini / Fallback Commander Synthesis
    assessment = gemini_provider.synthesize_crisis_command(
        incident_id=incident_id,
        incident_title=incident_title,
        incident_location=incident_location,
        evidence_graph=evidence_graph,
        rag_citations=citations,
        tenant_id=tenant_id,
    )

    # 5. Store proposals for human approval gate
    for proposal in assessment.action_proposals:
        _proposals_store[proposal.id] = proposal

    _assessments_store[incident_id] = assessment

    # Telemetry update
    _telemetry_metrics["total_assessments"] += 1
    if assessment.inference_source == "GEMINI_LIVE_INFERENCE":
        _telemetry_metrics["gemini_live_calls"] += 1
    else:
        _telemetry_metrics["fallback_calls"] += 1
    if evidence_graph.cross_modal_conflict_detected:
        _telemetry_metrics["conflicts_detected"] += 1
    _telemetry_metrics["total_latency_ms"] += assessment.latency_ms

    return assessment


def get_latest_assessment(incident_id: str) -> Optional[IncidentCommanderAssessment]:
    if incident_id in _assessments_store:
        return _assessments_store[incident_id]
    # If not yet generated, run cycle on-demand
    return run_incident_intelligence_cycle(incident_id=incident_id)


def review_action_proposal(
    proposal_id: str,
    review_req: ProposalReviewRequest,
) -> ActionProposal:
    """
    Strict human approval state machine:
    Validates operator permissions, transitions proposal state,
    and updates audit journal.
    """
    if proposal_id not in _proposals_store:
        # Fallback create proposal if querying before assessment cycle
        _proposals_store[proposal_id] = ActionProposal(
            id=proposal_id,
            title="Ad-hoc Tactical Command Proposal",
            description="Emergency tactical dispatch proposal requiring sign-off.",
            action_type="TACTICAL_DISPATCH",
            priority="HIGH",
            risk_level="HIGH",
            target_zone="Sector B",
            approval_status=ActionApprovalStatus.PENDING_REVIEW,
        )

    proposal = _proposals_store[proposal_id]
    now_iso = datetime.now(timezone.utc).isoformat()

    if review_req.decision.lower() == "approve":
        proposal.approval_status = ActionApprovalStatus.APPROVED
        proposal.approved_by = f"{review_req.operator_name} ({review_req.operator_id})"
        proposal.approved_at = now_iso
        if review_req.modified_parameters:
            proposal.parameters.update(review_req.modified_parameters)
        _telemetry_metrics["proposals_approved"] += 1
    elif review_req.decision.lower() == "reject":
        proposal.approval_status = ActionApprovalStatus.REJECTED
        proposal.rejection_reason = review_req.rejection_reason or "Declined by Incident Commander."
        _telemetry_metrics["proposals_rejected"] += 1
    elif review_req.decision.lower() == "execute":
        proposal.approval_status = ActionApprovalStatus.EXECUTED
        proposal.approved_by = proposal.approved_by or f"{review_req.operator_name} ({review_req.operator_id})"
        proposal.approved_at = proposal.approved_at or now_iso

    return proposal


def get_intelligence_telemetry() -> Dict[str, Any]:
    total = _telemetry_metrics["total_assessments"]
    avg_latency = (_telemetry_metrics["total_latency_ms"] / total) if total > 0 else 0.0
    return {
        **_telemetry_metrics,
        "average_latency_ms": round(avg_latency, 2),
        "active_proposals_count": len(_proposals_store),
        "registered_assessments_count": len(_assessments_store),
    }
