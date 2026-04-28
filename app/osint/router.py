from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.osint.engine import (
    apply_osint_focus,
    apply_osint_test_scenario,
    build_osint_history_snapshot,
    build_osint_live_snapshot,
    build_osint_news_snapshot,
    build_osint_rumor_snapshot,
)
from app.osint.schemas import (
    OsintFocusRequest,
    OsintHistoryResponse,
    OsintLiveResponse,
    OsintNewsResponse,
    OsintRumorResponse,
    OsintTestScenarioRequest,
    OsintTestScenarioResponse,
)
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import identity_tenant_cache_key

router = APIRouter(prefix="/osint", tags=["OSINT"])


def _require_osint_identity(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "communications_lead", "executive", "viewer", "guest_viewer"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="OSINT access denied")


def _require_osint_control(identity: dict[str, object]) -> None:
    if not role_matches(
        str(identity["role"]),
        {"super_admin", "admin", "operations_commander", "communications_lead"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="OSINT control access denied")


def _summary_only(identity: dict[str, object]) -> bool:
    return role_matches(str(identity["role"]), {"viewer", "guest_viewer"})


@router.get("/live", response_model=OsintLiveResponse)
def get_osint_live_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintLiveResponse:
    _require_osint_identity(identity)
    summary_only = _summary_only(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"osint:live:{identity['role']}"),
        ttl_seconds=8,
        builder=lambda: build_osint_live_snapshot(summary_only=summary_only),
    )
    return OsintLiveResponse(**snapshot)


@router.get("/news", response_model=OsintNewsResponse)
def get_osint_news_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintNewsResponse:
    _require_osint_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"osint:news:{identity['role']}"),
        ttl_seconds=12,
        builder=lambda: build_osint_news_snapshot(summary_only=_summary_only(identity)),
    )
    return OsintNewsResponse(**snapshot)


@router.get("/rumors", response_model=OsintRumorResponse)
def get_osint_rumors_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintRumorResponse:
    _require_osint_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"osint:rumors:{identity['role']}"),
        ttl_seconds=12,
        builder=lambda: build_osint_rumor_snapshot(summary_only=_summary_only(identity)),
    )
    return OsintRumorResponse(**snapshot)


@router.get("/history", response_model=OsintHistoryResponse)
def get_osint_history_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintHistoryResponse:
    _require_osint_identity(identity)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, f"osint:history:{identity['role']}"),
        ttl_seconds=15,
        builder=lambda: build_osint_history_snapshot(summary_only=_summary_only(identity)),
    )
    return OsintHistoryResponse(**snapshot)


@router.post("/test-scenario", response_model=OsintTestScenarioResponse)
def post_osint_test_scenario_route(
    payload: OsintTestScenarioRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintTestScenarioResponse:
    _require_osint_control(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "osint:"))
    clear_runtime_cache("osint:")
    return OsintTestScenarioResponse(
        status="completed",
        scenario=payload.scenario,
        live=OsintLiveResponse(**apply_osint_test_scenario(payload.scenario, summary_only=False)),
    )


@router.post("/focus", response_model=OsintLiveResponse)
def post_osint_focus_route(
    payload: OsintFocusRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OsintLiveResponse:
    _require_osint_identity(identity)
    clear_runtime_cache(identity_tenant_cache_key(identity, "osint:"))
    clear_runtime_cache("osint:")
    return OsintLiveResponse(**apply_osint_focus(payload.keyword, summary_only=_summary_only(identity)))
