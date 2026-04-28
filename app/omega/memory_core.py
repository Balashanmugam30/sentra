"""Strategic memory core."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_memory(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "memory_episodes": metrics.memory_episodes,
        "best_actions": [
            "corridor-first containment during crowd pressure",
            "fuel-route pre-stage before energy volatility",
            "public trust advisory before misinformation breakout",
        ],
        "failed_actions": [
            "late logistics reroute after port congestion",
            "overly aggressive lockdown in mixed evacuation context",
        ],
        "recurring_patterns": [
            {"pattern": "climate shock increases migration pressure after 7-14 days", "confidence": 91},
            {"pattern": "cyber waves rise during geopolitical escalation", "confidence": 88},
            {"pattern": "trust messaging reduces unrest probability", "confidence": 86},
        ],
        "trust_by_module": [
            {"module": "planetary threat", "trust": 93},
            {"module": "self-healing", "trust": metrics.self_heal_success_percent},
            {"module": "future timeline", "trust": metrics.forecast_accuracy},
        ],
    }

