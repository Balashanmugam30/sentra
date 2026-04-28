from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class FirebaseResponse(BaseModel):
    generated_at: str = Field(default_factory=_now)
    data: dict[str, Any]


class FirebaseUserRoleRequest(BaseModel):
    uid: str = Field(..., min_length=3)
    role: str = Field(..., min_length=3)


class FirebaseDisableUserRequest(BaseModel):
    uid: str = Field(..., min_length=3)
    disabled: bool = True


class FirebaseMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str = Field(default_factory=_now)
    data: dict[str, Any]
