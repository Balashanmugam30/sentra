from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.audit.engine import append_audit_event
from app.ops.resources_service import (
    build_resources_snapshot,
    dispatch_resource,
    get_resource_alerts,
    get_resource_inventory,
    get_resource_teams,
    get_resource_vehicles,
)
from app.rbac.guard import get_current_identity

router = APIRouter(prefix="/ops", tags=["Resource Deployment Command"])


class ResourceDispatchRequest(BaseModel):
    incident_id: str = Field(default="INC-RES-001", max_length=120)
    unit_id: str | None = Field(default=None, max_length=120)
    reason: str | None = Field(default=None, max_length=240)


@router.get("/resources")
def get_ops_resources_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return build_resources_snapshot()


@router.post("/resources/dispatch")
def post_ops_resources_dispatch_route(
    request: Request,
    payload: ResourceDispatchRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    result = dispatch_resource(payload.incident_id, payload.unit_id)
    append_audit_event(
        category="operations",
        action="resource_dispatched",
        severity="high",
        target_module="ops-resources",
        target_id=payload.incident_id,
        status="success",
        reason=payload.reason or "Resource dispatched by deployment engine",
        request=request,
        identity=identity,
        risk_score=68,
        is_demo=True,
    )
    return result


@router.get("/resources/teams")
def get_ops_resources_teams_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resource_teams()


@router.get("/resources/inventory")
def get_ops_resources_inventory_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resource_inventory()


@router.get("/resources/vehicles")
def get_ops_resources_vehicles_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resource_vehicles()


@router.get("/resources/alerts")
def get_ops_resources_alerts_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    return get_resource_alerts()
