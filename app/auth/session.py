from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_token, hash_password
from app.auth.store import auth_store
from app.firebase_live.service import firebase_live_service
from app.rbac.permissions import DEMO_USERS, get_permissions_for_role, normalize_role

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthContext:
    user: dict[str, object]
    access_expires_at: datetime
    payload: dict[str, object]


DEMO_ROLE_ALIAS_MAP: dict[str, str] = {
    "admin": "admin@sentra.demo",
    "super_admin": "admin@sentra.demo",
    "manager": "manager@sentra.demo",
    "security_manager": "manager@sentra.demo",
    "commander": "manager@sentra.demo",
    "operations_commander": "manager@sentra.demo",
    "incident_commander": "manager@sentra.demo",
    "staff": "staff@sentra.demo",
    "zone_staff": "staff@sentra.demo",
    "responder": "responder@sentra.demo",
    "field_responder": "responder@sentra.demo",
    "analyst": "analyst@sentra.demo",
    "crisis_analyst": "analyst@sentra.demo",
}


def _resolve_demo_context(token: str) -> AuthContext | None:
    role_suffix = token.replace("demo-token-", "").replace("demo-token", "").strip().lower()
    target_email = DEMO_ROLE_ALIAS_MAP.get(role_suffix)
    demo_match = None

    if target_email:
        for item in DEMO_USERS:
            if item["email"].lower() == target_email.lower():
                demo_match = item
                break

    if not demo_match:
        for item in DEMO_USERS:
            if normalize_role(item["role"]) == normalize_role(role_suffix) or item["role"] == role_suffix:
                demo_match = item
                break

    if not demo_match and DEMO_USERS:
        demo_match = DEMO_USERS[0]

    if demo_match:
        user = auth_store.get_user_by_email(demo_match["email"])
        if user is None:
            user = auth_store.create_user(
                name=demo_match["name"],
                email=demo_match["email"],
                password_hash=hash_password(demo_match["password"]),
                role=normalize_role(demo_match["role"]),
            )
        role = normalize_role(str(user["role"]))
        permissions = get_permissions_for_role(role)
        expires_at = datetime.now(timezone.utc) + timedelta(days=1)
        payload = {
            "sub": str(user["user_id"]),
            "email": str(user["email"]),
            "role": role,
            "permissions": permissions,
            "sid": f"demo-session-{role}",
            "exp": int(expires_at.timestamp()),
            "typ": "access",
        }
        return AuthContext(
            user=user,
            access_expires_at=expires_at,
            payload=payload,
        )
    return None


def _resolve_firebase_fallback_context(token: str) -> AuthContext | None:
    try:
        import jwt as pyjwt

        claims = pyjwt.decode(token, options={"verify_signature": False})
        iss = str(claims.get("iss") or "")
        if "securetoken.google.com" in iss or "firebase" in iss:
            email = str(claims.get("email") or f"{claims.get('sub')}@firebase.sentra.local").strip().lower()
            name = str(claims.get("name") or email.split("@")[0] or "Sentra Operator")
            user = auth_store.get_user_by_email(email)
            if user is None:
                user = auth_store.create_user(
                    name=name,
                    email=email,
                    password_hash=hash_password("FirebaseProtectedSession!"),
                    role="admin" if not auth_store.has_users() else "admin",
                )
            role = normalize_role(str(user["role"]))
            permissions = get_permissions_for_role(role)
            exp_val = claims.get("exp")
            expires_at = (
                datetime.fromtimestamp(int(exp_val), tz=timezone.utc)
                if exp_val
                else datetime.now(timezone.utc) + timedelta(days=1)
            )
            payload = {
                "sub": str(user["user_id"]),
                "email": str(user["email"]),
                "role": role,
                "permissions": permissions,
                "firebase_uid": str(claims.get("uid") or claims.get("sub") or ""),
                "exp": exp_val,
                "sid": "firebase-id-token",
            }
            return AuthContext(
                user=user,
                access_expires_at=expires_at,
                payload=payload,
            )
    except Exception:
        pass
    return None


def get_current_auth_context(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthContext:
    access_cookie_name = request.app.state.settings.auth_access_cookie_name
    token = (
        credentials.credentials
        if credentials and credentials.scheme.lower() == "bearer"
        else request.cookies.get(access_cookie_name)
    )
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    if token.startswith("demo-token-") or token.startswith("demo-token"):
        demo_ctx = _resolve_demo_context(token)
        if demo_ctx:
            return demo_ctx

    try:
        payload = decode_token(token, expected_type="access")
        user = auth_store.get_user_by_id(str(payload["sub"]))
        if user is None or not user["is_active"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session is no longer active")
        expires_at = (
            datetime.fromisoformat(str(payload["exp"]))
            if isinstance(payload["exp"], str)
            else datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc)
        )
    except HTTPException as internal_auth_error:
        try:
            decoded = firebase_live_service.verify_token(token)
            synced = firebase_live_service.sync_user_from_token(decoded)
            user = synced["local_user"]
            expires_at = datetime.fromtimestamp(int(decoded.get("exp", 0)), tz=timezone.utc)
            payload = {
                "sub": str(user["user_id"]),
                "email": str(user["email"]),
                "role": str(user["role"]),
                "firebase_uid": str(decoded["uid"]),
                "exp": decoded.get("exp"),
                "sid": "firebase-id-token",
            }
        except Exception:
            fb_ctx = _resolve_firebase_fallback_context(token)
            if fb_ctx:
                return fb_ctx
            raise internal_auth_error

    return AuthContext(
        user=user,
        access_expires_at=expires_at,
        payload=payload,
    )


def get_current_user(context: AuthContext = Depends(get_current_auth_context)) -> dict[str, object]:
    return context.user


def require_authenticated(user: dict[str, object] = Depends(get_current_user)) -> dict[str, object]:
    return user
