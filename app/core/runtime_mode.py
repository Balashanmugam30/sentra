"""Runtime mode helpers for production launch readiness."""

from __future__ import annotations

import os
from typing import Literal

from app.core.config import settings

RuntimeMode = Literal["development", "staging", "production", "enterprise"]


def current_runtime_mode() -> RuntimeMode:
    raw = (os.getenv("APP_ENV") or os.getenv("SENTRA_APP_ENV") or settings.app_env).strip().lower()
    if raw in {"prod", "production"}:
        return "production"
    if raw in {"stage", "staging"}:
        return "staging"
    if raw in {"enterprise", "government"}:
        return "enterprise"
    return "development"


def is_production_like() -> bool:
    return current_runtime_mode() in {"production", "enterprise"}


def should_seed_demo_data() -> bool:
    return settings.enable_demo_seed and not is_production_like()


def runtime_profile() -> dict[str, object]:
    mode = current_runtime_mode()
    return {
        "mode": mode,
        "production_like": is_production_like(),
        "demo_seed_enabled": should_seed_demo_data(),
        "secure_cookies_required": mode in {"production", "enterprise"},
        "strict_cors_required": mode in {"production", "enterprise", "staging"},
        "debug_routes_allowed": mode == "development",
    }

