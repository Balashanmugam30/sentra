from __future__ import annotations

from typing import Any


def build_cro_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "pipeline": int(metrics["pipeline"]),
        "net_new_ARR": int(metrics["net_new_ARR"]),
        "expansion_ARR": int(metrics["expansion_ARR"]),
        "renewal_confidence": int(metrics["renewal_confidence"]),
        "territory_winners": ["UAE Enterprise", "India South", "Singapore Healthcare"],
        "partner_contribution_percent": 38,
        "GTM_efficiency": 87,
        "recommended_moves": [
            "Put founder in UAE top 3 deals only.",
            "Route mid-market demos through certified partners.",
            "Bundle marketplace integrations into enterprise uplift.",
        ],
    }
