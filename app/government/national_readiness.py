from __future__ import annotations

from typing import Any


def build_national_readiness(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "country_readiness_score": int(metrics["national_readiness"]),
        "state_readiness_score": int(metrics["state_readiness"]),
        "emergency_response_capability": int(metrics["emergency_response_capability"]),
        "cyber_resilience_score": int(metrics["cyber_defense"]),
        "medical_readiness": int(metrics["medical_surge_capacity"]),
        "infrastructure_risk": int(metrics["infrastructure_risk"]),
        "supply_reserve_days": int(metrics["supply_reserve_days"]),
        "communications_continuity": int(metrics["communications_continuity"]),
        "border_integrity_score": int(metrics["border_integrity"]),
        "readiness_class": "Sovereign Ready" if int(metrics["national_readiness"]) >= 88 else "Watch",
        "weak_links": ["medical surge capacity", "rail redundancy", "regional supply buffers"],
    }
