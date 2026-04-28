from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


ORG_ROLES: tuple[str, ...] = (
    "owner",
    "org_admin",
    "security_admin",
    "ops_admin",
    "billing_admin",
    "executive",
    "operator",
    "analyst",
    "viewer",
)

PLAN_CATALOG: dict[str, dict[str, Any]] = {
    "starter": {
        "plan_name": "Starter",
        "seats_limit": 10,
        "modules_enabled": ["dashboard", "incidents", "basic_reports"],
        "api_limit": 10_000,
        "storage_limit_gb": 25,
        "description": "Basic command center for small teams.",
    },
    "business": {
        "plan_name": "Business",
        "seats_limit": 50,
        "modules_enabled": ["dashboard", "soc", "ai", "reports", "field", "geo"],
        "api_limit": 100_000,
        "storage_limit_gb": 250,
        "description": "AI modules, reports, and operational workflows.",
    },
    "enterprise": {
        "plan_name": "Enterprise",
        "seats_limit": 10_000,
        "modules_enabled": ["full_command_center", "custom_branding", "sso_ready", "advanced_ai"],
        "api_limit": 1_000_000,
        "storage_limit_gb": 2_000,
        "description": "Unlimited command center with custom branding and SSO-ready posture.",
    },
    "government": {
        "plan_name": "Government",
        "seats_limit": 50_000,
        "modules_enabled": ["isolated_deployment", "audit_hardened", "premium_support", "full_command_center"],
        "api_limit": 5_000_000,
        "storage_limit_gb": 10_000,
        "description": "Isolated deployment mode with hardened audit and premium support.",
    },
}

DEMO_ORGANIZATIONS: tuple[dict[str, Any], ...] = (
    {
        "id": "TEN-BALA-UNI",
        "slug": "bala-university",
        "name": "Bala University",
        "industry": "university",
        "size": "12,000 students",
        "country": "India",
        "timezone": "Asia/Calcutta",
        "logo_url": "",
        "primary_color": "#67e8f9",
        "status": "active",
        "plan": "enterprise",
    },
    {
        "id": "TEN-BALA-MFG",
        "slug": "bala-manufacturing",
        "name": "Bala Manufacturing",
        "industry": "factory",
        "size": "4,500 staff",
        "country": "India",
        "timezone": "Asia/Calcutta",
        "logo_url": "",
        "primary_color": "#f59e0b",
        "status": "active",
        "plan": "business",
    },
    {
        "id": "TEN-BALA-HOSP",
        "slug": "bala-hospital-demo",
        "name": "Bala Hospital Demo",
        "industry": "hospital",
        "size": "900 beds",
        "country": "India",
        "timezone": "Asia/Calcutta",
        "logo_url": "",
        "primary_color": "#38bdf8",
        "status": "active",
        "plan": "government",
    },
)


DEMO_MEMBERSHIP_BY_EMAIL: dict[str, tuple[str, str, str]] = {
    "admin@sentra.local": ("TEN-BALA-UNI", "owner", "Command"),
    "exec@sentra.local": ("TEN-BALA-UNI", "executive", "Executive"),
    "ops@sentra.local": ("TEN-BALA-MFG", "ops_admin", "Operations"),
    "security@sentra.local": ("TEN-BALA-HOSP", "security_admin", "Security"),
    "analyst@sentra.local": ("TEN-BALA-UNI", "analyst", "Analytics"),
    "responder@sentra.local": ("TEN-BALA-UNI", "operator", "Field"),
    "viewer@sentra.local": ("TEN-BALA-UNI", "viewer", "Observers"),
    "admin@sentra.demo": ("TEN-BALA-UNI", "owner", "Command"),
    "manager@sentra.demo": ("TEN-BALA-HOSP", "security_admin", "Security"),
    "staff@sentra.demo": ("TEN-BALA-UNI", "operator", "Zone 3"),
    "responder@sentra.demo": ("TEN-BALA-UNI", "operator", "Field"),
    "analyst@sentra.demo": ("TEN-BALA-UNI", "analyst", "Analytics"),
}


def plan_for_key(plan_key: str) -> dict[str, Any]:
    normalized = plan_key.strip().lower()
    if normalized not in PLAN_CATALOG:
        normalized = "business"
    return dict(PLAN_CATALOG[normalized])
