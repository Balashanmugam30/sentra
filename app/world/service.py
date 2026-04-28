"""Tenant-scoped World Command Grid service."""

from __future__ import annotations

import json
from pathlib import Path
from threading import RLock
from typing import Any

from app.core.config import settings

from .climate import build_climate
from .diplomacy import build_diplomacy
from .earth_twin import build_countries, build_earth_twin
from .economy import build_economy
from .models import WorldEvent, WorldMetrics, utc_now
from .pandemic import build_pandemic
from .space import build_space
from .supply_chain import build_supply_chain
from .supremacy import build_continuity, build_supremacy
from .threat_grid import build_threats

DEFAULT_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSPITAL", "TEN-GOVSEC-SOUTH"]


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEFAULT_TENANTS)
    return [str(tenant["tenant_id"])]


class WorldStore:
    def __init__(self) -> None:
        self.path = Path(settings.sentra_world_store_path)
        self._lock = RLock()
        self._loaded = False
        self._metrics: dict[str, WorldMetrics] = {}
        self._events: list[WorldEvent] = []

    def seed_demo(self) -> None:
        with self._lock:
            self._ensure_loaded()
            changed = False
            for tenant_id in DEFAULT_TENANTS:
                if tenant_id not in self._metrics:
                    self._metrics[tenant_id] = WorldMetrics(tenant_id=tenant_id)
                    changed = True
            if not self._events:
                self._events.append(
                    WorldEvent(
                        tenant_id="TEN-BALA-UNI",
                        action="global_demo_started",
                        actor="system",
                        summary="World Command Grid demo posture initialized with 52 live countries.",
                        severity="low",
                    )
                )
                changed = True
            if changed:
                self._persist()

    def metrics(self, tenant_id: str | None, super_admin: bool = False) -> WorldMetrics:
        with self._lock:
            self._ensure_loaded()
            selected = "TEN-BALA-UNI" if super_admin else (tenant_id or "TEN-BALA-UNI")
            if selected not in self._metrics:
                self._metrics[selected] = WorldMetrics(tenant_id=selected)
                self._persist()
            return self._metrics[selected]

    def live(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        threats = build_threats(metrics)["threats"]
        return {
            "generated_at": utc_now(),
            "metrics": metrics.as_dict(),
            "earth_twin": build_earth_twin(metrics),
            "top_threats": threats[: metrics.threats_active],
            "continuity": build_continuity(metrics),
            "supremacy": build_supremacy(metrics),
            "recommended_actions": [
                {
                    "action": "Activate global continuity watch",
                    "priority": "critical",
                    "impact": "keeps economy, logistics, health, and diplomacy feeds fused",
                },
                {
                    "action": "Pre-stage Gulf and South Asia logistics routes",
                    "priority": "high",
                    "impact": "reduces supply-chain shock exposure",
                },
                {
                    "action": "Run diplomatic stabilization scenario",
                    "priority": "medium",
                    "impact": "improves trade recovery confidence",
                },
            ],
        }

    def threats(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_threats(self.metrics(tenant_id, super_admin))

    def countries(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_countries(self.metrics(tenant_id, super_admin))

    def economy(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_economy(self.metrics(tenant_id, super_admin))

    def supply_chain(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_supply_chain(self.metrics(tenant_id, super_admin))

    def climate(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_climate(self.metrics(tenant_id, super_admin))

    def pandemic(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_pandemic(self.metrics(tenant_id, super_admin))

    def space(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_space(self.metrics(tenant_id, super_admin))

    def diplomacy(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_diplomacy(self.metrics(tenant_id, super_admin))

    def continuity(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_continuity(self.metrics(tenant_id, super_admin))

    def supremacy(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_supremacy(self.metrics(tenant_id, super_admin))

    def run_global_simulation(self, tenant_id: str | None, actor: str, scenario: str | None, super_admin: bool = False) -> tuple[WorldEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            event = WorldEvent(
                tenant_id=metrics.tenant_id,
                action="world_simulation_run",
                actor=actor,
                summary=f"Global simulation executed for {scenario or 'multi-vector civilization shock'}.",
                severity="medium",
                metadata={"scenario": scenario or "multi_vector"},
            )
            self._events.append(event)
            self._persist()
            return event, {
                "scenario": scenario or "multi-vector civilization shock",
                "continuity_delta": "+3",
                "best_intervention": "combine diplomacy corridor, supply-chain reroute, and health readiness watch",
                "supremacy": build_supremacy(metrics),
            }

    def run_demo(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[WorldEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            metrics.generated_mode = "prestige_demo"
            metrics.updated_at = utc_now()
            event = WorldEvent(
                tenant_id=metrics.tenant_id,
                action="global_demo_started",
                actor=actor,
                summary="Prestige global demo mode launched.",
                severity="low",
                metadata={"supremacy_score": metrics.supremacy_score},
            )
            self._events.append(event)
            self._persist()
            return event, {
                "sequence": [
                    "Earth twin awakens",
                    "Global threats fuse into matrix",
                    "Supply chain reroutes",
                    "Diplomacy scenario stabilizes",
                    "Civilization continuity score locks",
                ],
                "supremacy_score": metrics.supremacy_score,
            }

    def reset(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[WorldEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            self._metrics[metrics.tenant_id] = WorldMetrics(tenant_id=metrics.tenant_id)
            event = WorldEvent(
                tenant_id=metrics.tenant_id,
                action="world_grid_reset",
                actor=actor,
                summary="World Command Grid reset to seeded global posture.",
                severity="low",
            )
            self._events.append(event)
            self._persist()
            return event, self.live(metrics.tenant_id)

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
                    metric = WorldMetrics(tenant_id=item["tenant_id"])
                    for key, value in item.items():
                        if hasattr(metric, key):
                            setattr(metric, key, value)
                    self._metrics[metric.tenant_id] = metric
                self._events = [
                    WorldEvent(
                        tenant_id=item.get("tenant_id", "TEN-BALA-UNI"),
                        action=item.get("action", "world_event"),
                        actor=item.get("actor", "system"),
                        summary=item.get("summary", "World command event"),
                        severity=item.get("severity", "medium"),
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
            "events": [event.as_dict() for event in self._events[-80:]],
        }
        self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


world_store = WorldStore()

