from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.environment.engine import (
    apply_environment_focus,
    apply_environment_test_scenario,
    build_environment_alerts_snapshot,
    build_environment_forecast_snapshot,
    build_environment_live_snapshot,
)
from app.environment.schemas import (
    EnvironmentAlertsResponse,
    EnvironmentFocusRequest,
    EnvironmentForecastResponse,
    EnvironmentLiveResponse,
    EnvironmentTestScenarioRequest,
    EnvironmentTestScenarioResponse,
)
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/environment", tags=["Environment"])


def _require_environment_identity(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "executive", "viewer", "guest_viewer"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Environment access denied")


def _require_environment_control(identity: dict[str, object]) -> None:
    if not role_matches(str(identity["role"]), {"super_admin", "admin", "operations_commander"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Environment control access denied")


@router.get("/live", response_model=EnvironmentLiveResponse)
def get_environment_live_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> EnvironmentLiveResponse:
    _require_environment_identity(identity)
    summary_only = role_matches(str(identity["role"]), {"viewer", "guest_viewer"})
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"environment:live:{identity['role']}"),
        ttl_seconds=5,
        builder=lambda: build_environment_live_snapshot(summary_only=summary_only),
    )
    return EnvironmentLiveResponse(**snapshot)


@router.get("/forecast", response_model=EnvironmentForecastResponse)
def get_environment_forecast_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> EnvironmentForecastResponse:
    _require_environment_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"environment:forecast:{identity['role']}"),
        ttl_seconds=20,
        builder=lambda: build_environment_forecast_snapshot(
            summary_only=role_matches(str(identity["role"]), {"viewer", "guest_viewer"})
        ),
    )
    return EnvironmentForecastResponse(**snapshot)


@router.get("/alerts", response_model=EnvironmentAlertsResponse)
def get_environment_alerts_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> EnvironmentAlertsResponse:
    _require_environment_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"environment:alerts:{identity['role']}"),
        ttl_seconds=12,
        builder=lambda: build_environment_alerts_snapshot(
            summary_only=role_matches(str(identity["role"]), {"viewer", "guest_viewer"})
        ),
    )
    return EnvironmentAlertsResponse(**snapshot)


@router.post("/test-scenario", response_model=EnvironmentTestScenarioResponse)
def post_environment_test_scenario_route(
    payload: EnvironmentTestScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> EnvironmentTestScenarioResponse:
    _require_environment_control(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "environment:"))
    clear_runtime_cache("environment:")
    return EnvironmentTestScenarioResponse(
        status="completed",
        scenario=payload.scenario,
        live=EnvironmentLiveResponse(
            **apply_environment_test_scenario(payload.scenario, summary_only=False)
        ),
    )


@router.post("/focus", response_model=EnvironmentLiveResponse)
def post_environment_focus_route(
    payload: EnvironmentFocusRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> EnvironmentLiveResponse:
    _require_environment_identity(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "environment:"))
    clear_runtime_cache("environment:")
    return EnvironmentLiveResponse(
        **apply_environment_focus(
            payload.lat,
            payload.lng,
            summary_only=role_matches(str(identity["role"]), {"viewer", "guest_viewer"}),
        )
    )
