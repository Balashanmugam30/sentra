from __future__ import annotations

from datetime import datetime
from time import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.audit.engine import append_audit_event
from app.auth.schemas import (
    AuthResponse,
    AuthUser,
    BootstrapAdminRequest,
    BootstrapAdminResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    CurrentUserResponse,
    FirebaseLoginRequest,
    LoginRequest,
    LogoutResponse,
    RefreshRequest,
    RevokeSessionRequest,
    RevokeSessionResponse,
    SessionDeviceResponse,
    SessionsResponse,
)
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    utc_now,
    verify_password,
)
from app.auth.session import AuthContext, get_current_auth_context, get_current_user
from app.auth.store import auth_store
from app.core.config import settings
from app.firebase_live.service import firebase_live_service
from app.rbac.permissions import (
    get_accessible_modules_for_permissions,
    get_permissions_for_role,
    normalize_role,
)
from app.tenancy.context import tenant_identity_payload
from app.tenancy.provisioning import tenancy_store

router = APIRouter(prefix="/auth", tags=["Authentication"])

_login_failures: dict[str, list[float]] = {}
_login_lockouts: dict[str, float] = {}


def _login_key(request: Request, email: str) -> str:
    source_ip = request.client.host if request.client else "unknown"
    return f"{source_ip}:{email.strip().lower()}"


def _enforce_login_rate_limit(request: Request, email: str) -> None:
    key = _login_key(request, email)
    now = time()
    locked_until = _login_lockouts.get(key, 0)
    if locked_until > now:
        remaining = round(locked_until - now)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Try again in {remaining} seconds.",
        )

    window_started = now - settings.auth_rate_limit_window_seconds
    _login_failures[key] = [stamp for stamp in _login_failures.get(key, []) if stamp >= window_started]
    if len(_login_failures[key]) >= settings.auth_rate_limit_max_attempts:
        _login_lockouts[key] = now + settings.auth_lockout_seconds
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Account sign-in is temporarily rate limited.",
        )


def _record_failed_login(request: Request, email: str) -> None:
    key = _login_key(request, email)
    _login_failures.setdefault(key, []).append(time())


def _clear_login_failures(request: Request, email: str) -> None:
    key = _login_key(request, email)
    _login_failures.pop(key, None)
    _login_lockouts.pop(key, None)


def _to_auth_user(user: dict[str, object]) -> AuthUser:
    role = normalize_role(str(user["role"]))
    permissions = get_permissions_for_role(role)
    tenant = tenant_identity_payload(user)
    return AuthUser(
        id=str(user["user_id"]),
        name=str(user["name"]),
        email=str(user["email"]),
        role=role,
        tenant_id=str(tenant["tenant_id"]),
        organization_name=str(tenant["organization_name"]),
        organization_slug=str(tenant["organization_slug"]),
        org_role=str(tenant["org_role"]),
        plan=str(tenant["plan"]),
        permissions=permissions,
        accessible_modules=get_accessible_modules_for_permissions(permissions),
        is_active=bool(user["is_active"]),
        mfa_enabled=bool(user["mfa_enabled"]),
        created_at=datetime.fromisoformat(str(user["created_at"])),
        last_login=(datetime.fromisoformat(str(user["last_login"])) if user.get("last_login") else None),
    )


def _set_auth_cookies(response: Response, *, access_token: str, refresh_token: str) -> None:
    cookie_common = {
        "httponly": True,
        "secure": settings.auth_cookie_secure,
        "samesite": "lax",
        "path": "/",
    }
    if settings.auth_cookie_domain:
        cookie_common["domain"] = settings.auth_cookie_domain

    response.set_cookie(
        settings.auth_access_cookie_name,
        access_token,
        max_age=settings.auth_access_token_minutes * 60,
        **cookie_common,
    )
    response.set_cookie(
        settings.auth_refresh_cookie_name,
        refresh_token,
        max_age=settings.auth_refresh_token_days * 24 * 60 * 60,
        **cookie_common,
    )


def _clear_auth_cookies(response: Response) -> None:
    delete_common = {"path": "/"}
    if settings.auth_cookie_domain:
        delete_common["domain"] = settings.auth_cookie_domain
    response.delete_cookie(settings.auth_access_cookie_name, **delete_common)
    response.delete_cookie(settings.auth_refresh_cookie_name, **delete_common)


def _issue_session(user: dict[str, object], response: Response) -> AuthResponse:
    role = normalize_role(str(user["role"]))
    permissions = get_permissions_for_role(role)
    tenancy_store.ensure_user_membership(user)
    tenant = tenant_identity_payload(user)
    refresh_token, session_id, refresh_expires_at = create_refresh_token(user_id=str(user["user_id"]))
    access_token, _ = create_access_token(
        user_id=str(user["user_id"]),
        email=str(user["email"]),
        role=role,
        permissions=permissions,
        session_id=session_id,
        tenant_id=str(tenant["tenant_id"]),
        organization_name=str(tenant["organization_name"]),
        organization_slug=str(tenant["organization_slug"]),
        org_role=str(tenant["org_role"]),
        plan=str(tenant["plan"]),
    )
    auth_store.store_refresh_session(
        session_id=session_id,
        user_id=str(user["user_id"]),
        issued_at=utc_now(),
        expires_at=refresh_expires_at,
    )
    _set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)
    return AuthResponse(
        authenticated=True,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.auth_access_token_minutes * 60,
        user=_to_auth_user(user),
    )


@router.post("/bootstrap-admin", response_model=BootstrapAdminResponse)
def bootstrap_admin(request: Request, payload: BootstrapAdminRequest) -> BootstrapAdminResponse:
    if auth_store.has_users():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin bootstrap already completed")
    user = auth_store.create_user(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="super_admin",
    )
    append_audit_event(
        category="auth",
        action="bootstrap_admin",
        severity="high",
        target_module="auth",
        status="success",
        reason="Initial administrator account bootstrapped",
        request=request,
        actor_user_id=str(user["user_id"]),
        actor_email=str(user["email"]),
        actor_role="super_admin",
        risk_score=72,
        target_id=str(user["user_id"]),
    )
    return BootstrapAdminResponse(created=True, user=_to_auth_user(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, request: Request, response: Response) -> AuthResponse:
    _enforce_login_rate_limit(request, payload.email)
    user = auth_store.get_user_by_email(payload.email)
    if user is None or not verify_password(payload.password, str(user["password_hash"])):
        _record_failed_login(request, payload.email)
        append_audit_event(
            category="auth",
            action="login_failed",
            severity="medium",
            target_module="auth",
            status="error",
            reason="Invalid email or password",
            request=request,
            actor_email=payload.email.strip().lower(),
            risk_score=58,
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    updated_user = auth_store.update_user(str(user["user_id"]), last_login=utc_now()) or user
    _clear_login_failures(request, payload.email)
    auth_response = _issue_session(updated_user, response)
    append_audit_event(
        category="auth",
        action="login_success",
        severity="low",
        target_module="auth",
        status="success",
        reason="Authenticated session created",
        request=request,
        actor_user_id=str(updated_user["user_id"]),
        actor_email=str(updated_user["email"]),
        actor_role=normalize_role(str(updated_user["role"])),
        session_id=decode_token(auth_response.access_token, expected_type="access").get("sid"),
        risk_score=18,
    )
    return auth_response


@router.post("/firebase", response_model=AuthResponse)
def firebase_login(payload: FirebaseLoginRequest, request: Request, response: Response) -> AuthResponse:
    decoded = firebase_live_service.verify_token(payload.id_token)
    synced = firebase_live_service.sync_user_from_token(decoded)
    user = synced["local_user"]
    auth_response = _issue_session(user, response)
    append_audit_event(
        category="auth",
        action="firebase_login_success",
        severity="low",
        target_module="auth",
        status="success",
        reason="Firebase ID token verified and Sentra session issued",
        request=request,
        actor_user_id=str(user["user_id"]),
        actor_email=str(user["email"]),
        actor_role=normalize_role(str(user["role"])),
        session_id=decode_token(auth_response.access_token, expected_type="access").get("sid"),
        after_state={"firebase_uid": decoded.get("uid"), "provider": synced["profile"].get("provider")},
        risk_score=18,
    )
    return auth_response


@router.post("/logout", response_model=LogoutResponse)
def logout(request: Request, response: Response, payload: RefreshRequest | None = None) -> LogoutResponse:
    refresh_token = None
    if payload is not None:
        refresh_token = payload.refresh_token
    if not refresh_token:
        refresh_token = request.cookies.get(settings.auth_refresh_cookie_name)
    if refresh_token:
        try:
            refresh_payload = decode_token(refresh_token, expected_type="refresh")
            auth_store.revoke_refresh_session(str(refresh_payload["sid"]))
            user = auth_store.get_user_by_id(str(refresh_payload["sub"]))
            if user is not None:
                append_audit_event(
                    category="auth",
                    action="logout",
                    severity="low",
                    target_module="auth",
                    status="success",
                    reason="Session revoked",
                    request=request,
                    actor_user_id=str(user["user_id"]),
                    actor_email=str(user["email"]),
                    actor_role=normalize_role(str(user["role"])),
                    session_id=str(refresh_payload["sid"]),
                    risk_score=12,
                )
        except HTTPException:
            pass

    _clear_auth_cookies(response)
    return LogoutResponse(completed=True)


@router.post("/refresh", response_model=AuthResponse)
def refresh_session(
    request: Request,
    response: Response,
    payload: RefreshRequest | None = None,
) -> AuthResponse:
    refresh_token = payload.refresh_token if payload else None
    if not refresh_token:
        refresh_token = request.cookies.get(settings.auth_refresh_cookie_name)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    refresh_payload = decode_token(refresh_token, expected_type="refresh")
    session = auth_store.get_refresh_session(str(refresh_payload["sid"]))
    if session is None or session["revoked"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh session revoked")
    user = auth_store.get_user_by_id(str(refresh_payload["sub"]))
    if user is None or not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session unavailable")

    auth_store.revoke_refresh_session(str(refresh_payload["sid"]))
    auth_response = _issue_session(user, response)
    append_audit_event(
        category="auth",
        action="refresh_token",
        severity="low",
        target_module="auth",
        status="success",
        reason="Access token refreshed",
        request=request,
        actor_user_id=str(user["user_id"]),
        actor_email=str(user["email"]),
        actor_role=normalize_role(str(user["role"])),
        session_id=decode_token(auth_response.access_token, expected_type="access").get("sid"),
        risk_score=14,
    )
    return auth_response


@router.get("/me", response_model=CurrentUserResponse)
def get_me(context: AuthContext = Depends(get_current_auth_context)) -> CurrentUserResponse:
    user = context.user
    refresh_cookie_expires = context.access_expires_at
    role = normalize_role(str(user["role"]))
    permissions = get_permissions_for_role(role)
    tenant = tenant_identity_payload(user)
    return CurrentUserResponse(
        id=str(user["user_id"]),
        name=str(user["name"]),
        email=str(user["email"]),
        role=role,
        tenant_id=str(tenant["tenant_id"]),
        organization_name=str(tenant["organization_name"]),
        organization_slug=str(tenant["organization_slug"]),
        org_role=str(tenant["org_role"]),
        plan=str(tenant["plan"]),
        permissions=permissions,
        accessible_modules=get_accessible_modules_for_permissions(permissions),
        last_login=(datetime.fromisoformat(str(user["last_login"])) if user.get("last_login") else None),
        session_expires_at=refresh_cookie_expires,
    )


def _session_device_from_record(record: dict[str, object], current_session_id: str | None) -> SessionDeviceResponse:
    issued_at = datetime.fromisoformat(str(record["issued_at"]))
    expires_at = datetime.fromisoformat(str(record["expires_at"]))
    return SessionDeviceResponse(
        session_id=str(record["session_id"]),
        issued_at=issued_at,
        expires_at=expires_at,
        revoked=bool(record.get("revoked")),
        current=str(record["session_id"]) == current_session_id,
        device_label="Current secure browser" if str(record["session_id"]) == current_session_id else "Remembered browser",
        last_active=issued_at,
    )


@router.get("/sessions", response_model=SessionsResponse)
def list_sessions(context: AuthContext = Depends(get_current_auth_context)) -> SessionsResponse:
    user_id = str(context.user["user_id"])
    current_session_id = str(context.payload.get("sid") or "") or None
    sessions = [
        _session_device_from_record(record, current_session_id)
        for record in auth_store.list_user_sessions(user_id)
    ]
    return SessionsResponse(sessions=sorted(sessions, key=lambda item: item.issued_at, reverse=True))


@router.post("/revoke-session", response_model=RevokeSessionResponse)
def revoke_session(
    payload: RevokeSessionRequest,
    request: Request,
    context: AuthContext = Depends(get_current_auth_context),
) -> RevokeSessionResponse:
    user_id = str(context.user["user_id"])
    session = auth_store.get_refresh_session(payload.session_id)
    if session is None or str(session["user_id"]) != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    revoked = auth_store.revoke_refresh_session(payload.session_id)
    append_audit_event(
        category="auth",
        action="session_revoked",
        severity="medium",
        target_module="auth",
        status="success",
        reason="Device session revoked by user",
        request=request,
        actor_user_id=user_id,
        actor_email=str(context.user["email"]),
        actor_role=normalize_role(str(context.user["role"])),
        session_id=payload.session_id,
        risk_score=34,
    )
    return RevokeSessionResponse(revoked=revoked is not None, revoked_count=1 if revoked else 0)


@router.post("/logout-all", response_model=RevokeSessionResponse)
def logout_all_devices(
    request: Request,
    context: AuthContext = Depends(get_current_auth_context),
) -> RevokeSessionResponse:
    user_id = str(context.user["user_id"])
    revoked_count = auth_store.revoke_all_user_sessions(user_id)
    append_audit_event(
        category="auth",
        action="logout_all_devices",
        severity="high",
        target_module="auth",
        status="success",
        reason="All device sessions revoked",
        request=request,
        actor_user_id=user_id,
        actor_email=str(context.user["email"]),
        actor_role=normalize_role(str(context.user["role"])),
        risk_score=54,
    )
    return RevokeSessionResponse(revoked=revoked_count > 0, revoked_count=revoked_count)


@router.post("/change-password", response_model=ChangePasswordResponse)
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: dict[str, object] = Depends(get_current_user),
) -> ChangePasswordResponse:
    if not verify_password(payload.current_password, str(current_user["password_hash"])):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")
    auth_store.update_user(
        str(current_user["user_id"]),
        password_hash=hash_password(payload.new_password),
    )
    auth_store.revoke_all_user_sessions(str(current_user["user_id"]))
    append_audit_event(
        category="auth",
        action="password_change",
        severity="medium",
        target_module="auth",
        status="success",
        reason="Password rotated and sessions revoked",
        request=request,
        actor_user_id=str(current_user["user_id"]),
        actor_email=str(current_user["email"]),
        actor_role=normalize_role(str(current_user["role"])),
        risk_score=48,
    )
    return ChangePasswordResponse(changed=True)
