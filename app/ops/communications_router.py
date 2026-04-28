from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.communications_service import (
    build_communications_snapshot,
    get_escalations,
    get_feed,
    get_metrics,
    get_templates,
    record_response,
    send_communication,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Mass Notification Communications"])


class CommunicationsSendRequest(BaseModel):
    template_id: str = Field(default="fire_evacuation", max_length=120)
    audience_id: str = Field(default="zone_3", max_length=120)
    channels: list[str] = Field(default_factory=lambda: ["in_app", "sms", "voice", "webhook"], max_length=8)
    reason: str | None = Field(default=None, max_length=240)


class CommunicationsResponseRequest(BaseModel):
    person_id: str = Field(default="USR-DEMO-RESPONDER", max_length=120)
    response: str = Field(..., max_length=40)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/communications")
def get_ops_communications_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_communications_snapshot()


@router.post("/communications/send")
def post_ops_communications_send_route(
    request: Request,
    payload: CommunicationsSendRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = send_communication(payload.template_id, payload.audience_id, payload.channels)
    append_audit_event(
        category="communications",
        action="mass_notification_sent",
        severity="high",
        target_module="ops-communications",
        target_id=payload.template_id,
        status="success",
        reason=payload.reason or f"Broadcast sent to {payload.audience_id}",
        request=request,
        identity=identity,
        risk_score=74,
        is_demo=True,
    )
    return result


@router.get("/communications/feed")
def get_ops_communications_feed_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_feed()


@router.get("/communications/metrics")
def get_ops_communications_metrics_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_metrics()


@router.post("/communications/respond")
def post_ops_communications_respond_route(
    request: Request,
    payload: CommunicationsResponseRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = record_response(payload.person_id, payload.response)
    append_audit_event(
        category="communications",
        action="two_way_response_received",
        severity="medium",
        target_module="ops-communications",
        target_id=payload.person_id,
        status="success",
        reason=payload.reason or f"Response received: {payload.response}",
        request=request,
        identity=identity,
        risk_score=38,
        is_demo=True,
    )
    return result


@router.get("/communications/escalations")
def get_ops_communications_escalations_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_escalations()


@router.get("/communications/templates")
def get_ops_communications_templates_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_templates()
