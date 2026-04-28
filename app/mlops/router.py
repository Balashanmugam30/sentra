from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import tenant_scope
from app.mlops.schemas import MLOpsListResponse, MLOpsMetricResponse, MLOpsMutationRequest, MLOpsMutationResponse
from app.mlops.service import mlops_service
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/mlops", tags=["MLOps Production Layer"])

MLOPS_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "analyst"}
MLOPS_ORG_ROLES = {"owner", "org_admin", "operator", "executive", "billing_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in MLOPS_APP_ROLES or str(tenant.get("org_role") or "") in MLOPS_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="MLOps production access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "mlops:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="mlops",
        action=action,
        severity="medium",
        target_module="mlops",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=42,
    )


@router.get("/summary", response_model=MLOpsMetricResponse)
def get_mlops_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMetricResponse:
    _require_access(identity, tenant)
    return MLOpsMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "mlops:summary"), 8, lambda: mlops_service.summary(_scope(identity, tenant))))


@router.get("/models/live", response_model=MLOpsListResponse)
def get_live_models(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsListResponse:
    _require_access(identity, tenant)
    return MLOpsListResponse(items=cached_call(identity_tenant_cache_key(identity, "mlops:models"), 8, lambda: mlops_service.live_models(_scope(identity, tenant))))


@router.post("/predict", response_model=MLOpsMutationResponse)
def post_predict(payload: MLOpsMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMutationResponse:
    _require_access(identity, tenant)
    prediction = mlops_service.predict(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "prediction_executed", f"Live prediction executed for {prediction['zone']}", prediction["prediction_id"])
    return MLOpsMutationResponse(ok=True, message="Live prediction executed", data={"prediction": prediction})


@router.get("/deployments", response_model=MLOpsListResponse)
def get_deployments(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsListResponse:
    _require_access(identity, tenant)
    return MLOpsListResponse(items=cached_call(identity_tenant_cache_key(identity, "mlops:deployments"), 8, lambda: mlops_service.deployments(_scope(identity, tenant))))


@router.post("/promote", response_model=MLOpsMutationResponse)
def post_promote(payload: MLOpsMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMutationResponse:
    _require_access(identity, tenant)
    deployment = mlops_service.promote(_scope(identity, tenant), payload.model_id)
    if deployment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    _clear(identity)
    _log(request, identity, tenant, "model_promoted", f"Model promoted: {deployment['name']} {deployment['version']}", deployment["deployment_id"])
    return MLOpsMutationResponse(ok=True, message="Model promoted to production", data={"deployment": deployment})


@router.post("/canary", response_model=MLOpsMutationResponse)
def post_canary(payload: MLOpsMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMutationResponse:
    _require_access(identity, tenant)
    deployment = mlops_service.canary(_scope(identity, tenant), payload.model_id, payload.canary_percent)
    if deployment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    _clear(identity)
    _log(request, identity, tenant, "canary_rollout_changed", f"Canary adjusted to {deployment['canary_percent']} percent", deployment["deployment_id"])
    return MLOpsMutationResponse(ok=True, message="Canary rollout updated", data={"deployment": deployment})


@router.post("/rollback", response_model=MLOpsMutationResponse)
def post_rollback(payload: MLOpsMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMutationResponse:
    _require_access(identity, tenant)
    deployment = mlops_service.rollback(_scope(identity, tenant), payload.model_id)
    if deployment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    _clear(identity)
    _log(request, identity, tenant, "model_rollback", f"Rollback triggered for {deployment['name']}", deployment["deployment_id"])
    return MLOpsMutationResponse(ok=True, message="Rollback triggered", data={"deployment": deployment})


@router.get("/drift", response_model=MLOpsListResponse)
def get_drift(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsListResponse:
    _require_access(identity, tenant)
    return MLOpsListResponse(items=cached_call(identity_tenant_cache_key(identity, "mlops:drift"), 8, lambda: mlops_service.drift(_scope(identity, tenant))))


@router.get("/monitoring", response_model=MLOpsMetricResponse)
def get_monitoring(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMetricResponse:
    _require_access(identity, tenant)
    return MLOpsMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "mlops:monitoring"), 8, lambda: mlops_service.monitoring(_scope(identity, tenant))))


@router.post("/retrain", response_model=MLOpsMutationResponse)
def post_retrain(payload: MLOpsMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLOpsMutationResponse:
    _require_access(identity, tenant)
    event = mlops_service.retrain(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "auto_retrain_triggered", f"Retrain triggered: {event['payload'].get('domain')}", event["event_id"])
    return MLOpsMutationResponse(ok=True, message="Auto retrain trigger queued", data={"event": event})

