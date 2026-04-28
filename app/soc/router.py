from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key
from app.soc.engine import (
    build_soc_detections_snapshot,
    build_soc_health_snapshot,
    build_soc_incidents_snapshot,
    build_soc_live_snapshot,
    resolve_soc_incident_by_id,
    run_soc_scan,
    run_soc_test_attack,
)
from app.soc.schemas import (
    SocDetectionsResponse,
    SocHealthResponse,
    SocIncidentsResponse,
    SocLiveResponse,
    SocResolveIncidentRequest,
    SocResolveIncidentResponse,
    SocRunScanResponse,
    SocTestAttackRequest,
    SocTestAttackResponse,
)

router = APIRouter(prefix="/soc", tags=["SOC"])


def _require_soc_summary(identity: dict[str, object]) -> None:
    if not role_matches(str(identity["role"]), {"super_admin", "admin", "security_lead", "executive"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SOC summary access denied")


def _require_soc_full(identity: dict[str, object]) -> None:
    if not role_matches(str(identity["role"]), {"super_admin", "admin", "security_lead"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SOC full access denied")


@router.get("/live", response_model=SocLiveResponse)
def get_soc_live_route(identity: dict[str, object] = Depends(get_current_identity)) -> SocLiveResponse:
    _require_soc_summary(identity)
    include_full_details = role_matches(str(identity["role"]), {"super_admin", "admin", "security_lead"})
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"soc:live:{identity['role']}"),
        ttl_seconds=2,
        builder=lambda: build_soc_live_snapshot(include_full_details=include_full_details),
    )
    return SocLiveResponse(**snapshot)


@router.get("/health", response_model=SocHealthResponse)
def get_soc_health_route(identity: dict[str, object] = Depends(get_current_identity)) -> SocHealthResponse:
    _require_soc_full(identity)
    return SocHealthResponse(**build_soc_health_snapshot())


@router.get("/incidents", response_model=SocIncidentsResponse)
def get_soc_incidents_route(identity: dict[str, object] = Depends(get_current_identity)) -> SocIncidentsResponse:
    _require_soc_full(identity)
    return SocIncidentsResponse(**build_soc_incidents_snapshot())


@router.get("/detections", response_model=SocDetectionsResponse)
def get_soc_detections_route(identity: dict[str, object] = Depends(get_current_identity)) -> SocDetectionsResponse:
    _require_soc_full(identity)
    return SocDetectionsResponse(**build_soc_detections_snapshot())


@router.post("/run-scan", response_model=SocRunScanResponse)
def post_soc_run_scan_route(
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> SocRunScanResponse:
    _require_soc_full(identity)
    snapshot = run_soc_scan(identity=identity, request=request)
    clear_runtime_cache(identity_tenant_cache_key(identity, "soc:"))
    clear_runtime_cache("soc:")
    return SocRunScanResponse(
        scanned=True,
        detection_count=len(snapshot["detections"]),
        incident_count=len(snapshot["incidents"]),
        health_score=snapshot["health_score"],
    )


@router.post("/resolve-incident", response_model=SocResolveIncidentResponse)
def post_soc_resolve_incident_route(
    payload: SocResolveIncidentRequest,
    request: Request,
    identity: dict[str, object] = Depends(get_current_identity),
) -> SocResolveIncidentResponse:
    _require_soc_full(identity)
    incident = resolve_soc_incident_by_id(payload.incident_id, identity=identity, request=request)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOC incident not found")
    clear_runtime_cache(identity_tenant_cache_key(identity, "soc:"))
    clear_runtime_cache("soc:")
    return SocResolveIncidentResponse(resolved=True, incident=incident)


@router.post("/test-attack", response_model=SocTestAttackResponse)
def post_soc_test_attack_route(
    payload: SocTestAttackRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> SocTestAttackResponse:
    _require_soc_full(identity)
    response = SocTestAttackResponse(**run_soc_test_attack(payload.scenario))
    clear_runtime_cache(identity_tenant_cache_key(identity, "soc:"))
    clear_runtime_cache("soc:")
    return response
