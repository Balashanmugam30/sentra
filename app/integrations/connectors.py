from __future__ import annotations

import os

from app.communications.delivery_queue import DeliveryRecord

PROVIDER_NAMES = [
    "whatsapp",
    "email",
    "slack",
    "teams",
    "sms",
    "voice",
    "google_sheets",
    "facility_webhook",
]

_PROVIDER_ENV = {
    "whatsapp": "WHATSAPP_ENABLED",
    "email": "EMAIL_ENABLED",
    "slack": "SLACK_ENABLED",
    "teams": "TEAMS_ENABLED",
    "sms": "",
    "voice": "",
    "google_sheets": "",
    "facility_webhook": "",
}


def _env_enabled(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _provider_mode(provider: str, *, n8n_enabled: bool, webhook_configured: bool) -> str:
    provider_env = _PROVIDER_ENV.get(provider, "")
    if n8n_enabled and webhook_configured and (not provider_env or _env_enabled(provider_env) or provider in {"sms", "voice", "google_sheets", "facility_webhook"}):
        return "live"
    return "mock"


def _provider_status(
    *,
    mode: str,
    n8n_enabled: bool,
    webhook_configured: bool,
    pending_count: int,
    failed_count: int,
    success_rate: int,
) -> str:
    if mode == "live" and (failed_count >= 3 or success_rate < 60):
        return "offline"
    if failed_count > 0 or pending_count > 0:
        return "degraded"
    if mode == "live":
        return "ready"
    if n8n_enabled and not webhook_configured:
        return "offline"
    return "standby"


def build_provider_snapshots(
    *,
    records: list[DeliveryRecord],
    n8n_enabled: bool,
    webhook_configured: bool,
) -> list[dict[str, object]]:
    snapshots: list[dict[str, object]] = []

    for provider in PROVIDER_NAMES:
        provider_records = [record for record in records if record.provider == provider]
        sent_count = sum(1 for record in provider_records if record.status == "sent")
        pending_count = sum(1 for record in provider_records if record.status == "pending")
        failed_count = sum(1 for record in provider_records if record.status == "failed")
        total = max(1, sent_count + pending_count + failed_count)
        success_rate = round((sent_count / total) * 100)
        last_delivery = max(
            (record.updated_at for record in provider_records),
            default=None,
        )
        mode = _provider_mode(
            provider,
            n8n_enabled=n8n_enabled,
            webhook_configured=webhook_configured,
        )

        snapshots.append(
            {
                "name": provider,
                "status": _provider_status(
                    mode=mode,
                    n8n_enabled=n8n_enabled,
                    webhook_configured=webhook_configured,
                    pending_count=pending_count,
                    failed_count=failed_count,
                    success_rate=success_rate,
                ),
                "mode": mode,
                "success_rate": success_rate,
                "last_delivery_at": last_delivery.isoformat() if last_delivery else None,
                "pending_count": pending_count,
                "failed_count": failed_count,
            }
        )

    return snapshots
