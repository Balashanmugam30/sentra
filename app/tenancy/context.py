from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status

from app.auth.session import AuthContext, get_current_auth_context
from app.tenancy.provisioning import tenancy_store


def get_tenant_context(context: AuthContext = Depends(get_current_auth_context)) -> dict[str, Any]:
    tenant = tenancy_store.resolve_context(context.user)
    if not tenant.get("tenant_id"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant context unavailable")
    return tenant


def tenant_cache_key(tenant_id: str, key: str) -> str:
    return f"tenant:{tenant_id}:{key}"


def identity_tenant_cache_key(identity: dict[str, object], key: str) -> str:
    tenant_id = str(identity.get("tenant_id") or "public")
    return tenant_cache_key(tenant_id, key)


def tenant_identity_payload(user: dict[str, Any]) -> dict[str, Any]:
    tenant = tenancy_store.resolve_context(user)
    return {
        "tenant_id": tenant["tenant_id"],
        "organization_name": tenant["organization_name"],
        "organization_slug": tenant["organization_slug"],
        "org_role": tenant["org_role"],
        "plan": tenant["plan"]["plan_name"],
    }
