from __future__ import annotations

from app.category_domination.models import CATEGORY_METRICS, REGION_CAPTURE


def market_share_snapshot() -> dict[str, object]:
    tam = CATEGORY_METRICS["tam"]
    sam = CATEGORY_METRICS["sam"]
    som = CATEGORY_METRICS["som_capture_target"]
    return {
        "tam": tam,
        "sam": sam,
        "som_capture_target": som,
        "current_penetration": 4.2,
        "target_expansion_percent": 3.3,
        "market_capture_velocity": 44,
        "region_capture_map": REGION_CAPTURE,
        "expansion_narrative": "Sentra is moving from crisis software into the category-defining command intelligence platform.",
    }


def industry_leaderboard() -> list[dict[str, object]]:
    return [
        {"rank": 1, "company": "Sentra", "category_score": 96, "growth": 171, "trust": 93, "ai_depth": 98, "label": "Market Leader"},
        {"rank": 2, "company": "CommandOS Inc", "category_score": 74, "growth": 48, "trust": 72, "ai_depth": 68, "label": "Defense Niche"},
        {"rank": 3, "company": "GovMatrix", "category_score": 69, "growth": 31, "trust": 78, "ai_depth": 55, "label": "Legacy Government"},
        {"rank": 4, "company": "CrisisWare", "category_score": 63, "growth": 26, "trust": 61, "ai_depth": 49, "label": "Point Solution"},
        {"rank": 5, "company": "SlowOps AI", "category_score": 58, "growth": 22, "trust": 54, "ai_depth": 62, "label": "AI Wrapper"},
        {"rank": 6, "company": "LegacyShield", "category_score": 51, "growth": 12, "trust": 56, "ai_depth": 38, "label": "Legacy Suite"},
    ]

