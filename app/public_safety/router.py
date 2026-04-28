from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.public_safety.engine import (
    apply_public_safety_test_scenario,
    build_public_safety_live_snapshot,
    build_public_safety_traffic_snapshot,
    build_public_safety_transit_snapshot,
    build_public_safety_utility_snapshot,
    build_route_priority_snapshot,
)
from app.public_safety.schemas import (
    PublicSafetyLiveResponse,
    PublicSafetyTestScenarioRequest,
    PublicSafetyTestScenarioResponse,
    RoutePriorityRequest,
    RoutePriorityResponse,
    TrafficGridResponse,
    TransitResponse,
    UtilityResponse,
)
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/public-safety", tags=["Public Safety"])


def _require_public_safety_identity(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "security_lead", "executive", "viewer", "guest_viewer"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Public safety access denied")


def _require_public_safety_control(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "security_lead"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Public safety command access denied")


def _summary_only(identity: dict[str, object]) -> bool:
    return role_matches(str(identity["role"]), {"executive", "viewer", "guest_viewer"})


@router.get("/live", response_model=PublicSafetyLiveResponse)
def get_public_safety_live_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> PublicSafetyLiveResponse:
    _require_public_safety_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"public_safety:live:{identity['role']}"),
        ttl_seconds=5,
        builder=lambda: build_public_safety_live_snapshot(summary_only=_summary_only(identity)),
    )
    return PublicSafetyLiveResponse(**snapshot)


@router.get("/traffic", response_model=TrafficGridResponse)
def get_public_safety_traffic_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> TrafficGridResponse:
    _require_public_safety_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"public_safety:traffic:{identity['role']}"),
        ttl_seconds=8,
        builder=lambda: build_public_safety_traffic_snapshot(summary_only=_summary_only(identity)),
    )
    return TrafficGridResponse(**snapshot)


@router.get("/transit", response_model=TransitResponse)
def get_public_safety_transit_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> TransitResponse:
    _require_public_safety_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"public_safety:transit:{identity['role']}"),
        ttl_seconds=15,
        builder=lambda: build_public_safety_transit_snapshot(summary_only=_summary_only(identity)),
    )
    return TransitResponse(**snapshot)


@router.get("/utilities", response_model=UtilityResponse)
def get_public_safety_utilities_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> UtilityResponse:
    _require_public_safety_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"public_safety:utilities:{identity['role']}"),
        ttl_seconds=15,
        builder=lambda: build_public_safety_utility_snapshot(summary_only=_summary_only(identity)),
    )
    return UtilityResponse(**snapshot)


@router.post("/route-priority", response_model=RoutePriorityResponse)
def post_public_safety_route_priority_route(
    payload: RoutePriorityRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> RoutePriorityResponse:
    _require_public_safety_control(identity)
    return RoutePriorityResponse(
        **build_route_priority_snapshot(
            vehicle_type=payload.vehicle_type,
            from_zone=payload.from_zone,
            to_zone=payload.to_zone,
        )
    )


@router.post("/test-scenario", response_model=PublicSafetyTestScenarioResponse)
def post_public_safety_test_scenario_route(
    payload: PublicSafetyTestScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> PublicSafetyTestScenarioResponse:
    _require_public_safety_control(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "public_safety:"))
    clear_runtime_cache("public_safety:")
    return PublicSafetyTestScenarioResponse(
        status="completed",
        scenario=payload.scenario,
        live=PublicSafetyLiveResponse(**apply_public_safety_test_scenario(payload.scenario)),
    )
