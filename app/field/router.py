from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.field.responders import build_responders_snapshot, register_responder
from app.field.schemas import (
    FieldAcknowledgeRequest,
    FieldAcknowledgeResponse,
    FieldBackupRequest,
    FieldBackupResponse,
    FieldCheckpointRequest,
    FieldCheckpointResponse,
    FieldLiveResponse,
    FieldRegisterRequest,
    FieldRegisterResponse,
    FieldRespondersResponse,
    FieldStatusUpdateRequest,
    FieldStatusUpdateResponse,
    FieldSyncRequest,
    FieldSyncResponse,
    FieldTasksResponse,
)
from app.field.sync import process_field_sync
from app.field.tasks import (
    acknowledge_field_task,
    build_field_live_snapshot,
    build_tasks_snapshot,
    open_backup_request,
    record_field_checkpoint,
    update_field_task_status,
)
from app.offline.engine import queue_event_if_needed
from app.rbac.guard import require_any_permission
from app.services.incident_service import get_all_incidents

router = APIRouter(prefix="/field", tags=["Field"])


@router.get("/live", response_model=FieldLiveResponse)
def get_field_live_route(
    _: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldLiveResponse:
    incidents = get_all_incidents()
    snapshot = build_field_live_snapshot(incidents)
    return FieldLiveResponse(
        generated_at=datetime.now(timezone.utc),
        **snapshot,
    )


@router.get("/responders", response_model=FieldRespondersResponse)
def get_field_responders_route(
    _: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldRespondersResponse:
    incidents = get_all_incidents()
    build_tasks_snapshot(incidents)
    return FieldRespondersResponse(
        generated_at=datetime.now(timezone.utc),
        responders=build_responders_snapshot(),
    )


@router.get("/tasks", response_model=FieldTasksResponse)
def get_field_tasks_route(
    _: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldTasksResponse:
    incidents = get_all_incidents()
    return FieldTasksResponse(
        generated_at=datetime.now(timezone.utc),
        tasks=build_tasks_snapshot(incidents),
    )


@router.post("/register", response_model=FieldRegisterResponse)
def post_field_register_route(request: Request, payload: FieldRegisterRequest) -> FieldRegisterResponse:
    responder = register_responder(
        responder_id=payload.responder_id,
        name=payload.name,
        role=payload.role,
        device=payload.device,
        zone=payload.zone,
    )
    build_tasks_snapshot(get_all_incidents())
    append_audit_event(
        category="field",
        action="responder_check_in",
        severity="low",
        target_module="field",
        status="success",
        reason=f"Responder registered in {payload.zone}",
        request=request,
        actor_user_id=payload.responder_id,
        actor_email=f"{payload.responder_id.lower()}@field.local",
        actor_role=payload.role,
        target_id=payload.responder_id,
        after_state={"zone": payload.zone, "device": payload.device},
        risk_score=12,
    )
    return FieldRegisterResponse(
        registered=True,
        session_token=responder.session_token,
        call_sign=responder.call_sign,
        sync_interval_seconds=responder.sync_interval_seconds,
    )


@router.post("/acknowledge", response_model=FieldAcknowledgeResponse)
def post_field_acknowledge_route(
    request: Request,
    payload: FieldAcknowledgeRequest,
    identity: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldAcknowledgeResponse:
    incidents = get_all_incidents()
    try:
        task = acknowledge_field_task(payload.task_id, payload.responder_id, incidents)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    queue_event_if_needed(
        source="field",
        event_type="acknowledge",
        payload={
            "task_id": payload.task_id,
            "responder_id": payload.responder_id,
        },
        applied_locally=True,
    )
    append_audit_event(
        category="field",
        action="task_acknowledge",
        severity="low",
        target_module="field",
        status="success",
        reason="Responder acknowledged task",
        request=request,
        identity=identity,
        target_id=payload.task_id,
        risk_score=18,
    )
    return FieldAcknowledgeResponse(status="acknowledged", task=task)


@router.post("/status", response_model=FieldStatusUpdateResponse)
def post_field_status_route(
    request: Request,
    payload: FieldStatusUpdateRequest,
    identity: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldStatusUpdateResponse:
    incidents = get_all_incidents()
    try:
        task = update_field_task_status(
            payload.task_id,
            payload.responder_id,
            payload.status,
            payload.note,
            incidents,
        )
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    queue_event_if_needed(
        source="field",
        event_type="status",
        payload={
            "task_id": payload.task_id,
            "responder_id": payload.responder_id,
            "status": payload.status,
            "note": payload.note,
        },
        applied_locally=True,
    )
    append_audit_event(
        category="field",
        action="status_update",
        severity="low",
        target_module="field",
        status="success",
        reason=f"Task moved to {payload.status}",
        request=request,
        identity=identity,
        target_id=payload.task_id,
        risk_score=16,
    )
    return FieldStatusUpdateResponse(status="updated", task=task)


@router.post("/request-backup", response_model=FieldBackupResponse)
def post_field_request_backup_route(
    request: Request,
    payload: FieldBackupRequest,
    identity: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldBackupResponse:
    incidents = get_all_incidents()
    try:
        snapshot = open_backup_request(payload.responder_id, payload.zone, payload.reason, incidents)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    queue_event_if_needed(
        source="field",
        event_type="backup_request",
        payload={
            "responder_id": payload.responder_id,
            "zone": payload.zone,
            "reason": payload.reason,
        },
        applied_locally=True,
    )
    append_audit_event(
        category="field",
        action="backup_request",
        severity="medium",
        target_module="field",
        status="success",
        reason=payload.reason,
        request=request,
        identity=identity,
        target_id=snapshot["request_id"],
        risk_score=34,
    )
    return FieldBackupResponse(
        status="open",
        request_id=snapshot["request_id"],
        open_requests=snapshot["open_requests"],
    )


@router.post("/checkpoint", response_model=FieldCheckpointResponse)
def post_field_checkpoint_route(
    request: Request,
    payload: FieldCheckpointRequest,
    identity: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldCheckpointResponse:
    incidents = get_all_incidents()
    try:
        snapshot = record_field_checkpoint(payload.responder_id, payload.zone, payload.checkpoint, incidents)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    queue_event_if_needed(
        source="field",
        event_type="checkpoint",
        payload={
            "responder_id": payload.responder_id,
            "zone": payload.zone,
            "checkpoint": payload.checkpoint,
        },
        applied_locally=True,
    )
    append_audit_event(
        category="field",
        action="checkpoint",
        severity="low",
        target_module="field",
        status="success",
        reason=f"Checkpoint {payload.checkpoint} verified",
        request=request,
        identity=identity,
        target_id=payload.checkpoint,
        risk_score=14,
    )
    return FieldCheckpointResponse(
        status="verified",
        checkpoint=snapshot["checkpoint"],
        task_updated=snapshot["task_updated"],
    )


@router.post("/sync", response_model=FieldSyncResponse)
def post_field_sync_route(
    payload: FieldSyncRequest,
    _: dict[str, object] = Depends(require_any_permission("field.respond", "field.manage")),
) -> FieldSyncResponse:
    incidents = get_all_incidents()
    try:
        snapshot = process_field_sync(
            payload.responder_id,
            [event.model_dump() for event in payload.queued_events],
            incidents,
        )
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    for event in payload.queued_events:
        queue_event_if_needed(
            source="field",
            event_type=event.event_type,
            payload={
                "responder_id": payload.responder_id,
                **event.model_dump(exclude_none=True),
            },
            applied_locally=True,
        )
    return FieldSyncResponse(
        status="synced",
        processed_events=snapshot["processed_events"],
        queued_remaining=snapshot["queued_remaining"],
    )
