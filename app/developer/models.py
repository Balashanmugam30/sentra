from __future__ import annotations

import secrets
from datetime import datetime, timezone
from uuid import uuid4


WEBHOOK_EVENTS: tuple[str, ...] = (
    "incident.created",
    "incident.updated",
    "incident.resolved",
    "alert.critical",
    "tenant.created",
    "billing.payment_failed",
    "billing.subscription_updated",
    "crm.deal_won",
    "crm.deal_lost",
    "success.churn_risk_high",
    "ai.recommendation_created",
)

WIDGET_TYPES: tuple[str, ...] = (
    "live_incident",
    "executive_kpi",
    "security_health",
    "readiness_meter",
    "revenue_pulse",
    "churn_risk",
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def key_id() -> str:
    return f"KEY-{uuid4().hex[:8].upper()}"


def webhook_id() -> str:
    return f"WH-{uuid4().hex[:8].upper()}"


def client_id() -> str:
    return f"app_{uuid4().hex[:14]}"


def widget_id() -> str:
    return f"WID-{uuid4().hex[:8].upper()}"


def public_token() -> str:
    return f"emb_{secrets.token_urlsafe(24)}"


def mask_secret(value: str) -> str:
    if len(value) <= 8:
        return "********"
    return f"{value[:4]}******{value[-4:]}"
