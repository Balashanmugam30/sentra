from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.resilience_service import build_resilience_snapshot, get_resilience_events, get_resilience_forecast, run_heal
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Autonomous Resilience"])


class ResilienceHealRequest(BaseModel):
    action_id: str | None = Field(default="HEAL-WEBHOOK-RETRY", max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/resilience")
def get_ops_resilience_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_resilience_snapshot()


@router.post("/resilience/heal")
def post_ops_resilience_heal_route(
    request: Request,
    payload: ResilienceHealRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = run_heal(payload.action_id)
    append_audit_event(
        category="operations",
        action="resilience_auto_heal_run",
        severity="high",
        target_module="ops-resilience",
        target_id=payload.action_id,
        status="success",
        reason=payload.reason or "Self-heal action executed",
        request=request,
        identity=identity,
        risk_score=64,
        is_demo=True,
    )
    return result


@router.get("/resilience/forecast")
def get_ops_resilience_forecast_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resilience_forecast()


@router.get("/resilience/events")
def get_ops_resilience_events_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resilience_events()
