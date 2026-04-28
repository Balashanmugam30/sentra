"""Energy grid intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_energy(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "energy_stress_zones": metrics.energy_stress_zones,
        "reserve_days": 41,
        "blackout_probability": 14,
        "grid_resilience_score": 88,
        "fuel_route_risk": 31,
        "zones": [
            {"zone": "Europe winter gas", "stress": 54, "reserves": 39},
            {"zone": "South Asia peak demand", "stress": 67, "reserves": 28},
            {"zone": "Gulf export route", "stress": 49, "reserves": 46},
        ],
    }

