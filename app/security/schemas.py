from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.ml.store import utc_now_iso


class SecurityCenterResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]


class SecurityCenterListResponse(BaseModel):
    generated_at: str = Field(default_factory=utc_now_iso)
    items: list[dict[str, Any]]


class SecurityCenterMutationRequest(BaseModel):
    user_id: str | None = None
    org_id: str | None = None
    session_id: str | None = None
    name: str | None = None
    email: str | None = None
    role: str | None = None
    reason: str | None = None
    payload: dict[str, Any] | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("valid email address required")
        return normalized


class SecurityCenterMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=utc_now_iso)
    data: dict[str, Any]
