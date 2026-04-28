from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.developers.schemas import DeveloperKeyRequest, DeveloperMutationResponse, DevelopersResponse
from app.developers.service import developers_service
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/developers", tags=["Public API Platform"])


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


@router.get("/summary", response_model=DevelopersResponse)
def get_developers_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DevelopersResponse:
    return DevelopersResponse(data=cached_call(identity_tenant_cache_key(identity, "developers:summary"), 10, lambda: developers_service.summary(_scope(identity, tenant))))


@router.post("/key/create", response_model=DeveloperMutationResponse)
def post_developer_key_create(payload: DeveloperKeyRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DeveloperMutationResponse:
    result = developers_service.create_key(_scope(identity, tenant), {"name": payload.name or "Production API key", "scopes": payload.scopes or ["incidents:read", "alerts:write"], "actor": identity.get("email")})
    clear_runtime_cache(identity_tenant_cache_key(identity, "developers:"))
    append_audit_event(category="developers", action="api_key_created", severity="medium", target_module="developers", status="success", reason=payload.reason or "Developer API key created", request=request, identity=identity, tenant_id=str(tenant["tenant_id"]), risk_score=40)
    return DeveloperMutationResponse(ok=True, message="Developer API key created", data=result)

