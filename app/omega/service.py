"""Tenant-scoped service layer for Sentra Omega OS."""

from __future__ import annotations

import json
from pathlib import Path
from threading import RLock
from typing import Any

from app.core.config import settings
from app.omega.civilization import build_civilization
from app.omega.climate import build_climate
from app.omega.continuity import build_continuity, build_future_timeline
from app.omega.earth_twin import build_planetary
from app.omega.economy import build_economy
from app.omega.energy import build_energy
from app.omega.evolution import build_evolution
from app.omega.explainability import build_explainability
from app.omega.governance import build_governance
from app.omega.health import build_health
from app.omega.logistics import build_logistics
from app.omega.memory_core import build_memory
from app.omega.meta_learning import build_meta_learning
from app.omega.migration import build_migration
from app.omega.models import DEFAULT_TENANTS, OmegaEvent, OmegaMetrics, utc_now
from app.omega.objective_engine import build_objectives
from app.omega.recursive_optimizer import build_optimizer
from app.omega.satellite import build_satellite
from app.omega.self_healing import build_self_healing, run_self_heal
from app.omega.self_improve import build_self_improvement, run_improvement
from app.omega.strategy_engine import build_strategy
from app.omega.threat_engine import build_threats
from app.omega.trust_engine import build_trust
from app.omega.water import build_water


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEFAULT_TENANTS)
    return [str(tenant["tenant_id"])]


class OmegaStore:
    def __init__(self) -> None:
        self.path = Path(settings.sentra_omega_store_path)
        self._lock = RLock()
        self._loaded = False
        self._metrics: dict[str, OmegaMetrics] = {}
        self._events: list[OmegaEvent] = []

    def seed_demo(self) -> None:
        with self._lock:
            self._ensure_loaded()
            changed = False
            for tenant_id in DEFAULT_TENANTS:
                if tenant_id not in self._metrics:
                    self._metrics[tenant_id] = OmegaMetrics(tenant_id=tenant_id)
                    changed = True
            if not self._events:
                self._events.append(
                    OmegaEvent(
                        tenant_id="TEN-BALA-UNI",
                        action="omega_seeded",
                        actor="system",
                        summary="Omega OS initialized with planetary and singularity seed intelligence.",
                        risk_score=12,
                    )
                )
                changed = True
            if changed:
                self._persist()

    def tenant_ids(self, tenant_id: str | None, super_admin: bool = False) -> list[str]:
        self._ensure_loaded()
        if super_admin:
            return list(self._metrics.keys()) or DEFAULT_TENANTS
        return [tenant_id or "TEN-BALA-UNI"]

    def metrics(self, tenant_id: str | None, super_admin: bool = False) -> OmegaMetrics:
        scope = self.tenant_ids(tenant_id, super_admin)
        selected = scope[0] if scope else "TEN-BALA-UNI"
        with self._lock:
            if selected not in self._metrics:
                self._metrics[selected] = OmegaMetrics(tenant_id=selected)
                self._persist()
            return self._metrics[selected]

    def live(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        threats = build_threats(metrics)
        return {
            "generated_at": utc_now(),
            "metrics": metrics.as_dict(),
            "planetary": {
                "planetary": build_planetary(metrics),
                "civilization": build_civilization(metrics),
                "future": build_future_timeline(metrics),
            },
            "singularity": self.ai_live(tenant_id, super_admin),
            "top_threats": threats["threats"][:5],
            "recommended_actions": [
                {
                    "action": "Pre-stage global continuity reserves",
                    "confidence": metrics.decision_accuracy,
                    "impact": "protects safety, energy, water, logistics, and trust under compound shock",
                },
                {
                    "action": "Run recursive improvement cycle",
                    "confidence": 94,
                    "impact": "improves forecasting weights and recovery ETA optimization",
                },
                {
                    "action": "Keep governance in approval-required mode",
                    "confidence": metrics.trust_score,
                    "impact": "preserves human control while allowing fast AI planning",
                },
            ],
        }

    def planetary(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_planetary(self.metrics(tenant_id, super_admin))

    def threats(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_threats(self.metrics(tenant_id, super_admin))

    def climate(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_climate(self.metrics(tenant_id, super_admin))

    def pandemic(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_health(self.metrics(tenant_id, super_admin))

    def economy(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_economy(self.metrics(tenant_id, super_admin))

    def logistics(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_logistics(self.metrics(tenant_id, super_admin))

    def energy(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_energy(self.metrics(tenant_id, super_admin))

    def water(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_water(self.metrics(tenant_id, super_admin))

    def migration(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_migration(self.metrics(tenant_id, super_admin))

    def future(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_future_timeline(self.metrics(tenant_id, super_admin))

    def civilization(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        return {"civilization": build_civilization(metrics), "continuity": build_continuity(metrics)}

    def satellite(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_satellite(self.metrics(tenant_id, super_admin))

    def ai_live(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        return {
            "self_improvement": build_self_improvement(metrics),
            "meta_learning": build_meta_learning(metrics),
            "strategy": build_strategy(metrics),
            "optimizer": build_optimizer(metrics),
            "self_healing": build_self_healing(metrics),
            "trust": build_trust(metrics),
            "objective": build_objectives(metrics),
            "explainability": build_explainability(metrics),
            "evolution": build_evolution(metrics),
        }

    def objectives(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_objectives(self.metrics(tenant_id, super_admin))

    def memory(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_memory(self.metrics(tenant_id, super_admin))

    def trust(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_trust(self.metrics(tenant_id, super_admin))

    def explain(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_explainability(self.metrics(tenant_id, super_admin))

    def evolution(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_evolution(self.metrics(tenant_id, super_admin))

    def governance(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        events = [event.as_dict() for event in self._events if event.tenant_id == metrics.tenant_id]
        return build_governance(metrics, events)

    def run_simulation(self, tenant_id: str | None, actor: str, scenario: str | None, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_simulation_run",
                actor=actor,
                summary=f"Omega planetary simulation run for {scenario or 'compound planetary shock'}.",
                risk_score=42,
                metadata={"scenario": scenario or "compound_planetary_shock"},
            )
            self._events.append(event)
            self._persist()
            return event, {
                "scenario": scenario or "compound planetary shock",
                "best_response": "combine logistics reroute, energy reserves, public trust advisory, and cyber shield.",
                "civilization_resilience": metrics.civilization_resilience,
                "forecast_accuracy": metrics.forecast_accuracy,
            }

    def run_improvement_cycle(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            data = run_improvement(metrics)
            metrics.updated_at = utc_now()
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_improvement_cycle_run",
                actor=actor,
                summary="Recursive improvement cycle completed.",
                risk_score=18,
                metadata={"cycle": metrics.improvement_cycles},
            )
            self._events.append(event)
            self._persist()
            return event, data

    def run_self_heal(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            data = run_self_heal(metrics)
            metrics.updated_at = utc_now()
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_self_heal_run",
                actor=actor,
                summary="Omega self-heal cycle restored cache, route, and telemetry guards.",
                risk_score=16,
                metadata={"self_heal_success_percent": metrics.self_heal_success_percent},
            )
            self._events.append(event)
            self._persist()
            return event, data

    def set_objective(self, tenant_id: str | None, actor: str, objective: str, reason: str | None, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            metrics.current_objective = objective
            metrics.updated_at = utc_now()
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_objective_changed",
                actor=actor,
                summary=f"Omega objective changed to {objective}.",
                risk_score=24,
                metadata={"reason": reason or "human-governed objective update"},
            )
            self._events.append(event)
            self._persist()
            return event, build_objectives(metrics)

    def change_mode(self, tenant_id: str | None, actor: str, mode: str, reason: str | None, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            allowed = {"advisory", "approval_required", "semi_autonomous", "full_autonomous", "emergency_manual_override"}
            if mode not in allowed:
                mode = "approval_required"
            metrics.governance_mode = mode  # type: ignore[assignment]
            metrics.updated_at = utc_now()
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_mode_changed",
                actor=actor,
                summary=f"Omega governance mode changed to {mode}.",
                risk_score=54 if mode == "full_autonomous" else 32,
                metadata={"reason": reason or "operator changed mode"},
            )
            self._events.append(event)
            self._persist()
            return event, self.governance(metrics.tenant_id)

    def run_planetary_demo(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[OmegaEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            event = OmegaEvent(
                tenant_id=metrics.tenant_id,
                action="omega_planetary_demo_run",
                actor=actor,
                summary="Omega planetary demo launched.",
                risk_score=10,
                metadata={"compound_intelligence_score": metrics.compound_intelligence_score},
            )
            self._events.append(event)
            self._persist()
            return event, {
                "sequence": [
                    "Earth twin lights up 195 countries",
                    "Global threat engine ranks compound risks",
                    "Future timeline forecasts 24h to 10y",
                    "Recursive optimizer improves recovery ETA",
                    "Human-governed superintelligence locks safety objective",
                ],
                "compound_intelligence_score": metrics.compound_intelligence_score,
            }

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        with self._lock:
            if self._loaded:
                return
            if self.path.exists():
                try:
                    payload = json.loads(self.path.read_text(encoding="utf-8"))
                except (OSError, json.JSONDecodeError):
                    payload = {}
                for item in payload.get("metrics", []):
                    metric = OmegaMetrics(tenant_id=item["tenant_id"])
                    for key, value in item.items():
                        if hasattr(metric, key):
                            setattr(metric, key, value)
                    self._metrics[metric.tenant_id] = metric
                self._events = [
                    OmegaEvent(
                        tenant_id=item.get("tenant_id", "TEN-BALA-UNI"),
                        action=item.get("action", "omega_event"),
                        actor=item.get("actor", "system"),
                        summary=item.get("summary", "Omega OS event"),
                        risk_score=int(item.get("risk_score", 38)),
                        event_id=item.get("event_id"),
                        created_at=item.get("created_at"),
                        metadata=item.get("metadata", {}),
                    )
                    for item in payload.get("events", [])
                ]
            self._loaded = True

    def _persist(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "metrics": [metric.as_dict() for metric in self._metrics.values()],
            "events": [event.as_dict() for event in self._events[-120:]],
        }
        self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


omega_store = OmegaStore()

