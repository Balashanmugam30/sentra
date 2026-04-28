from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.geospatial.engine import (
    apply_geo_test_scenario,
    build_geo_focus_snapshot,
    build_geo_layers_snapshot,
    build_geo_live_snapshot,
    build_geo_route_snapshot,
)
from app.geospatial.schemas import (
    GeoFocusRequest,
    GeoFocusResponse,
    GeoLayersResponse,
    GeoLiveResponse,
    GeoRouteRequest,
    GeoRouteResponse,
    GeoTestScenarioRequest,
    GeoTestScenarioResponse,
)
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/geo", tags=["Geospatial"])


def _require_geo_identity(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "security_lead", "executive", "viewer", "guest_viewer"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geospatial access denied")


def _require_geo_control(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "security_lead"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Geospatial command access denied")


@router.get("/live", response_model=GeoLiveResponse)
def get_geo_live_route(identity: dict[str, object] = Depends(get_current_identity)) -> GeoLiveResponse:
    _require_geo_identity(identity)
    summary_only = role_matches(str(identity["role"]), {"viewer", "guest_viewer"})
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"geo:live:{identity['role']}"),
        ttl_seconds=3,
        builder=lambda: build_geo_live_snapshot(summary_only=summary_only),
    )
    return GeoLiveResponse(**snapshot)


@router.get("/layers", response_model=GeoLayersResponse)
def get_geo_layers_route(identity: dict[str, object] = Depends(get_current_identity)) -> GeoLayersResponse:
    _require_geo_identity(identity)
    return GeoLayersResponse(
        **build_geo_layers_snapshot(
            summary_only=role_matches(str(identity["role"]), {"viewer", "guest_viewer"})
        )
    )


@router.post("/route", response_model=GeoRouteResponse)
def post_geo_route_route(
    payload: GeoRouteRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> GeoRouteResponse:
    _require_geo_control(identity)
    return GeoRouteResponse(**build_geo_route_snapshot(from_zone=payload.from_zone, to_zone=payload.to_zone, mode=payload.mode))


@router.post("/focus", response_model=GeoFocusResponse)
def post_geo_focus_route(
    payload: GeoFocusRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> GeoFocusResponse:
    _require_geo_identity(identity)
    return GeoFocusResponse(
        **build_geo_focus_snapshot(
            zone=payload.zone,
            summary_only=role_matches(str(identity["role"]), {"viewer", "guest_viewer"}),
        )
    )


@router.post("/test-scenario", response_model=GeoTestScenarioResponse)
def post_geo_test_scenario_route(
    payload: GeoTestScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> GeoTestScenarioResponse:
    _require_geo_control(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "geo:"))
    clear_runtime_cache("geo:")
    return GeoTestScenarioResponse(
        status="completed",
        scenario=payload.scenario,
        live=GeoLiveResponse(**apply_geo_test_scenario(payload.scenario)),
    )
