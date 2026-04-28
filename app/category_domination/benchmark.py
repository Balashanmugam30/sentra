from __future__ import annotations

from app.category_domination.models import CATEGORY_METRICS


def benchmark_superiority() -> dict[str, object]:
    return {
        "avg_roi_delivered": CATEGORY_METRICS["avg_roi_delivered"],
        "ai_accuracy_advantage": CATEGORY_METRICS["ai_accuracy_advantage"],
        "operational_speed_gain": CATEGORY_METRICS["operational_speed_gain"],
        "cost_savings": 32,
        "response_time_gain": 51,
        "platform_depth_advantage": 46,
        "comparisons": [
            {"metric": "AI accuracy", "sentra": 94, "competitor_average": 75, "unit": "%"},
            {"metric": "Response speed", "sentra": 88, "competitor_average": 61, "unit": "index"},
            {"metric": "Cost savings", "sentra": 32, "competitor_average": 14, "unit": "%"},
            {"metric": "ROI delivered", "sentra": 7.4, "competitor_average": 2.9, "unit": "x"},
            {"metric": "Module depth", "sentra": 97, "competitor_average": 58, "unit": "index"},
        ],
    }


def analyst_positioning() -> dict[str, object]:
    return {
        "rank": "Visionary",
        "position": "upper-right challenger to leader transition",
        "growth_class": "high growth",
        "execution_class": "outperformer",
        "innovation_class": "category creator",
        "quadrant": [
            {"company": "Sentra", "vision": 96, "execution": 91},
            {"company": "CommandOS Inc", "vision": 72, "execution": 68},
            {"company": "GovMatrix", "vision": 58, "execution": 74},
            {"company": "CrisisWare", "vision": 54, "execution": 62},
            {"company": "LegacyShield", "vision": 42, "execution": 66},
        ],
    }

