from __future__ import annotations

from typing import Any


def build_efficiency(metrics: dict[str, Any]) -> dict[str, Any]:
    employees = int(metrics["employees"])
    arr = int(metrics["ARR"])
    return {
        "enterprise_efficiency_score": 88,
        "revenue_per_employee": round(arr / max(1, employees)),
        "output_efficiency": int(metrics["productivity_score"]),
        "meetings_load_hours_per_week": 12,
        "delivery_delays": 4,
        "overloaded_teams": ["Engineering", "Revenue"],
        "hiring_bottlenecks": ["regional enterprise sales", "security compliance"],
        "cost_reduction_opportunities": [
            {"title": "Consolidate duplicated SaaS tooling", "annual_savings": 180_000, "risk": "low"},
            {"title": "Partner-led implementation services", "annual_savings": 260_000, "risk": "medium"},
            {"title": "Tighten travel and events budget", "annual_savings": 120_000, "risk": "low"},
        ],
        "cash_allocation": [
            {"area": "Growth", "percent": 38, "amount": 3_572_000},
            {"area": "Product and AI", "percent": 32, "amount": 3_008_000},
            {"area": "Security and compliance", "percent": 14, "amount": 1_316_000},
            {"area": "Reserve", "percent": 16, "amount": 1_504_000},
        ],
    }
