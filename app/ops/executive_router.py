from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.executive_service import (
    build_executive_snapshot,
    get_executive_kpis,
    get_executive_summary,
    run_ceo_action,
    run_strategy_simulation,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Executive Operations Supremacy"])


class ExecutiveActionRequest(BaseModel):
    action_id: str = Field(default="safety_first", max_length=120)
    reason: str | None = Field(default=None, max_length=240)


class ExecutiveSimulationRequest(BaseModel):
    option_id: str = Field(default="partial_shutdown", max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/executive")
def get_ops_executive_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_executive_snapshot()


@router.post("/executive/action")
def post_ops_executive_action_route(
    request: Request,
    payload: ExecutiveActionRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_ceo_action(payload.action_id)
    append_audit_event(
        category="operations",
        action="ceo_action_plan_launched",
        severity="high",
        target_module="ops-executive",
        target_id=payload.action_id,
        status="success",
        reason=payload.reason or "CEO one-click action converted into governed plan",
        request=request,
        identity=identity,
        risk_score=72,
        is_demo=True,
    )
    return result


@router.post("/executive/simulate")
def post_ops_executive_simulate_route(
    request: Request,
    payload: ExecutiveSimulationRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_strategy_simulation(payload.option_id)
    append_audit_event(
        category="operations",
        action="board_strategy_simulated",
        severity="medium",
        target_module="ops-executive",
        target_id=payload.option_id,
        status="success",
        reason=payload.reason or "Executive strategy simulation run",
        request=request,
        identity=identity,
        risk_score=52,
        is_demo=True,
    )
    return result


@router.get("/executive/summary")
def get_ops_executive_summary_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_executive_summary()


@router.get("/executive/kpis")
def get_ops_executive_kpis_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_executive_kpis()
