from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.facility.controls import (
    build_facility_assets_snapshot,
    build_facility_live_snapshot,
    execute_announcement,
    execute_door_command,
    execute_elevator_recall,
    execute_hvac_command,
    execute_lockdown,
    process_fire_panel_event,
    run_facility_test_scenario,
)
from app.facility.events import get_facility_events_snapshot
from app.facility.schemas import (
    FacilityActionResponse,
    FacilityAnnouncementRequest,
    FacilityAssetsResponse,
    FacilityDoorCommandRequest,
    FacilityElevatorRecallRequest,
    FacilityEventsResponse,
    FacilityFirePanelEventRequest,
    FacilityFirePanelEventResponse,
    FacilityHvacCommandRequest,
    FacilityLiveResponse,
    FacilityLockdownRequest,
    FacilityTestScenarioRequest,
    FacilityTestScenarioResponse,
)
from app.rbac.guard import require_permission
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/facility", tags=["Facility"])


@router.get("/live", response_model=FacilityLiveResponse)
def get_facility_live_route(
    _: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityLiveResponse:
    snapshot = build_facility_live_snapshot(get_all_incidents())
    return FacilityLiveResponse(generated_at=datetime.now(timezone.utc), **snapshot)


@router.get("/assets", response_model=FacilityAssetsResponse)
def get_facility_assets_route(
    _: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityAssetsResponse:
    return FacilityAssetsResponse(
        generated_at=datetime.now(timezone.utc),
        groups=build_facility_assets_snapshot(),
    )


@router.get("/events", response_model=FacilityEventsResponse)
def get_facility_events_route(
    _: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityEventsResponse:
    return FacilityEventsResponse(
        generated_at=datetime.now(timezone.utc),
        events=get_facility_events_snapshot(),
    )


@router.post("/lockdown", response_model=FacilityActionResponse)
def post_facility_lockdown_route(
    request: Request,
    payload: FacilityLockdownRequest,
    identity: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityActionResponse:
    try:
        result = execute_lockdown(payload.scope, payload.zone, payload.reason)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="facility",
        action="lockdown",
        severity="critical",
        target_module="facility",
        status="success",
        reason=payload.reason,
        request=request,
        identity=identity,
        target_id=payload.zone or payload.scope,
        after_state={"scope": payload.scope, "zone": payload.zone, "mode": result["mode"]},
        risk_score=86,
    )
    return FacilityActionResponse(**result)


@router.post("/door-command", response_model=FacilityActionResponse)
def post_facility_door_command_route(
    request: Request,
    payload: FacilityDoorCommandRequest,
    identity: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityActionResponse:
    try:
        result = execute_door_command(payload.asset_id, payload.command)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="facility",
        action="door_command",
        severity="high",
        target_module="facility",
        status="success",
        reason=f"Door command {payload.command}",
        request=request,
        identity=identity,
        target_id=payload.asset_id,
        after_state={"command": payload.command},
        risk_score=64,
    )
    return FacilityActionResponse(**result)


@router.post("/hvac-command", response_model=FacilityActionResponse)
def post_facility_hvac_command_route(
    request: Request,
    payload: FacilityHvacCommandRequest,
    identity: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityActionResponse:
    try:
        result = execute_hvac_command(payload.zone, payload.command)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="facility",
        action="hvac_command",
        severity="high",
        target_module="facility",
        status="success",
        reason=f"HVAC command {payload.command}",
        request=request,
        identity=identity,
        target_id=payload.zone,
        after_state={"command": payload.command},
        risk_score=66,
    )
    return FacilityActionResponse(**result)


@router.post("/announcement", response_model=FacilityActionResponse)
def post_facility_announcement_route(
    request: Request,
    payload: FacilityAnnouncementRequest,
    identity: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityActionResponse:
    try:
        result = execute_announcement(payload.scope, payload.zone, payload.template)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="facility",
        action="announcement",
        severity="medium",
        target_module="facility",
        status="success",
        reason=f"Announcement template {payload.template}",
        request=request,
        identity=identity,
        target_id=payload.zone or payload.scope,
        risk_score=36,
    )
    return FacilityActionResponse(**result)


@router.post("/elevator-recall", response_model=FacilityActionResponse)
def post_facility_elevator_recall_route(
    request: Request,
    payload: FacilityElevatorRecallRequest,
    identity: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityActionResponse:
    try:
        result = execute_elevator_recall(payload.building)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="facility",
        action="elevator_recall",
        severity="high",
        target_module="facility",
        status="success",
        reason=f"Elevator recall for {payload.building}",
        request=request,
        identity=identity,
        target_id=payload.building,
        risk_score=61,
    )
    return FacilityActionResponse(**result)


@router.post("/fire-panel-event", response_model=FacilityFirePanelEventResponse)
async def post_facility_fire_panel_event_route(
    payload: FacilityFirePanelEventRequest,
    _: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityFirePanelEventResponse:
    result = await process_fire_panel_event(payload.zone, payload.alarm)
    return FacilityFirePanelEventResponse(**result)


@router.post("/test-scenario", response_model=FacilityTestScenarioResponse)
async def post_facility_test_scenario_route(
    payload: FacilityTestScenarioRequest,
    _: dict[str, object] = Depends(require_permission("facility.control")),
) -> FacilityTestScenarioResponse:
    actions = await run_facility_test_scenario(payload.scenario)
    return FacilityTestScenarioResponse(
        status="completed",
        scenario=payload.scenario,
        actions=[FacilityActionResponse(**action) for action in actions],
    )
