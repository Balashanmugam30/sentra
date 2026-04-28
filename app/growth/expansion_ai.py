from __future__ import annotations

from typing import Any


def build_expansion_recommendations(countries: list[dict[str, Any]], partners: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ranked = sorted(
        countries,
        key=lambda country: (
            int(country["market_score"]) * 0.32
            + int(country["government_opportunity"]) * 0.24
            + int(country["deployment_readiness"]) * 0.24
            + int(country["channel_strength"]) * 0.2
            - int(country["compliance_complexity"]) * 0.18
        ),
        reverse=True,
    )
    best = ranked[0] if ranked else {"name": "UAE", "currency": "AED"}
    top_partner = max(partners, key=lambda partner: int(partner["certification_score"])) if partners else {"name": "ShieldGrid Global"}
    return [
        {
            "recommendation_id": "GROWTH-AI-UAE",
            "title": f"Launch {best['name']} first",
            "reason": "Highest blend of market score, government opportunity, deployment readiness, and channel strength.",
            "impact": "Expected to accelerate 12-month ARR by $3.4M with a government-heavy pipeline.",
            "priority": "critical",
            "confidence": 92,
            "cta": f"Launch {best['name']}",
        },
        {
            "recommendation_id": "GROWTH-AI-INDIA-PRICE",
            "title": "Increase India Business plan by 8%",
            "reason": "India shows strong readiness and channel strength with lower competition pressure than North America.",
            "impact": "Adds roughly $420k ARR without materially slowing velocity.",
            "priority": "high",
            "confidence": 84,
            "cta": "Update pricing band",
        },
        {
            "recommendation_id": "GROWTH-AI-GERMANY-AE",
            "title": "Hire Germany enterprise AE",
            "reason": "Germany has high public-sector ARR potential but compliance-heavy sales cycles need local ownership.",
            "impact": "Improves RFP conversion probability by 11-16 points.",
            "priority": "high",
            "confidence": 81,
            "cta": "Open territory role",
        },
        {
            "recommendation_id": "GROWTH-AI-SAUDI-CHANNEL",
            "title": "Use channel model in Saudi",
            "reason": f"{top_partner['name']} has stronger certification leverage than direct-only GTM in regulated markets.",
            "impact": "Reduces launch risk while preserving government pipeline upside.",
            "priority": "medium",
            "confidence": 78,
            "cta": "Assign partner",
        },
        {
            "recommendation_id": "GROWTH-AI-SINGAPORE-GOV",
            "title": "Push Singapore government motion",
            "reason": "Fast compliance path and strong civic command fit for sovereign crisis intelligence.",
            "impact": "Creates a premium reference account for SEA expansion.",
            "priority": "medium",
            "confidence": 80,
            "cta": "Create government deal",
        },
    ]

