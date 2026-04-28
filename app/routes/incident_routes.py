from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials

from app.auth.internal import has_internal_token, internal_request_identity, is_valid_internal_request
from app.auth.session import bearer_scheme, get_current_auth_context, get_current_user
from app.audit.engine import append_audit_event
from app.core.observability import log_event
from app.schemas.incident_schema import ApiResponse, IncidentCreate, IncidentResponse, IncidentStatusUpdate
from app.services.incident_service import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    update_incident_status,
)

router = APIRouter(prefix="/incidents", tags=["Incidents"])


def _serialize_incident(incident) -> IncidentResponse:
    return IncidentResponse(
        id=incident.id,
        type=incident.type,
        status=incident.status,
        severity=incident.severity,
        location=incident.location,
        created_at=incident.created_at,
        title=incident.title,
        description=incident.description,
        category=incident.category,
        lat=incident.lat,
        lng=incident.lng,
        created_by=incident.created_by,
        assigned_to=incident.assigned_to,
        updated_at=incident.updated_at,
        images=incident.images or [],
        videos=incident.videos or [],
        ai_summary=incident.ai_summary,
        source=incident.source,
        risk_level=incident.risk_level,
        incident_type=incident.incident_type,
        confidence=incident.confidence,
        detected_by=incident.detected_by,
        recommended_action=incident.recommended_action,
        priority=incident.priority,
        decision_confidence=incident.decision_confidence,
        decided_by=incident.decided_by,
    )


def _is_internal_identity(identity: dict[str, object]) -> bool:
    return identity.get("auth_type") == "internal_api_key"


def _identity_for_audit(identity: dict[str, object]) -> dict[str, str]:
    return {
        "email": str(identity.get("email") or ""),
        "role": str(identity.get("role") or ""),
        "user_id": str(identity.get("user_id") or ""),
    }


def resolve_incident_create_identity(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, object]:
    trace_id = request.headers.get("x-request-id") or request.headers.get("x-trace-id") or "missing"

    if has_internal_token(request):
        if is_valid_internal_request(request):
            log_event(
                "info",
                "incident_internal_token_accepted",
                trace_id=trace_id,
                route="/incidents",
                status=202,
            )
            return internal_request_identity()

        log_event(
            "warning",
            "incident_internal_token_rejected",
            trace_id=trace_id,
            route="/incidents",
            status=401,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key",
        )

    return get_current_auth_context(request, credentials).user


@router.post("", response_model=ApiResponse, status_code=201)
async def create_incident_endpoint(
    payload: IncidentCreate,
    request: Request,
    identity: dict[str, object] = Depends(resolve_incident_create_identity),
) -> ApiResponse:
    internal_request = _is_internal_identity(identity)
    created_by = str(identity.get("user_id") or identity.get("email") or "unknown")
    log_event(
        "info",
        "incident_created_internal" if internal_request else "incident_created",
        trace_id=payload.trace_id or request.headers.get("x-request-id") or "missing",
        route="/incidents",
        status=201,
        auth_type="internal_api_key" if internal_request else "user_session",
    )
    incident = await create_incident(payload, created_by=created_by)
    append_audit_event(
        category="incident",
        action="incident_created",
        severity="medium",
        target_module="incidents",
        status="success",
        reason=(
            "Incident created from trusted internal simulator or pipeline token"
            if internal_request
            else "Incident created from authenticated Firebase/Sentra session"
        ),
        request=request,
        identity=_identity_for_audit(identity),
        target_id=incident.id,
        risk_score=50,
    )
    return ApiResponse(data=_serialize_incident(incident))


@router.get("", response_model=ApiResponse)
def list_incidents_endpoint(user: dict[str, object] = Depends(get_current_user)) -> ApiResponse:
    incidents = [_serialize_incident(incident) for incident in get_all_incidents()]
    return ApiResponse(data=incidents)


@router.get("/{incident_id}", response_model=ApiResponse)
def get_incident_endpoint(incident_id: str, user: dict[str, object] = Depends(get_current_user)) -> ApiResponse:
    incident = get_incident_by_id(incident_id)
    return ApiResponse(data=_serialize_incident(incident))


@router.patch("/{incident_id}", response_model=ApiResponse)
async def update_incident_status_endpoint(incident_id: str, payload: IncidentStatusUpdate, request: Request, user: dict[str, object] = Depends(get_current_user)) -> ApiResponse:
    incident = await update_incident_status(incident_id, payload.status, updated_by=str(user.get("user_id") or user.get("email") or "unknown"))
    append_audit_event(
        category="incident",
        action="incident_status_updated",
        severity="medium",
        target_module="incidents",
        status="success",
        reason="Incident status updated from authenticated Firebase/Sentra session",
        request=request,
        identity={"user_id": str(user.get("user_id") or ""), "email": str(user.get("email") or ""), "role": str(user.get("role") or "")},
        target_id=incident.id,
        after_state={"status": payload.status},
        risk_score=42,
    )
    return ApiResponse(data=_serialize_incident(incident))
