from __future__ import annotations

from typing import Any


def build_mna(metrics: dict[str, Any]) -> dict[str, Any]:
    score = round(
        int(metrics["net_revenue_retention"]) * 0.18
        + int(metrics["gross_margin_percent"]) * 0.16
        + int(metrics["YoY_growth_percent"]) * 0.12
        + 42
    )
    return {
        "acquisition_readiness_percent": min(96, score),
        "strategic_premium_percent": 42,
        "attractiveness_drivers": ["AI command IP", "Government contracts", "Marketplace ecosystem", "Global footprint", "High NRR"],
        "top_buyer_matches": [
            {"class": "Cloud hyperscaler", "fit_score": 91, "rationale": "AI operations and public sector cloud pull-through."},
            {"class": "Enterprise software giant", "fit_score": 88, "rationale": "Workflow, ITSM, and command-center adjacency."},
            {"class": "Security platform giant", "fit_score": 86, "rationale": "SOC, audit, zero-trust, and incident response fusion."},
            {"class": "Industrial automation giant", "fit_score": 84, "rationale": "Facility, IoT, GIS, and digital twin relevance."},
            {"class": "Defense contractor", "fit_score": 82, "rationale": "Crisis command and sovereign resilience platform fit."},
            {"class": "Smart city conglomerate", "fit_score": 81, "rationale": "Public safety, transport, environment, and civic intelligence."},
        ],
    }

