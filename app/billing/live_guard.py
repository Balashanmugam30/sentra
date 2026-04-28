"""Stripe live-readiness guardrails."""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.runtime_mode import is_production_like


def stripe_mode() -> str:
    if settings.stripe_secret_key.startswith("sk_live_"):
        return "live"
    if settings.stripe_secret_key.startswith("sk_test_"):
        return "test"
    return "demo"


def stripe_live_readiness() -> dict[str, Any]:
    mode = stripe_mode()
    webhook_ready = bool(settings.stripe_webhook_secret)
    live_required = is_production_like()
    status = "ready"
    if live_required and mode != "live":
        status = "blocked"
    elif mode == "demo" or not webhook_ready:
        status = "watch"
    return {
        "status": status,
        "stripe_mode": mode,
        "webhook_signature_configured": webhook_ready,
        "tax_config": "placeholder_ready",
        "retry_policy": "webhook replay queue ready",
        "live_required": live_required,
    }

