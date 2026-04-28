from __future__ import annotations

from typing import Any


def build_ipo(metrics: dict[str, Any]) -> dict[str, Any]:
    factors = {
        "revenue_scale": 32,
        "governance_maturity": 64,
        "audit_readiness": 71,
        "board_independence": 58,
        "margin_quality": int(metrics["gross_margin_percent"]),
        "growth_durability": 86,
        "global_footprint": 72,
        "controls_maturity": 68,
        "reporting_discipline": 74,
    }
    score = round(sum(factors.values()) / len(factors))
    status = "IPO Track" if score >= 85 else "Pre-IPO" if score >= 72 else "Emerging" if score >= 55 else "Early"
    return {
        "status": status,
        "score": score,
        "factors": factors,
        "next_controls": ["Independent board seat", "Big Four audit readiness", "Revenue recognition policy", "Quarterly forecast discipline"],
    }

