"""Internal production ops and launch-readiness router."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.billing.reconciliation import billing_reconciliation_snapshot, retry_failed_webhook_events
from app.core.health import liveness_payload, readiness_payload
from app.core.production import launch_readiness_score
from app.core.runtime_cache import clear_runtime_cache, get_runtime_cache_stats
from app.data.backup import create_backup_snapshot, list_backup_snapshots
from app.data.integrity import run_data_integrity_checks
from app.data.migrations_health import migrations_health
from app.ops.alerts import platform_alerts
from app.ops.logging import log_sink_status
from app.ops.telemetry import failed_route_summary, route_latency_summary
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.security.admin_reauth import admin_reauth_policy
from app.tenancy.context import get_tenant_context

router = APIRouter(prefix="/ops", tags=["Production Ops"])


def _require_ops(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if role_matches(str(identity.get("role") or ""), {"super_admin", "admin"}) or str(
        tenant.get("org_role") or ""
    ) in {"owner", "org_admin"}:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Production ops access required")


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str) -> None:
    append_audit_event(
        category="ops",
        action=action,
        severity="medium",
        target_module="ops",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=45,
    )


@router.get("/live")
def ops_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return {
        "liveness": liveness_payload(),
        "readiness": readiness_payload(),
        "launch": launch_readiness_score(),
        "alerts": platform_alerts(),
        "telemetry": route_latency_summary(),
    }


@router.get("/launch-readiness")
def ops_launch_readiness(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return launch_readiness_score()


@router.get("/errors")
def ops_errors(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return failed_route_summary()


@router.get("/performance")
def ops_performance(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return route_latency_summary()


@router.get("/deployment")
def ops_deployment(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return {
        "readiness": readiness_payload(),
        "migrations": migrations_health(),
        "logs": log_sink_status(),
        "backups": list_backup_snapshots()[:5],
        "admin_reauth": admin_reauth_policy(),
    }


@router.get("/data/integrity")
def ops_data_integrity(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return run_data_integrity_checks()


@router.get("/billing/reconciliation")
def ops_billing_reconciliation(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    return billing_reconciliation_snapshot()


@router.post("/admin/cache-flush")
def ops_cache_flush(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    clear_runtime_cache()
    _log(request, identity, tenant, "cache_flush", "Runtime cache flushed from ops console")
    return {"ok": True, "cache": get_runtime_cache_stats()}


@router.post("/admin/backup")
def ops_backup(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    snapshot = create_backup_snapshot("ops-console")
    _log(request, identity, tenant, "backup_snapshot_created", "Ops console backup snapshot created")
    return snapshot


@router.post("/admin/webhook-retry")
def ops_webhook_retry(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> dict[str, object]:
    _require_ops(identity, tenant)
    result = retry_failed_webhook_events()
    _log(request, identity, tenant, "webhook_retry", "Failed webhook retry requested")
    return result
