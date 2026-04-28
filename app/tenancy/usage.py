from __future__ import annotations

from typing import Any

from app.tenancy.provisioning import tenancy_store


def build_usage_snapshot(tenant_id: str) -> dict[str, Any]:
    usage = tenancy_store.get_usage(tenant_id)
    plan = tenancy_store.get_plan(tenant_id)
    seats_limit = int(plan.get("seats_limit", 1))
    api_limit = int(plan.get("api_limit", 1))
    storage_limit = float(plan.get("storage_limit_gb", 1))
    return {
        **usage,
        "seats_limit": seats_limit,
        "seat_utilization_percent": _percent(int(usage["active_users"]), seats_limit),
        "api_utilization_percent": _percent(int(usage["api_calls_month"]), api_limit),
        "storage_utilization_percent": _percent(float(usage["storage_used_gb"]), storage_limit),
    }


def _percent(used: int | float, limit: int | float) -> int:
    return max(0, min(100, round((float(used) / max(1.0, float(limit))) * 100)))
