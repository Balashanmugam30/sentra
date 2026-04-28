from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.datahub.schemas import DataHubMutationRequest, DataHubMutationResponse, DataHubResponse
from app.datahub.service import datahub_service
from app.datahub.store import datahub_store
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/data", tags=["Data Platform and Intelligence Moat"])


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 12):
    return cached_call(identity_tenant_cache_key(identity, f"datahub:{name}"), ttl, builder)


@router.get("/summary", response_model=DataHubResponse)
def get_data_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataHubResponse:
    return DataHubResponse(data=_cache(identity, "summary", lambda: datahub_service.summary(_scope(identity, tenant))))


@router.get("/pipelines", response_model=DataHubResponse)
def get_data_pipelines(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataHubResponse:
    return DataHubResponse(data=_cache(identity, "pipelines", lambda: datahub_service.pipelines(_scope(identity, tenant))))


@router.get("/graph", response_model=DataHubResponse)
def get_data_graph(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataHubResponse:
    return DataHubResponse(data=_cache(identity, "graph", lambda: datahub_service.graph(_scope(identity, tenant))))


@router.post("/run", response_model=DataHubMutationResponse)
def post_data_run(payload: DataHubMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DataHubMutationResponse:
    result = datahub_store.run_pipeline(str(tenant["tenant_id"]), payload.pipeline_id or "PIPE-INCIDENTS")
    clear_runtime_cache(identity_tenant_cache_key(identity, "datahub:"))
    append_audit_event(category="datahub", action="pipeline_run", severity="medium", target_module="datahub", status="success", reason=payload.reason or "Data pipeline run", request=request, identity=identity, tenant_id=str(tenant["tenant_id"]), risk_score=30)
    return DataHubMutationResponse(ok=True, message="Data pipeline completed", data=result)

