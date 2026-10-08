from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.ai.intelligence_schemas import (
    ActionProposal,
    EvidenceGraph,
    IncidentCommanderAssessment,
    ProposalReviewRequest,
    RAGCitation,
)
from app.ai.incident_commander_engine import (
    get_intelligence_telemetry,
    get_latest_assessment,
    review_action_proposal,
    run_incident_intelligence_cycle,
)
from app.ai.rag_engine import rag_engine

router = APIRouter(prefix="/ai/intelligence", tags=["Incident Intelligence"])


class IncidentAssessRequest(BaseModel):
    incident_id: str = Field(..., description="Unique incident identifier")
    incident_title: str = Field("Active High-Energy Anomaly", description="Incident headline")
    incident_location: str = Field("Research Sector B", description="Physical location")
    tenant_id: str = Field("TEN-BALA-UNI", description="Tenant isolation ID")
    simulated: bool = Field(False, description="Flag for synthetic simulation telemetry")


@router.post("/assess", response_model=IncidentCommanderAssessment)
def assess_incident(req: IncidentAssessRequest):
    return run_incident_intelligence_cycle(
        incident_id=req.incident_id,
        incident_title=req.incident_title,
        incident_location=req.incident_location,
        tenant_id=req.tenant_id,
        simulated=req.simulated,
    )


@router.get("/assessment/{incident_id}", response_model=IncidentCommanderAssessment)
def get_assessment(incident_id: str):
    return get_latest_assessment(incident_id=incident_id)


@router.get("/evidence-graph/{incident_id}", response_model=EvidenceGraph)
def get_incident_evidence_graph(incident_id: str):
    assessment = get_latest_assessment(incident_id=incident_id)
    return assessment.evidence_graph


@router.post("/proposals/{proposal_id}/review", response_model=ActionProposal)
def review_proposal(proposal_id: str, req: ProposalReviewRequest):
    return review_action_proposal(proposal_id=proposal_id, review_req=req)


@router.get("/rag/search", response_model=list[RAGCitation])
def search_sop_citations(
    query: str = Query(..., min_length=2, description="Search query for emergency SOPs"),
    tenant_id: str = Query("TEN-BALA-UNI", description="Tenant ID"),
    top_k: int = Query(3, ge=1, le=10),
):
    return rag_engine.query(query_text=query, tenant_id=tenant_id, top_k=top_k)


@router.get("/telemetry", response_model=Dict[str, Any])
def read_intelligence_telemetry():
    return get_intelligence_telemetry()
