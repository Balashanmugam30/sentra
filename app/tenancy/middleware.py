from __future__ import annotations

from app.auth.security import decode_token
from app.auth.store import auth_store
from app.tenancy.provisioning import tenancy_store


async def tenant_context_middleware(request, call_next):
    token = None
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        settings = getattr(request.app.state, "settings", None)
        if settings is not None:
            token = request.cookies.get(settings.auth_access_cookie_name)

    request.state.tenant_id = None
    request.state.organization_name = None
    if token:
        try:
            payload = decode_token(token, expected_type="access")
            user = auth_store.get_user_by_id(str(payload["sub"]))
            if user is not None and user.get("is_active"):
                tenant = tenancy_store.resolve_context(user)
                request.state.tenant_id = tenant["tenant_id"]
                request.state.organization_name = tenant["organization_name"]
        except Exception:
            pass

    response = await call_next(request)
    if request.state.tenant_id:
        response.headers["X-Sentra-Tenant"] = str(request.state.tenant_id)
    return response
