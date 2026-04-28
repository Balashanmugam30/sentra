from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.schemas import MLListResponse, MLMetricResponse, MLMutationRequest, MLMutationResponse
from app.ml.service import ml_service
from app.ml.store import tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/ml", tags=["Machine Learning Foundation"])

ML_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "analyst"}
ML_ORG_ROLES = {"owner", "org_admin", "operator", "executive", "billing_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in ML_APP_ROLES or str(tenant.get("org_role") or "") in ML_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Machine learning foundation access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "ml:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="ml",
        action=action,
        severity="medium",
        target_module="ml",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=34,
    )


@router.get("/summary", response_model=MLMetricResponse)
def get_ml_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLMetricResponse:
    _require_access(identity, tenant)
    return MLMetricResponse(data=cached_call(identity_tenant_cache_key(identity, "ml:summary"), 12, lambda: ml_service.summary(_scope(identity, tenant))))


@router.get("/datasets", response_model=MLListResponse)
def get_ml_datasets(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLListResponse:
    _require_access(identity, tenant)
    return MLListResponse(items=cached_call(identity_tenant_cache_key(identity, "ml:datasets"), 12, lambda: ml_service.datasets(_scope(identity, tenant))))


@router.post("/dataset/upload", response_model=MLMutationResponse)
def post_ml_dataset_upload(payload: MLMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLMutationResponse:
    _require_access(identity, tenant)
    dataset = ml_service.upload_dataset(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "dataset_uploaded", f"Dataset uploaded: {dataset['name']}", dataset["dataset_id"])
    return MLMutationResponse(ok=True, message="Dataset accepted for validation", data={"dataset": dataset})


@router.get("/features", response_model=MLListResponse)
def get_ml_features(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLListResponse:
    _require_access(identity, tenant)
    return MLListResponse(items=cached_call(identity_tenant_cache_key(identity, "ml:features"), 12, lambda: ml_service.features(_scope(identity, tenant))))


@router.get("/jobs", response_model=MLListResponse)
def get_ml_jobs(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLListResponse:
    _require_access(identity, tenant)
    return MLListResponse(items=cached_call(identity_tenant_cache_key(identity, "ml:jobs"), 8, lambda: ml_service.jobs(_scope(identity, tenant))))


@router.post("/train", response_model=MLMutationResponse)
def post_ml_train(payload: MLMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLMutationResponse:
    _require_access(identity, tenant)
    job = ml_service.train(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "training_job_queued", f"Training job queued: {job['model_domain']}", job["job_id"])
    return MLMutationResponse(ok=True, message="Training job queued", data={"job": job})


@router.get("/experiments", response_model=MLListResponse)
def get_ml_experiments(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLListResponse:
    _require_access(identity, tenant)
    return MLListResponse(items=cached_call(identity_tenant_cache_key(identity, "ml:experiments"), 12, lambda: ml_service.experiments(_scope(identity, tenant))))


@router.get("/models", response_model=MLListResponse)
def get_ml_models(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLListResponse:
    _require_access(identity, tenant)
    return MLListResponse(items=cached_call(identity_tenant_cache_key(identity, "ml:models"), 12, lambda: ml_service.models(_scope(identity, tenant))))


@router.post("/promote", response_model=MLMutationResponse)
def post_ml_promote(payload: MLMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLMutationResponse:
    _require_access(identity, tenant)
    model = ml_service.promote(_scope(identity, tenant), payload.model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
    _clear(identity)
    _log(request, identity, tenant, "model_promoted", f"Model promoted: {model['name']} {model['version']}", model["model_id"])
    return MLMutationResponse(ok=True, message="Model promoted to production", data={"model": model})


@router.post("/archive", response_model=MLMutationResponse)
def post_ml_archive(payload: MLMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MLMutationResponse:
    _require_access(identity, tenant)
    model = ml_service.archive(_scope(identity, tenant), payload.model_id)
    if model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
    _clear(identity)
    _log(request, identity, tenant, "model_archived", f"Model archived: {model['name']} {model['version']}", model["model_id"])
    return MLMutationResponse(ok=True, message="Model archived", data={"model": model})
