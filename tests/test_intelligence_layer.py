from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ai.intelligence_schemas import ActionApprovalStatus, ProposalReviewRequest
from app.ai.multimodal_perception import extract_multimodal_observations
from app.ai.evidence_graph_engine import build_evidence_graph_from_observations
from app.ai.rag_engine import rag_engine
from app.ai.gemini_provider import gemini_provider
from app.ai.incident_commander_engine import (
    run_incident_intelligence_cycle,
    review_action_proposal,
    get_intelligence_telemetry,
)


@pytest.fixture
def client():
    return TestClient(app)


def test_multimodal_perception_extraction():
    sources, observations = extract_multimodal_observations(simulated=True)
    assert len(sources) >= 4
    assert len(observations) >= 4
    source_types = {s.source_type.value for s in sources}
    assert "FLIR_THERMAL" in source_types
    assert "AIR_QUALITY" in source_types
    assert "CAMERA" in source_types
    assert "HUMAN_REPORT" in source_types

    # Verify bounding box present on optical/thermal observations
    flir_obs = next(o for o in observations if o.metric_type == "thermal_gradient")
    assert flir_obs.bounding_box is not None
    assert len(flir_obs.bounding_box) == 4
    assert flir_obs.raw_value > 50.0


def test_evidence_graph_and_conflict_detection():
    sources, observations = extract_multimodal_observations(simulated=False)
    graph = build_evidence_graph_from_observations(sources, observations)

    assert len(graph.evidence) >= 2
    assert 0.0 <= graph.fused_confidence <= 1.0
    assert isinstance(graph.corroborations, list)
    assert isinstance(graph.conflicts, list)

    # Verify provenance chains exist on evidence nodes
    for ev in graph.evidence:
        assert len(ev.provenance_chain) > 0
        assert 0.0 <= ev.confidence_score <= 1.0


def test_rag_engine_retrieval_and_tenant_isolation():
    # Query for evacuation and dampers
    citations = rag_engine.query("plenum smoke damper isolation", tenant_id="TEN-BALA-UNI", top_k=2)
    assert len(citations) > 0
    first_cit = citations[0]
    assert first_cit.standard in ["OSHA 1910.120(q)", "NFPA 1600:2024", "SOP-DIR-2026-B4"]
    assert first_cit.relevance_score > 0.0
    assert len(first_cit.excerpt) > 10

    # Tenant isolation test: non-matching tenant does not get campus specific SOP
    external_citations = rag_engine.query("Campus Facility Directive", tenant_id="TEN-OTHER", top_k=5)
    doc_ids = [c.doc_id for c in external_citations]
    assert "DOC-CAMPUS-SOP-B4" not in doc_ids


def test_gemini_fallback_and_incident_commander_cycle():
    assessment = run_incident_intelligence_cycle(
        incident_id="INC-TEST-001",
        incident_title="Chemical Plume & Thermal Influx",
        incident_location="Research Sector B",
        tenant_id="TEN-BALA-UNI",
        simulated=False,
    )

    assert assessment.incident_id == "INC-TEST-001"
    assert assessment.threat_level in ["CRITICAL", "HIGH", "MODERATE"]
    assert len(assessment.specialist_debates) >= 5
    assert len(assessment.action_proposals) >= 3
    assert len(assessment.citations) > 0

    # Ensure degradation transparency is respected
    if assessment.inference_source == "RULE_BASED_FALLBACK":
        assert assessment.is_degraded is True
        assert assessment.degradation_reason is not None


def test_action_proposal_human_approval_state_machine():
    assessment = run_incident_intelligence_cycle(
        incident_id="INC-TEST-STATE",
        incident_title="Server Room Thermal Surge",
        incident_location="Sector B Level 2",
    )
    first_proposal = assessment.action_proposals[0]
    assert first_proposal.approval_status == ActionApprovalStatus.PENDING_REVIEW

    # Approve action proposal
    approved = review_action_proposal(
        proposal_id=first_proposal.id,
        review_req=ProposalReviewRequest(
            operator_id="USR-OP-COMMANDER",
            operator_name="Chief Operations Officer",
            decision="approve",
            modified_parameters={"plenum_delay_sec": 10},
        ),
    )
    assert approved.approval_status == ActionApprovalStatus.APPROVED
    assert "Chief Operations Officer" in approved.approved_by
    assert approved.parameters.get("plenum_delay_sec") == 10

    # Reject a proposal
    second_proposal = assessment.action_proposals[1]
    rejected = review_action_proposal(
        proposal_id=second_proposal.id,
        review_req=ProposalReviewRequest(
            operator_id="USR-OP-COMMANDER",
            operator_name="Chief Operations Officer",
            decision="reject",
            rejection_reason="Unnecessary structural risk.",
        ),
    )
    assert rejected.approval_status == ActionApprovalStatus.REJECTED
    assert rejected.rejection_reason == "Unnecessary structural risk."


def test_api_endpoints_via_client(client: TestClient):
    # 1. POST /ai/intelligence/assess
    res = client.post(
        "/ai/intelligence/assess",
        json={
            "incident_id": "INC-API-401",
            "incident_title": "Multi-Sensor Thermal Surge",
            "incident_location": "Manufacturing Sector 4",
            "tenant_id": "TEN-BALA-UNI",
            "simulated": False,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["incident_id"] == "INC-API-401"
    assert "evidence_graph" in data
    assert "specialist_debates" in data
    assert "action_proposals" in data

    # 2. GET /ai/intelligence/evidence-graph/{incident_id}
    res_graph = client.get("/ai/intelligence/evidence-graph/INC-API-401")
    assert res_graph.status_code == 200
    graph_data = res_graph.json()
    assert "sources" in graph_data
    assert "evidence" in graph_data
    assert "fused_confidence" in graph_data

    # 3. GET /ai/intelligence/rag/search
    res_rag = client.get("/ai/intelligence/rag/search?query=evacuation%20routes")
    assert res_rag.status_code == 200
    rag_data = res_rag.json()
    assert len(rag_data) > 0
    assert "chunk_id" in rag_data[0]

    # 4. POST /ai/intelligence/proposals/{proposal_id}/review
    proposal_id = data["action_proposals"][0]["id"]
    res_review = client.post(
        f"/ai/intelligence/proposals/{proposal_id}/review",
        json={
            "operator_id": "USR-BALA-01",
            "operator_name": "Bala Shanmugam",
            "decision": "approve",
        },
    )
    assert res_review.status_code == 200
    reviewed_data = res_review.json()
    assert reviewed_data["approval_status"] == "approved"

    # 5. GET /ai/intelligence/telemetry
    res_telem = client.get("/ai/intelligence/telemetry")
    assert res_telem.status_code == 200
    telem_data = res_telem.json()
    assert telem_data["total_assessments"] >= 1
    assert "average_latency_ms" in telem_data
