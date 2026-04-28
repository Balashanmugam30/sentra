from __future__ import annotations

import os

from app.offline.engine import get_offline_mode


CONNECTOR_NAMES = [
    "access_control",
    "hvac_bms",
    "pa_system",
    "cctv_metadata",
    "elevator_controller",
    "fire_panel",
    "lighting_controller",
    "campus_dispatch",
]


def connector_mode(name: str) -> str:
    mode = get_offline_mode()
    if mode in {"offline_local", "recovery_sync"}:
        return "offline_fallback"
    env_key = f"FACILITY_{name.upper()}_ENABLED"
    if os.getenv(env_key, "").strip().lower() in {"1", "true", "yes", "on"}:
        return "real"
    return "mock"


def connector_status(name: str) -> str:
    mode = get_offline_mode()
    connector = connector_mode(name)
    if mode == "offline_local":
        return "degraded"
    if mode == "degraded" and name in {"access_control", "hvac_bms", "pa_system"}:
        return "degraded"
    if connector == "real":
        return "ready"
    if connector == "offline_fallback":
        return "degraded"
    return "standby"


def build_connector_snapshot() -> list[dict[str, str]]:
    return [
        {
            "name": name,
            "status": connector_status(name),
            "mode": connector_mode(name),
        }
        for name in CONNECTOR_NAMES
    ]

