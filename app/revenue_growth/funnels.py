from __future__ import annotations

from typing import Any

from app.revenue_growth.models import FUNNEL_STAGES


def build_funnel(tenant_id: str) -> list[dict[str, Any]]:
    stages: list[dict[str, Any]] = []
    previous_count: int | None = None
    for stage_id, name, count in FUNNEL_STAGES:
        conversion_rate = round((count / previous_count) * 100, 1) if previous_count else None
        dropoff_rate = round(100 - conversion_rate, 1) if conversion_rate is not None else None
        stages.append(
            {
                "stage_id": stage_id,
                "tenant_id": tenant_id,
                "name": name,
                "count": count,
                "previous_stage_count": previous_count,
                "conversion_rate": conversion_rate,
                "dropoff_rate": dropoff_rate,
            }
        )
        previous_count = count
    return stages


def funnel_metrics(funnel: list[dict[str, Any]]) -> dict[str, float]:
    by_id = {str(stage["stage_id"]): stage for stage in funnel}
    visitors = max(1, int(by_id["visitors"]["count"]))
    leads = int(by_id["leads"]["count"])
    trials = int(by_id["trials"]["count"])
    paid = int(by_id["paid_conversions"]["count"])
    return {
        "visitor_to_lead": round((leads / visitors) * 100, 1),
        "lead_to_trial": round((trials / max(1, leads)) * 100, 1),
        "trial_to_paid": round((paid / max(1, trials)) * 100, 1),
    }
