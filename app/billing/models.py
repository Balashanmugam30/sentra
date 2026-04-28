from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def future_iso(days: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


BILLING_PLAN_MATRIX: dict[str, dict[str, Any]] = {
    "starter": {
        "plan_key": "starter",
        "name": "Starter",
        "seat_limit": 10,
        "monthly_price": 499,
        "annual_price": 4_990,
        "modules_enabled": ["incidents", "basic_dashboard", "limited_reports"],
        "api_rate_limit": 10_000,
        "support_tier": "standard",
        "entitlements": ["incidents", "basic_dashboard", "limited_reports"],
        "stripe_price_env_monthly": "STRIPE_PRICE_STARTER_MONTHLY",
        "stripe_price_env_annual": "STRIPE_PRICE_STARTER_ANNUAL",
    },
    "business": {
        "plan_key": "business",
        "name": "Business",
        "seat_limit": 50,
        "monthly_price": 2_900,
        "annual_price": 29_000,
        "modules_enabled": ["ai_modules", "osint", "reports", "workflows", "geo"],
        "api_rate_limit": 100_000,
        "support_tier": "priority",
        "entitlements": ["ai_modules", "osint", "reports", "workflow_automation", "geo"],
        "stripe_price_env_monthly": "STRIPE_PRICE_BUSINESS_MONTHLY",
        "stripe_price_env_annual": "STRIPE_PRICE_BUSINESS_ANNUAL",
    },
    "enterprise": {
        "plan_key": "enterprise",
        "name": "Enterprise",
        "seat_limit": 10_000,
        "monthly_price": 14_900,
        "annual_price": 149_000,
        "modules_enabled": ["full_platform", "branding", "sso_ready", "advanced_ai", "priority_support"],
        "api_rate_limit": 1_000_000,
        "support_tier": "enterprise",
        "entitlements": [
            "advanced_ai",
            "osint_pro",
            "executive_reports",
            "sso",
            "branding",
            "workflow_automation",
        ],
        "stripe_price_env_monthly": "STRIPE_PRICE_ENTERPRISE_MONTHLY",
        "stripe_price_env_annual": "STRIPE_PRICE_ENTERPRISE_ANNUAL",
    },
    "government": {
        "plan_key": "government",
        "name": "Government",
        "seat_limit": 50_000,
        "monthly_price": 39_000,
        "annual_price": 390_000,
        "modules_enabled": ["isolated_deployment", "hardened_audit", "premium_support", "custom_sla", "private_cloud"],
        "api_rate_limit": 5_000_000,
        "support_tier": "mission-critical",
        "entitlements": [
            "advanced_ai",
            "osint_pro",
            "executive_reports",
            "sso",
            "branding",
            "workflow_automation",
            "government_mode",
        ],
        "stripe_price_env_monthly": "STRIPE_PRICE_GOVERNMENT_MONTHLY",
        "stripe_price_env_annual": "STRIPE_PRICE_GOVERNMENT_ANNUAL",
    },
}


DEMO_BILLING_METRICS: dict[str, Any] = {
    "mrr": 182_400,
    "arr": 2_188_800,
    "active_customers": 42,
    "trials_converting": 8,
    "failed_payments": 3,
    "upgrades_this_month": 7,
    "expansion_revenue": 31_600,
    "net_revenue_retention": 118,
    "churn_risk_percent": 4.8,
    "collection_recovery_percent": 91,
}


def plan_for_key(plan_key: str) -> dict[str, Any]:
    normalized = plan_key.strip().lower()
    if normalized not in BILLING_PLAN_MATRIX:
        normalized = "business"
    return dict(BILLING_PLAN_MATRIX[normalized])
