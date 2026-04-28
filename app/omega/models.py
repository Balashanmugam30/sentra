"""Domain models for Sentra Omega OS."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

OmegaMode = Literal["advisory", "approval_required", "semi_autonomous", "full_autonomous", "emergency_manual_override"]

DEFAULT_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSPITAL", "TEN-GOVSEC-SOUTH"]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class OmegaMetrics:
    tenant_id: str
    countries_modeled: int = 195
    cities_active: int = 512
    threat_events: int = 12
    global_stability: int = 88
    civilization_resilience: int = 93
    war_risk_regions: int = 4
    climate_alerts: int = 17
    supply_chokepoints: int = 6
    energy_stress_zones: int = 8
    pandemic_watch_zones: int = 3
    decision_accuracy: int = 96
    forecast_accuracy: int = 94
    trust_score: int = 91
    learning_gain_percent: int = 22
    recovery_improvement_percent: int = 31
    rejected_decisions_percent: int = 9
    accepted_decisions_percent: int = 76
    override_rate_percent: int = 15
    self_heal_success_percent: int = 97
    compound_intelligence_score: int = 99
    current_objective: str = "maximize safety"
    governance_mode: OmegaMode = "approval_required"
    improvement_cycles: int = 42
    memory_episodes: int = 18_400
    updated_at: str = field(default_factory=utc_now)

    def as_dict(self) -> dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "countries_modeled": self.countries_modeled,
            "cities_active": self.cities_active,
            "threat_events": self.threat_events,
            "global_stability": self.global_stability,
            "civilization_resilience": self.civilization_resilience,
            "war_risk_regions": self.war_risk_regions,
            "climate_alerts": self.climate_alerts,
            "supply_chokepoints": self.supply_chokepoints,
            "energy_stress_zones": self.energy_stress_zones,
            "pandemic_watch_zones": self.pandemic_watch_zones,
            "decision_accuracy": self.decision_accuracy,
            "forecast_accuracy": self.forecast_accuracy,
            "trust_score": self.trust_score,
            "learning_gain_percent": self.learning_gain_percent,
            "recovery_improvement_percent": self.recovery_improvement_percent,
            "rejected_decisions_percent": self.rejected_decisions_percent,
            "accepted_decisions_percent": self.accepted_decisions_percent,
            "override_rate_percent": self.override_rate_percent,
            "self_heal_success_percent": self.self_heal_success_percent,
            "compound_intelligence_score": self.compound_intelligence_score,
            "current_objective": self.current_objective,
            "governance_mode": self.governance_mode,
            "improvement_cycles": self.improvement_cycles,
            "memory_episodes": self.memory_episodes,
            "updated_at": self.updated_at,
        }


@dataclass(slots=True)
class OmegaEvent:
    tenant_id: str
    action: str
    actor: str
    summary: str
    risk_score: int = 38
    event_id: str = field(default_factory=lambda: f"OMEGA-EVT-{uuid4().hex[:8].upper()}")
    created_at: str = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "tenant_id": self.tenant_id,
            "action": self.action,
            "actor": self.actor,
            "summary": self.summary,
            "risk_score": self.risk_score,
            "created_at": self.created_at,
            "metadata": self.metadata,
        }

