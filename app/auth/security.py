from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

import bcrypt
import jwt
from fastapi import HTTPException, status

from app.core.config import settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(
    *,
    user_id: str,
    email: str,
    role: str,
    permissions: list[str] | None = None,
    session_id: str | None = None,
    tenant_id: str | None = None,
    organization_name: str | None = None,
    organization_slug: str | None = None,
    org_role: str | None = None,
    plan: str | None = None,
) -> tuple[str, datetime]:
    expires_at = utc_now() + timedelta(minutes=settings.auth_access_token_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "permissions": permissions or [],
        "sid": session_id,
        "tenant_id": tenant_id,
        "organization_name": organization_name,
        "organization_slug": organization_slug,
        "org_role": org_role,
        "plan": plan,
        "typ": "access",
        "exp": expires_at,
        "iat": utc_now(),
    }
    token = jwt.encode(payload, settings.auth_jwt_secret, algorithm=settings.auth_jwt_algorithm)
    return token, expires_at


def create_refresh_token(*, user_id: str) -> tuple[str, str, datetime]:
    expires_at = utc_now() + timedelta(days=settings.auth_refresh_token_days)
    session_id = f"SES-{uuid4().hex}"
    payload = {
        "sub": user_id,
        "sid": session_id,
        "typ": "refresh",
        "exp": expires_at,
        "iat": utc_now(),
    }
    token = jwt.encode(payload, settings.auth_jwt_secret, algorithm=settings.auth_jwt_algorithm)
    return token, session_id, expires_at


def decode_token(token: str, *, expected_type: str) -> dict[str, Any]:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
    )
    try:
        payload = jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=[settings.auth_jwt_algorithm],
        )
    except jwt.PyJWTError as error:
        raise credentials_error from error

    if payload.get("typ") != expected_type:
        raise credentials_error
    return payload
