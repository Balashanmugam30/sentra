from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.ai.council_service import (
    approve_plan,
    get_agents,
    get_consensus,
    get_debate,
    pause_agents,
    reject_plan,
    run_council,
)
from app.ai.schemas import AICouncilActionRequest, AICouncilDataResponse, AICouncilRunRequest, MultiAgentCouncilResponse
from app.audit.engine import append_audit_event
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ai/council", tags=["AI Multi-Agent Council"])


@router.post("/run", response_model=MultiAgentCouncilResponse)
def post_ai_council_run_route(
    request: Request,
    payload: AICouncilRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> MultiAgentCouncilResponse:
    result = run_council(payload.scenario_id)
    append_audit_event(
        category="system",
        action="ai_council_run",
        severity="high",
        target_module="ai",
        target_id=str(result["scenario_id"]),
        status="success",
        reason=f"Multi-agent council produced consensus {result['consensus']['consensus_score']}%",
        request=request,
        identity=identity,
        risk_score=int(result["consensus"]["consensus_score"]),
    )
    return MultiAgentCouncilResponse(**result)


@router.get("/agents", response_model=AICouncilDataResponse)
def get_ai_council_agents_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AICouncilDataResponse:
    return AICouncilDataResponse(**get_agents())


@router.get("/debate", response_model=AICouncilDataResponse)
def get_ai_council_debate_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AICouncilDataResponse:
    return AICouncilDataResponse(**get_debate())


@router.get("/consensus", response_model=AICouncilDataResponse)
def get_ai_council_consensus_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AICouncilDataResponse:
    return AICouncilDataResponse(**get_consensus())


@router.post("/approve", response_model=MultiAgentCouncilResponse)
def post_ai_council_approve_route(
    request: Request,
    payload: AICouncilActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> MultiAgentCouncilResponse:
    result = approve_plan(payload.reason)
    append_audit_event(
        category="system",
        action="ai_council_plan_approved",
        severity="high",
        target_module="ai",
        target_id=str(result["scenario_id"]),
        status="success",
        reason=payload.reason or "Council unified plan approved",
        request=request,
        identity=identity,
        risk_score=72,
    )
    return MultiAgentCouncilResponse(**result)


@router.post("/reject", response_model=MultiAgentCouncilResponse)
def post_ai_council_reject_route(
    request: Request,
    payload: AICouncilActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> MultiAgentCouncilResponse:
    result = reject_plan(payload.reason)
    append_audit_event(
        category="system",
        action="ai_council_plan_rejected",
        severity="medium",
        target_module="ai",
        target_id=str(result["scenario_id"]),
        status="success",
        reason=payload.reason or "Council unified plan rejected",
        request=request,
        identity=identity,
        risk_score=44,
    )
    return MultiAgentCouncilResponse(**result)


@router.post("/pause", response_model=MultiAgentCouncilResponse)
def post_ai_council_pause_route(
    request: Request,
    payload: AICouncilActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> MultiAgentCouncilResponse:
    result = pause_agents(payload.reason)
    append_audit_event(
        category="system",
        action="ai_council_agents_paused",
        severity="medium",
        target_module="ai",
        target_id=str(result["scenario_id"]),
        status="success",
        reason=payload.reason or "Council agents paused",
        request=request,
        identity=identity,
        risk_score=38,
    )
    return MultiAgentCouncilResponse(**result)
