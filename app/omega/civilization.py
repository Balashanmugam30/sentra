"""Civilization resilience synthesis."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_civilization(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "civilization_resilience": metrics.civilization_resilience,
        "global_stability": metrics.global_stability,
        "compound_intelligence_score": metrics.compound_intelligence_score,
        "continuity_factors": [
            {"factor": "economic resilience", "score": 86},
            {"factor": "health readiness", "score": 88},
            {"factor": "food and water security", "score": 84},
            {"factor": "energy continuity", "score": 88},
            {"factor": "trust and governance", "score": metrics.trust_score},
        ],
        "single_sentence": "Sentra keeps civilization-critical systems modeled, explainable, and human-governed under compound shock.",
    }

