"""Planetary cyber intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_cyber(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "cyber_attack_probability": 37,
        "ransomware_wave_risk": 29,
        "critical_infra_exposure": 34,
        "identity_attack_index": 41,
        "defense_readiness": 91,
        "active_waves": [
            {"wave": "identity spray against utilities", "severity": 68},
            {"wave": "public-sector ransomware probes", "severity": 62},
            {"wave": "satellite comm spoofing watch", "severity": 57},
        ],
    }

