from __future__ import annotations

from app.ecosystem.models import ecosystem_id, utc_now_iso


def create_api_key(tenant_id: str, label: str | None = None) -> dict[str, object]:
    key_id = ecosystem_id("EKEY")
    return {
        "key_id": key_id,
        "tenant_id": tenant_id,
        "label": label or "Platform expansion key",
        "masked_key": f"sentra_live_{key_id[-6:].lower()}...",
        "scopes": ["incidents:read", "ai:read", "webhooks:write", "marketplace:install"],
        "rate_limit": 120_000,
        "created_at": utc_now_iso(),
        "last_used": None,
    }


def white_label_sdk(tenant_id: str) -> dict[str, object]:
    return {
        "tenant_id": tenant_id,
        "branding_kits": 18,
        "embedded_widgets": 42,
        "tenant_oem_mode": True,
        "sdk_access": ["typescript", "python", "go", "embedded-js"],
        "private_deployment_kits": 9,
        "partner_revenue_share_percent": 18,
    }
