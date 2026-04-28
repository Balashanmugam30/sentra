from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request

from app.audit.engine import (
    build_audit_live_snapshot,
    export_audit_events,
    get_audit_events_page,
    get_audit_integrity_snapshot,
    log_test_event,
    prune_retention,
    search_audit_events,
)
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.audit.schemas import (
    AuditEventsPageResponse,
    AuditExportFormatResponse,
    AuditIntegrityResponse,
    AuditLiveResponse,
    AuditSearchRequest,
    AuditTestEventRequest,
    AuditTestEventResponse,
    AuditRetentionPruneResponse,
)
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/audit", tags=["Audit"])


def _require_audit_summary(identity: dict[str, object]) -> None:
    if not role_matches(str(identity["role"]), {"super_admin", "admin", "security_lead", "executive"}):
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Audit summary access denied")


def _require_audit_full(identity: dict[str, object]) -> None:
    if not role_matches(str(identity["role"]), {"super_admin", "admin", "security_lead"}):
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Full audit access denied")


@router.get("/live", response_model=AuditLiveResponse)
def get_audit_live_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditLiveResponse:
    _require_audit_summary(identity)
    role = str(identity["role"])
    tenant_id = str(identity.get("tenant_id") or "")

    def build() -> AuditLiveResponse:
        snapshot = build_audit_live_snapshot(
            include_full_details=role_matches(role, {"super_admin", "admin", "security_lead"}),
            tenant_id=tenant_id,
        )
        return AuditLiveResponse(generated_at=datetime.now(timezone.utc), **snapshot)

    return cached_call(identity_tenant_cache_key(identity, f"audit:live:{role}"), 5, build)


@router.get("/events", response_model=AuditEventsPageResponse)
def get_audit_events_route(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditEventsPageResponse:
    _require_audit_full(identity)
    def build() -> AuditEventsPageResponse:
        snapshot = get_audit_events_page(
            page=page,
            page_size=page_size,
            tenant_id=str(identity.get("tenant_id") or ""),
        )
        return AuditEventsPageResponse(generated_at=datetime.now(timezone.utc), **snapshot)

    return cached_call(identity_tenant_cache_key(identity, f"audit:events:{page}:{page_size}"), 10, build)


@router.get("/export", response_model=AuditExportFormatResponse)
def get_audit_export_route(
    format: str = Query(default="json", pattern="^(json|csv)$"),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditExportFormatResponse:
    _require_audit_full(identity)
    return AuditExportFormatResponse(
        **export_audit_events(export_format=format, tenant_id=str(identity.get("tenant_id") or ""))
    )


@router.post("/search", response_model=AuditEventsPageResponse)
def post_audit_search_route(
    payload: AuditSearchRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditEventsPageResponse:
    _require_audit_full(identity)
    snapshot = search_audit_events(
        payload.model_dump(exclude_none=True),
        tenant_id=str(identity.get("tenant_id") or ""),
    )
    return AuditEventsPageResponse(generated_at=datetime.now(timezone.utc), **snapshot)


@router.get("/integrity", response_model=AuditIntegrityResponse)
def get_audit_integrity_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditIntegrityResponse:
    _require_audit_full(identity)
    return AuditIntegrityResponse(**get_audit_integrity_snapshot())


@router.post("/test-event", response_model=AuditTestEventResponse)
def post_audit_test_event_route(
    payload: AuditTestEventRequest,
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditTestEventResponse:
    _require_audit_full(identity)
    event = log_test_event(identity=identity, request=request, payload=payload.model_dump())
    clear_runtime_cache(identity_tenant_cache_key(identity, "audit:"))
    clear_runtime_cache("audit:")
    return AuditTestEventResponse(created=True, event=event)


@router.post("/retention/prune", response_model=AuditRetentionPruneResponse)
def post_audit_retention_prune_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuditRetentionPruneResponse:
    _require_audit_full(identity)
    result = AuditRetentionPruneResponse(**prune_retention())
    clear_runtime_cache(identity_tenant_cache_key(identity, "audit:"))
    clear_runtime_cache("audit:")
    return result
