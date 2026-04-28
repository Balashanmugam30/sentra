from __future__ import annotations

from typing import Any

from app.revenue_growth.models import PRICING_EXPERIMENTS


def build_pricing_experiments(tenant_id: str) -> list[dict[str, Any]]:
    best_score = max(conversion_rate * arpu for _, _, _, _, conversion_rate, arpu in PRICING_EXPERIMENTS)
    experiments = []
    for experiment_id, name, plan, variant, conversion_rate, arpu in PRICING_EXPERIMENTS:
        score = conversion_rate * arpu
        experiments.append(
            {
                "experiment_id": experiment_id,
                "tenant_id": tenant_id,
                "name": name,
                "plan": plan,
                "variant": variant,
                "conversion_rate": conversion_rate,
                "arpu": arpu,
                "confidence": round(78 + (score / best_score) * 18),
                "winner": score == best_score,
            }
        )
    return experiments


def run_pricing_test(tenant_id: str, variant: str | None = None) -> dict[str, Any]:
    experiments = build_pricing_experiments(tenant_id)
    target = next((item for item in experiments if item["experiment_id"] == variant), None) if variant else None
    winner = target or max(experiments, key=lambda item: float(item["conversion_rate"]) * int(item["arpu"]))
    return {
        "winner": winner,
        "projected_mrr_lift": 18_600 if winner["plan"] != "Government" else 42_000,
        "pricing_message": "Annual executive continuity anchor outperforms monthly self-serve for high-trust buyers.",
        "recommended_rollout": "Route public-sector and enterprise traffic to demo-gated annual plans.",
    }
