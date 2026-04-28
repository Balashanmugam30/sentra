from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.master.schemas import MasterListResponse, MasterMutationRequest, MasterMutationResponse, MasterResponse
from app.master.service import master_service
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(tags=["Phase 24 Master"])

MASTER_APP_ROLES = {"super_admin", "admin", "executive", "security_manager", "operations_commander", "analyst"}
MASTER_ORG_ROLES = {"owner", "org_admin", "executive", "ops_admin", "billing_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in MASTER_APP_ROLES or str(tenant.get("org_role") or "") in MASTER_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Phase 24 master access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 8):
    return cached_call(identity_tenant_cache_key(identity, f"master:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "master:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, risk_score: int = 46) -> None:
    append_audit_event(
        category="phase_24_master",
        action=action,
        severity="high" if risk_score >= 70 else "medium",
        target_module="master",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/autonomy/summary", response_model=MasterResponse)
def get_autonomy_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)
    return MasterResponse(data=_cache(identity, "autonomy_summary", lambda: master_service.autonomy_summary(_scope(identity, tenant)), 6))


@router.post("/autonomy/run", response_model=MasterMutationResponse)
def run_autonomy(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.run_autonomy(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "autonomy_grid_run", "Approved plan executed through autonomous grid", 74)
    return MasterMutationResponse(ok=True, message="Autonomous execution grid run completed", data=result)


@router.post("/autonomy/approve", response_model=MasterMutationResponse)
def approve_autonomy(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.approve_autonomy(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "autonomy_plan_approved", payload.reason or "Autonomy action approved", 66)
    return MasterMutationResponse(ok=True, message="Autonomy action approved", data=result)


@router.post("/autonomy/rollback", response_model=MasterMutationResponse)
def rollback_autonomy(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.rollback_autonomy(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "autonomy_action_rolled_back", payload.reason or "Autonomy rollback executed", 59)
    return MasterMutationResponse(ok=True, message="Autonomy rollback executed", data=result)


@router.get("/autonomy/recovery", response_model=MasterResponse)
def get_autonomy_recovery(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)
    return MasterResponse(data=_cache(identity, "autonomy_recovery", lambda: master_service.recovery(_scope(identity, tenant)), 8))


@router.get("/autonomy/events", response_model=MasterListResponse)
def get_autonomy_events(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "autonomy_events", lambda: master_service.events(_scope(identity, tenant)), 5))


@router.get("/cloud/summary", response_model=MasterResponse)
def get_cloud_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)
    return MasterResponse(data=_cache(identity, "cloud_summary", lambda: master_service.cloud_summary(_scope(identity, tenant)), 12))


@router.get("/cloud/tenants", response_model=MasterListResponse)
def get_cloud_tenants(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "cloud_tenants", lambda: master_service.cloud_summary(_scope(identity, tenant))["tenants"], 12))


@router.get("/cloud/regions", response_model=MasterListResponse)
def get_cloud_regions(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "cloud_regions", lambda: master_service.cloud_summary(_scope(identity, tenant))["regions"], 15))


@router.post("/cloud/tenant/create", response_model=MasterMutationResponse)
def create_cloud_tenant(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.create_tenant(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "cloud_tenant_created", "Enterprise tenant provisioned", 42)
    return MasterMutationResponse(ok=True, message="Enterprise tenant provisioned", data=result)


@router.post("/cloud/tenant/switch", response_model=MasterMutationResponse)
def switch_cloud_tenant(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.switch_tenant(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "cloud_tenant_switched", "Operator switched organization context", 32)
    return MasterMutationResponse(ok=True, message="Tenant context switched", data=result)


@router.get("/cloud/usage", response_model=MasterListResponse)
def get_cloud_usage(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "cloud_usage", lambda: master_service.cloud_summary(_scope(identity, tenant))["usage"], 12))


@router.get("/cloud/scale", response_model=MasterResponse)
def get_cloud_scale(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)

    def build() -> dict[str, object]:
        cloud = master_service.cloud_summary(_scope(identity, tenant))
        tenants = list(cloud["tenants"])
        usage = list(cloud["usage"])
        regions = list(cloud["regions"])
        noisy_tenants = sorted(usage, key=lambda item: int(item.get("ai_runs", 0)) + int(item.get("notifications", 0)), reverse=True)[:3]
        storage_tb = round(sum(float(item.get("storage_tb", 0)) for item in usage), 2)
        quota_watch = [item for item in usage if int(item.get("quota_health", 100)) < 80 or int(item.get("seat_utilization", 0)) >= 86]
        return {
            "tenant_count": len(tenants),
            "region_count": len(regions),
            "storage_usage_tb": storage_tb,
            "compute_usage": {
                "ai_runs_today": cloud["ai_runs_today"],
                "notifications_today": cloud["notifications_today"],
                "command_capacity": cloud["average_command_capacity"],
                "queue_backpressure": 27,
                "fallback_cache_hit_rate": 91,
            },
            "quota_management": quota_watch,
            "noisy_tenants": noisy_tenants,
            "enterprise_sla_heatmap": [
                {
                    "region": region["name"],
                    "sla_percent": region["sla_percent"],
                    "latency_ms": region["latency_ms"],
                    "capacity": region["capacity"],
                    "state": "healthy" if int(region["sla_percent"]) >= 97 else "watch",
                }
                for region in regions
            ],
            "premium_support_queue": [
                {"tenant": "MetroCare Hospitals", "priority": "P1", "reason": "SLA review before oxygen-system pilot", "eta_minutes": 9},
                {"tenant": "SmartCity Authority", "priority": "P2", "reason": "Quota expansion for city drill", "eta_minutes": 18},
                {"tenant": "Grand Meridian Hotels", "priority": "P2", "reason": "Noisy notification tenant optimization", "eta_minutes": 24},
            ],
            "hardening": {
                "circuit_breakers": "enabled",
                "idempotency": "enforced on mutation endpoints",
                "bulkheads": "tenant queues isolated",
                "error_budget_remaining_percent": 93,
                "slo_target": "99.95%",
            },
            "tenants": tenants,
            "regions": regions,
        }

    return MasterResponse(data=_cache(identity, "cloud_scale", build, 12))


@router.get("/cloud/audit", response_model=MasterListResponse)
def get_cloud_audit(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "cloud_audit", lambda: master_service.cloud_summary(_scope(identity, tenant))["audit"], 10))


@router.get("/board/summary", response_model=MasterResponse)
def get_board_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)
    return MasterResponse(data=_cache(identity, "board_summary", lambda: master_service.board_summary(_scope(identity, tenant)), 18))


@router.get("/board/revenue", response_model=MasterListResponse)
def get_board_revenue(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "board_revenue", lambda: master_service.revenue(_scope(identity, tenant)), 18))


@router.get("/board/investors", response_model=MasterListResponse)
def get_board_investors(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterListResponse:
    _require_access(identity, tenant)
    return MasterListResponse(items=_cache(identity, "board_investors", lambda: master_service.investors(_scope(identity, tenant)), 18))


@router.get("/board/finance", response_model=MasterResponse)
def get_board_finance(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterResponse:
    _require_access(identity, tenant)
    return MasterResponse(data=_cache(identity, "board_finance", lambda: master_service.board_summary(_scope(identity, tenant)), 18))


@router.post("/board/forecast", response_model=MasterMutationResponse)
def post_board_forecast(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.forecast(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "board_forecast_generated", "Executive forecast generated", 28)
    return MasterMutationResponse(ok=True, message="Executive forecast generated", data=result)


@router.post("/board/valuation", response_model=MasterMutationResponse)
def post_board_valuation(payload: MasterMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MasterMutationResponse:
    _require_access(identity, tenant)
    result = master_service.valuation(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "board_valuation_simulated", "Valuation simulator executed", 26)
    return MasterMutationResponse(ok=True, message="Valuation simulator executed", data=result)
