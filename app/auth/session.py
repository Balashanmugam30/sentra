from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.security import decode_token
from app.auth.store import auth_store
from app.firebase_live.service import firebase_live_service

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthContext:
    user: dict[str, object]
    access_expires_at: datetime
    payload: dict[str, object]


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
