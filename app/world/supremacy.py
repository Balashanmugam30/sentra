"""Global continuity and supremacy score engine."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics


def build_continuity(metrics: WorldMetrics) -> dict[str, Any]:
    inputs = [
        {"dimension": "economy", "score": 78},
        {"dimension": "conflict", "score": 74},
        {"dimension": "health", "score": 82},
        {"dimension": "energy", "score": 81},
        {"dimension": "climate", "score": 76},
        {"dimension": "logistics", "score": 84},
        {"dimension": "trust", "score": 89},
    ]
    return {
        "continuity_score": metrics.continuity_score,
        "label": "resilient",
        "inputs": inputs,
        "primary_risk": "climate-linked logistics pressure",
        "stabilization_path": "balance energy backup, health readiness, and trade route redundancy",
    }


def build_supremacy(metrics: WorldMetrics) -> dict[str, Any]:
    dimensions = [
        {"dimension": "AI Command Strength", "score": 98},
        {"dimension": "Forecast Accuracy", "score": metrics.forecast_accuracy},
        {"dimension": "Recovery Readiness", "score": 92},
        {"dimension": "Autonomy Trust", "score": 91},
        {"dimension": "Economic Resilience", "score": 84},
        {"dimension": "Defense Stability", "score": 89},
        {"dimension": "Civil Continuity", "score": metrics.continuity_score},
    ]
    return {
        "supremacy_score": metrics.supremacy_score,
        "label": "dominant",
        "dimensions": dimensions,
        "executive_summary": "Sentra maintains dominant command readiness across crisis, government, economy, and autonomy layers.",
    }

