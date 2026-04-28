from __future__ import annotations

from app.monopoly_expansion.models import MONOPOLY_METRICS


def customer_lockin() -> dict[str, object]:
    return {
        "installed_integrations": MONOPOLY_METRICS["installed_integrations"],
        "workflows_dependent": 1_840,
        "switching_cost": MONOPOLY_METRICS["avg_switching_cost_index"],
        "seats_expanded": 12_600,
        "data_gravity_score": MONOPOLY_METRICS["data_gravity_score"],
        "dependency_chart": [
            {"driver": "Integrations", "score": 91},
            {"driver": "Workflow depth", "score": 94},
            {"driver": "Executive reports", "score": 88},
            {"driver": "AI memory", "score": 93},
            {"driver": "Data Empire", "score": 96},
        ],
        "responsible_note": "lock-in is built through measurable customer value, interoperability, trust, and data-driven outcomes",
    }

