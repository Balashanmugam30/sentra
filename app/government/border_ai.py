from __future__ import annotations

from typing import Any


def build_border_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "illegal_crossings": 7,
        "drone_intrusions": 3,
        "maritime_anomalies": 5,
        "cargo_risk_score": 28,
        "border_integrity_score": int(metrics["border_integrity"]),
        "route_heatmaps": [
            {"sector": "North Ridge", "heat": 42, "trend": "falling"},
            {"sector": "Coastal Delta", "heat": 61, "trend": "rising"},
            {"sector": "Rail Cargo East", "heat": 36, "trend": "stable"},
        ],
        "recommended_locks": ["Coastal Delta night drone corridor", "Rail Cargo East high-risk containers"],
    }
