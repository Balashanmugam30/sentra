"""Migration pressure engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_migration(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "migration_pressure_index": 42,
        "border_stress": 39,
        "refugee_movement_forecast": "elevated but manageable",
        "urban_overload_probability": 24,
        "pressure_corridors": [
            {"corridor": "Sahel to Mediterranean", "pressure": 61, "driver": "food and conflict"},
            {"corridor": "South Asia urban belt", "pressure": 52, "driver": "heat and water stress"},
            {"corridor": "Eastern Europe displacement", "pressure": 47, "driver": "security volatility"},
        ],
    }

