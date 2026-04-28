from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.ai.learning_service import (
    approve_policy,
    build_learning_snapshot,
    get_forecast,
    get_memory,
    get_policies,
    get_trust,
    run_learning_cycle,
    simulate_learning,
)
from app.ai.schemas import AILearningActionRequest, AILearningDataResponse, AILearningResponse, AILearningRunRequest
from app.audit.engine import append_audit_event
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ai/learning", tags=["AI Adaptive Learning"])


@router.get("", response_model=AILearningResponse)
@router.get("/", response_model=AILearningResponse)
def get_ai_learning_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AILearningResponse:
    return AILearningResponse(**build_learning_snapshot())


@router.post("/run", response_model=AILearningResponse)
def post_ai_learning_run_route(
    request: Request,
    payload: AILearningRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AILearningResponse:
    result = run_learning_cycle(payload.scenario_id)
    append_audit_event(
        category="system",
        action="ai_learning_cycle_run",
        severity="medium",
        target_module="ai",
        target_id=payload.scenario_id,
        status="success",
        reason=f"Adaptive learning cycle produced score {result['learning_score']}",
        request=request,
        identity=identity,
        risk_score=int(result["learning_score"]),
    )
    return AILearningResponse(**result)


@router.get("/memory", response_model=AILearningDataResponse)
def get_ai_learning_memory_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AILearningDataResponse:
    return AILearningDataResponse(**get_memory())


@router.get("/forecast", response_model=AILearningDataResponse)
def get_ai_learning_forecast_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AILearningDataResponse:
    return AILearningDataResponse(**get_forecast())


@router.get("/trust", response_model=AILearningDataResponse)
def get_ai_learning_trust_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AILearningDataResponse:
    return AILearningDataResponse(**get_trust())


@router.get("/policies", response_model=AILearningDataResponse)
def get_ai_learning_policies_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> AILearningDataResponse:
    return AILearningDataResponse(**get_policies())


@router.post("/simulate", response_model=AILearningResponse)
def post_ai_learning_simulate_route(
    request: Request,
    payload: AILearningRunRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AILearningResponse:
    result = simulate_learning(payload.scenario_id)
    append_audit_event(
        category="system",
        action="ai_learning_simulation_run",
        severity="medium",
        target_module="ai",
        target_id=payload.scenario_id,
        status="success",
        reason=f"Simulation lab updated adaptive policy for {payload.scenario_id or 'default scenario'}",
        request=request,
        identity=identity,
        risk_score=42,
        is_demo=True,
    )
    return AILearningResponse(**result)


@router.post("/approve-policy", response_model=AILearningResponse)
def post_ai_learning_approve_policy_route(
    request: Request,
    payload: AILearningActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AILearningResponse:
    result = approve_policy(payload.policy_id)
    append_audit_event(
        category="system",
        action="ai_learning_policy_approved",
        severity="high",
        target_module="ai",
        target_id=payload.policy_id,
        status="success",
        reason=f"Human governance approved adaptive learning policy {payload.policy_id}",
        request=request,
        identity=identity,
        risk_score=64,
    )
    return AILearningResponse(**result)
