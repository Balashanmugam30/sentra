from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def canonical_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


@dataclass(frozen=True)
class AuditRecord:
    event_id: str
    timestamp_utc: str
    category: str
    action: str
    severity: str
    actor_user_id: str | None
    actor_email: str | None
    actor_role: str | None
    source_ip: str | None
    user_agent: str | None
    target_module: str
    target_id: str | None
    status: str
    reason: str | None
    before_state: dict[str, Any] | None
    after_state: dict[str, Any] | None
    risk_score: int
    correlation_id: str
    session_id: str | None
    previous_hash: str
    record_hash: str
    tenant_id: str | None = None
    is_demo: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def compute_hash(
        cls,
        *,
        payload: dict[str, Any],
        previous_hash: str,
    ) -> str:
        base_payload = {**payload, "previous_hash": previous_hash}
        digest = hashlib.sha256(canonical_json(base_payload).encode("utf-8")).hexdigest()
        return digest

    @classmethod
    def from_payload(
        cls,
        *,
        payload: dict[str, Any],
        previous_hash: str,
    ) -> "AuditRecord":
        record_hash = cls.compute_hash(payload=payload, previous_hash=previous_hash)
        return cls(
            **payload,
            previous_hash=previous_hash,
            record_hash=record_hash,
        )
