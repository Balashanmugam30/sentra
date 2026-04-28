from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.data_empire.schemas import (
    DataEmpireLiveResponse,
    DataEmpireMutationRequest,
    DataEmpireMutationResponse,
    EntityGraphResponse,
    ForecastResponse,
    InsightsResponse,
    MoatResponse,
    PrivacyResponse,
    SignalsResponse,
    ValueResponse,
)
from app.data_empire.service import data_empire_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/data-empire", tags=["Data Empire"])

DATA_EMPIRE_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
DATA_EMPIRE_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in DATA_EMPIRE_APP_ROLES or str(tenant.get("org_role") or "") in DATA_EMPIRE_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Data Empire access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "data-empire:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="data_empire",
        action=action,
        severity="medium",
        target_module="data_empire",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=38,
    )


@router.get("/live", response_model=DataEmpireLiveResponse)
def get_data_empire_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireLiveResponse:
    _require_access(identity, tenant)
    return DataEmpireLiveResponse(**cached_call(identity_tenant_cache_key(identity, "data-empire:live"), 10, lambda: data_empire_store.live(_scope(identity, tenant))))


@router.get("/signals", response_model=SignalsResponse)
def get_data_empire_signals(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SignalsResponse:
    _require_access(identity, tenant)
    return SignalsResponse(**cached_call(identity_tenant_cache_key(identity, "data-empire:signals"), 14, lambda: data_empire_store.signals(_scope(identity, tenant))))


@router.get("/graph", response_model=EntityGraphResponse)
def get_data_empire_graph(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> EntityGraphResponse:
    _require_access(identity, tenant)
    return EntityGraphResponse(**cached_call(identity_tenant_cache_key(identity, "data-empire:graph"), 20, lambda: data_empire_store.graph(_scope(identity, tenant))))


@router.get("/insights", response_model=InsightsResponse)
def get_data_empire_insights(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InsightsResponse:
    _require_access(identity, tenant)
    return InsightsResponse(insights=cached_call(identity_tenant_cache_key(identity, "data-empire:insights"), 12, lambda: data_empire_store.insights(_scope(identity, tenant))))


@router.get("/forecast", response_model=ForecastResponse)
def get_data_empire_forecast(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ForecastResponse:
    _require_access(identity, tenant)
    return ForecastResponse(forecasts=cached_call(identity_tenant_cache_key(identity, "data-empire:forecast"), 14, lambda: data_empire_store.forecast(_scope(identity, tenant))))


@router.get("/value", response_model=ValueResponse)
def get_data_empire_value(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ValueResponse:
    _require_access(identity, tenant)
    return ValueResponse(**cached_call(identity_tenant_cache_key(identity, "data-empire:value"), 18, lambda: data_empire_store.value(_scope(identity, tenant))))


@router.get("/moat", response_model=MoatResponse)
def get_data_empire_moat(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MoatResponse:
    _require_access(identity, tenant)
    return MoatResponse(moat=cached_call("data-empire:moat", 20, data_empire_store.moat))


@router.get("/privacy", response_model=PrivacyResponse)
def get_data_empire_privacy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PrivacyResponse:
    _require_access(identity, tenant)
    return PrivacyResponse(privacy=data_empire_store.privacy(_scope(identity, tenant)))


@router.post("/run-ingestion", response_model=DataEmpireMutationResponse)
def post_data_empire_ingestion(payload: DataEmpireMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireMutationResponse:
    _require_access(identity, tenant)
    job = data_empire_store.run_ingestion(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "ingestion_run", "Data ingestion pipeline executed", str(job["job_id"]))
    return DataEmpireMutationResponse(ok=True, message="Ingestion complete", data=job)


@router.post("/run-learning", response_model=DataEmpireMutationResponse)
def post_data_empire_learning(payload: DataEmpireMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireMutationResponse:
    _require_access(identity, tenant)
    job = data_empire_store.run_learning(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "learning_run", "Knowledge compounding cycle executed", str(job["learning_job_id"]))
    return DataEmpireMutationResponse(ok=True, message="Learning cycle complete", data=job)


@router.post("/run-forecast", response_model=DataEmpireMutationResponse)
def post_data_empire_forecast(payload: DataEmpireMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireMutationResponse:
    _require_access(identity, tenant)
    job = data_empire_store.run_forecast(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "forecast_run", "Forecast superintelligence executed", str(job["forecast_job_id"]))
    return DataEmpireMutationResponse(ok=True, message="Forecast complete", data=job)


@router.post("/launch-data-product", response_model=DataEmpireMutationResponse)
def post_data_empire_launch_product(payload: DataEmpireMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireMutationResponse:
    _require_access(identity, tenant)
    product = data_empire_store.launch_product(_tenant_id(tenant), payload.product_id)
    _clear(identity)
    _log(request, identity, tenant, "data_product_launched", f"Data product launched: {product['name']}", str(product["product_id"]))
    return DataEmpireMutationResponse(ok=True, message="Data product launched", data={"product": product})


@router.post("/run-anomaly-scan", response_model=DataEmpireMutationResponse)
def post_data_empire_anomaly_scan(payload: DataEmpireMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataEmpireMutationResponse:
    _require_access(identity, tenant)
    job = data_empire_store.run_anomaly_scan(_tenant_id(tenant))
    _clear(identity)
    _log(request, identity, tenant, "anomaly_scan_run", "Data anomaly scan executed", str(job["scan_id"]))
    return DataEmpireMutationResponse(ok=True, message="Anomaly scan complete", data=job)
