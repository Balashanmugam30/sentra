"""Sensitive-action re-authentication readiness helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status

from app.rbac.permissions import role_matches


def require_recent_admin_reauth(identity: dict[str, object], max_age_minutes: int = 15) -> None:
    if not role_matches(str(identity.get("role") or ""), {"super_admin", "admin"}) and str(
        identity.get("org_role") or ""
    ) not in {"owner", "org_admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privilege required")
    reauth_at = identity.get("reauth_at")
    if not reauth_at:
        raise HTTPException(status_code=status.HTTP_428_PRECONDITION_REQUIRED, detail="Recent admin re-authentication required")
    try:
        parsed = datetime.fromisoformat(str(reauth_at))
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_428_PRECONDITION_REQUIRED, detail="Invalid re-authentication evidence") from error
    if parsed < datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes):
        raise HTTPException(status_code=status.HTTP_428_PRECONDITION_REQUIRED, detail="Admin re-authentication expired")


def admin_reauth_policy() -> dict[str, Any]:
    return {
        "enabled": True,
        "max_age_minutes": 15,
        "sensitive_actions": [
            "tenant_suspend",
            "cache_flush",
            "webhook_replay",
            "billing_repair",
            "impersonation_start",
            "emergency_read_only_mode",
        ],
    }
