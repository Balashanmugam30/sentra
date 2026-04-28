"""Domain models for Sentra Global Sentience Engine."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class WorldMetrics:
    tenant_id: str
    countries_live: int = 52
    threats_active: int = 7
    global_stability: int = 84
    continuity_score: int = 88
    supremacy_score: int = 97
    forecast_accuracy: int = 93
    economic_pressure: str = "moderate"
    pandemic_watch_zones: int = 3
    climate_alerts: int = 5
    supply_chain_chokepoints: int = 4
    diplomacy_index: int = 86
    satellite_resilience: int = 91
    generated_mode: str = "global_sentience"
    updated_at: str = field(default_factory=utc_now)

    def as_dict(self) -> dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "countries_live": self.countries_live,
            "threats_active": self.threats_active,
            "global_stability": self.global_stability,
            "continuity_score": self.continuity_score,
            "supremacy_score": self.supremacy_score,
            "forecast_accuracy": self.forecast_accuracy,
            "economic_pressure": self.economic_pressure,
            "pandemic_watch_zones": self.pandemic_watch_zones,
            "climate_alerts": self.climate_alerts,
            "supply_chain_chokepoints": self.supply_chain_chokepoints,
            "diplomacy_index": self.diplomacy_index,
            "satellite_resilience": self.satellite_resilience,
            "generated_mode": self.generated_mode,
            "updated_at": self.updated_at,
        }


@dataclass(slots=True)
class WorldEvent:
    tenant_id: str
    action: str
    actor: str
    summary: str
    severity: str = "medium"
    event_id: str = field(default_factory=lambda: f"WORLD-EVT-{uuid4().hex[:8].upper()}")
    created_at: str = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "tenant_id": self.tenant_id,
            "action": self.action,
            "actor": self.actor,
            "summary": self.summary,
            "severity": self.severity,
            "created_at": self.created_at,
            "metadata": self.metadata,
        }

