from __future__ import annotations

from app.category_domination.models import CATEGORY_METRICS


def category_score() -> dict[str, object]:
    return {
        "category_score": CATEGORY_METRICS["category_score"],
        "leadership_label": CATEGORY_METRICS["leadership_label"],
        "market_share_score": 92,
        "brand_authority_score": 89,
        "trust_score": 93,
        "benchmark_score": 95,
        "analyst_score": 91,
        "government_trust_score": 92,
        "narrative_control_score": 96,
        "momentum": "accelerating",
    }


def live_category_snapshot() -> dict[str, object]:
    return {
        **CATEGORY_METRICS,
        "generated_at_label": "live",
        "why_sentra_wins": "Sentra owns the autonomous command intelligence narrative with a deeper product surface, stronger trust proof, and proprietary data compounding.",
    }

