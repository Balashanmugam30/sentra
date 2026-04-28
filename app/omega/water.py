"""Water stress intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_water(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "water_stress_index": 46,
        "reserve_days": 52,
        "drought_pressure": 39,
        "flood_contamination_risk": 18,
        "water_resilience_score": 86,
        "stress_zones": [
            {"zone": "Indus basin", "stress": 64, "intervention": "agricultural demand shift"},
            {"zone": "Colorado basin", "stress": 58, "intervention": "municipal conservation buffer"},
            {"zone": "Horn of Africa", "stress": 71, "intervention": "aid and desalination logistics"},
        ],
    }

