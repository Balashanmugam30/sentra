from __future__ import annotations

import os


def _env_enabled(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def get_provider_statuses(webhook_configured: bool) -> list[dict[str, str]]:
    providers = [
        ("whatsapp", "WHATSAPP_ENABLED"),
        ("email", "EMAIL_ENABLED"),
        ("slack", "SLACK_ENABLED"),
        ("teams", "TEAMS_ENABLED"),
        ("sms", ""),
        ("voice", ""),
    ]

    items: list[dict[str, str]] = []
    for name, env_name in providers:
        if name in {"sms", "voice"}:
            status = "mock"
        elif env_name and (_env_enabled(env_name) or webhook_configured):
            status = "ready"
        else:
            status = "standby"

        items.append({"name": name, "status": status})

    return items

