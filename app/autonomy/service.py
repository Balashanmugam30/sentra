"""Tenant-scoped service layer for Sentra Autonomy OS."""

from __future__ import annotations

import json
from pathlib import Path
from threading import RLock
from typing import Any

from app.core.config import settings

from .explainability import build_explainability
from .governance_engine import build_governance
from .learning_engine import build_learning, run_learning_cycle
from .memory_engine import build_memory
from .models import AutonomyEvent, AutonomyMetrics, GovernanceOverride, utc_now
from .objective_engine import build_objectives
from .planning_engine import build_plan
from .prediction_engine import build_prediction
from .self_healing import build_self_healing, run_heal
from .simulation_engine import build_branches

DEFAULT_TENANTS = ["TEN-BALA-UNI", "TEN-BALA-MFG", "TEN-BALA-HOSPITAL", "TEN-GOVSEC-SOUTH"]


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if identity.get("role") == "super_admin":
        return list(DEFAULT_TENANTS)
    return [str(tenant["tenant_id"])]


class AutonomyStore:
    def __init__(self) -> None:
        self.path = Path(settings.sentra_autonomy_store_path)
        self._lock = RLock()
        self._loaded = False
        self._metrics: dict[str, AutonomyMetrics] = {}
        self._events: list[AutonomyEvent] = []
        self._overrides: list[GovernanceOverride] = []

    def seed_demo(self) -> None:
        with self._lock:
            self._ensure_loaded()
            changed = False
            for tenant_id in DEFAULT_TENANTS:
                if tenant_id not in self._metrics:
                    self._metrics[tenant_id] = AutonomyMetrics(tenant_id=tenant_id)
                    changed = True
            if not self._events:
                self._events.append(
                    AutonomyEvent(
                        tenant_id="TEN-BALA-UNI",
                        action="learning_cycle_run",
                        actor="system",
                        summary="Initial autonomy memory weights seeded from accepted crisis outcomes.",
                        risk_score=18,
                    )
                )
                changed = True
            if not self._overrides:
                self._overrides.append(
                    GovernanceOverride(
                        tenant_id="TEN-BALA-UNI",
                        actor="operations_commander",
                        reason="Kept evacuation corridor open during crowd pressure drill.",
                        risk_score=42,
                        mode="approval_required",
                    )
                )
                changed = True
            if changed:
                self._persist()

    def tenant_scope(self, tenant_id: str | None, super_admin: bool = False) -> list[str]:
        self._ensure_loaded()
        if super_admin:
            return list(self._metrics.keys()) or DEFAULT_TENANTS
        return [tenant_id or "TEN-BALA-UNI"]

    def metrics(self, tenant_id: str | None, super_admin: bool = False) -> AutonomyMetrics:
        scope = self.tenant_scope(tenant_id, super_admin)
        selected = scope[0] if scope else "TEN-BALA-UNI"
        with self._lock:
            if selected not in self._metrics:
                self._metrics[selected] = AutonomyMetrics(tenant_id=selected)
                self._persist()
            return self._metrics[selected]

    def live(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        objectives = build_objectives(metrics)
        plan = build_plan(metrics)
        prediction = build_prediction(metrics)
        trust = build_trust_summary(metrics)
        health = build_self_healing(metrics)
        explain = build_explainability(metrics)
        return {
            "generated_at": utc_now(),
            "metrics": metrics.as_dict(),
            "top_decision": {
                "title": "Execute corridor-first containment",
                "urgency": 84,
                "confidence": 90,
                "approval_required": metrics.autonomy_mode in {"approval_required", "semi_auto"},
                "why": explain["expected_gain"],
            },
            "active_objective": objectives["active_objective"],
            "plan_summary": {
                "campaign_status": plan["campaign_status"],
                "fifteen_minute_actions": len(plan["fifteen_minute_plan"]),
                "sixty_minute_actions": len(plan["sixty_minute_campaign"]),
                "resource_actions": len(plan["resource_plan"]),
            },
            "prediction_summary": {
                "escalation_probability": prediction["escalation_probability"],
                "recovery_eta_minutes": prediction["recovery_eta_minutes"],
                "prediction_accuracy_percent": prediction["prediction_accuracy_percent"],
            },
            "trust_summary": trust,
            "health_summary": {
                "system_posture": health["system_posture"],
                "self_heal_success_percent": health["self_heal_success_percent"],
                "active_actions": len([item for item in health["actions"] if item["status"] == "active"]),
            },
            "reasoning_summary": "Autonomy OS selected fastest safe recovery based on memory outcomes, live route pressure, responder ETA, and governance mode.",
            "recommended_actions": [
                {
                    "action": "Approve corridor-first containment",
                    "urgency": 84,
                    "confidence": 90,
                    "expected_impact": "reduces recovery ETA to 11 minutes",
                },
                {
                    "action": "Run verified public advisory",
                    "urgency": 71,
                    "confidence": 86,
                    "expected_impact": "prevents rumor cascade",
                },
                {
                    "action": "Keep self-heal cache guard active",
                    "urgency": 63,
                    "confidence": 96,
                    "expected_impact": "prevents dashboard stale blanking",
                },
            ],
        }

    def memory(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_memory(self.metrics(tenant_id, super_admin))

    def objectives(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_objectives(self.metrics(tenant_id, super_admin))

    def plan(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_plan(self.metrics(tenant_id, super_admin))

    def predict(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_prediction(self.metrics(tenant_id, super_admin))

    def learning(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_learning(self.metrics(tenant_id, super_admin))

    def trust(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_trust_summary(self.metrics(tenant_id, super_admin), detailed=True)

    def health(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_self_healing(self.metrics(tenant_id, super_admin))

    def governance(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        metrics = self.metrics(tenant_id, super_admin)
        overrides = [item for item in self._overrides if item.tenant_id == metrics.tenant_id]
        return build_governance(metrics, overrides)

    def explain(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_explainability(self.metrics(tenant_id, super_admin))

    def branches(self, tenant_id: str | None, super_admin: bool = False) -> dict[str, Any]:
        return build_branches(self.metrics(tenant_id, super_admin))

    def set_objective(self, tenant_id: str | None, objective: str, actor: str, reason: str | None, super_admin: bool = False) -> tuple[AutonomyEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            metrics.current_objective = objective
            metrics.updated_at = utc_now()
            event = AutonomyEvent(
                tenant_id=metrics.tenant_id,
                action="objective_set",
                actor=actor,
                summary=f"Autonomy objective set to {objective}.",
                risk_score=24,
                metadata={"reason": reason or "operator selected objective"},
            )
            self._events.append(event)
            self._persist()
            return event, self.objectives(metrics.tenant_id)

    def run_learning(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[AutonomyEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            data = run_learning_cycle(metrics)
            metrics.updated_at = utc_now()
            event = AutonomyEvent(
                tenant_id=metrics.tenant_id,
                action="learning_cycle_run",
                actor=actor,
                summary="Learning cycle completed and playbook weights improved.",
                risk_score=12,
                metadata={"playbooks_learned": metrics.playbooks_learned},
            )
            self._events.append(event)
            self._persist()
            return event, data

    def run_heal(self, tenant_id: str | None, actor: str, super_admin: bool = False) -> tuple[AutonomyEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            data = run_heal(metrics)
            metrics.updated_at = utc_now()
            event = AutonomyEvent(
                tenant_id=metrics.tenant_id,
                action="self_heal_run",
                actor=actor,
                summary="Self-healing core refreshed stale guards, sockets, and cache posture.",
                risk_score=16,
                metadata={"self_heal_success_percent": metrics.self_heal_success_percent},
            )
            self._events.append(event)
            self._persist()
            return event, data

    def set_mode(self, tenant_id: str | None, mode: str, actor: str, reason: str | None, super_admin: bool = False) -> tuple[AutonomyEvent, dict[str, Any]]:
        with self._lock:
            metrics = self.metrics(tenant_id, super_admin)
            metrics.autonomy_mode = mode  # type: ignore[assignment]
            metrics.updated_at = utc_now()
            override = GovernanceOverride(
                tenant_id=metrics.tenant_id,
                actor=actor,
                reason=reason or f"Mode changed to {mode}",
                risk_score=48 if mode in {"full_auto", "lockdown_mode"} else 28,
                mode=metrics.autonomy_mode,
            )
            self._overrides.append(override)
            event = AutonomyEvent(
                tenant_id=metrics.tenant_id,
                action="autonomy_mode_set",
                actor=actor,
                summary=f"Autonomy governance mode set to {mode}.",
                risk_score=override.risk_score,
                metadata={"override_id": override.override_id, "reason": override.reason},
            )
            self._events.append(event)
            self._persist()
            return event, self.governance(metrics.tenant_id)

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        with self._lock:
            if self._loaded:
                return
            if not self.path.exists():
                self.path.parent.mkdir(parents=True, exist_ok=True)
                self._loaded = True
                return
            try:
                payload = json.loads(self.path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                self._loaded = True
                return
            for item in payload.get("metrics", []):
                metric = AutonomyMetrics(tenant_id=item["tenant_id"])
                for key, value in item.items():
                    if hasattr(metric, key):
                        setattr(metric, key, value)
                self._metrics[metric.tenant_id] = metric
            self._events = [
                AutonomyEvent(
                    tenant_id=item.get("tenant_id", "TEN-BALA-UNI"),
                    action=item.get("action", "event"),
                    actor=item.get("actor", "system"),
                    summary=item.get("summary", "Autonomy event"),
                    risk_score=int(item.get("risk_score", 20)),
                    event_id=item.get("event_id"),
                    created_at=item.get("created_at"),
                    metadata=item.get("metadata", {}),
                )
                for item in payload.get("events", [])
            ]
            self._overrides = [
                GovernanceOverride(
                    tenant_id=item.get("tenant_id", "TEN-BALA-UNI"),
                    actor=item.get("actor", "system"),
                    reason=item.get("reason", "Autonomy override"),
                    risk_score=int(item.get("risk_score", 40)),
                    mode=item.get("mode", "approval_required"),
                    override_id=item.get("override_id"),
                    timestamp=item.get("timestamp"),
                )
                for item in payload.get("overrides", [])
            ]
            self._loaded = True

    def _persist(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "metrics": [item.as_dict() for item in self._metrics.values()],
            "events": [item.as_dict() for item in self._events[-80:]],
            "overrides": [item.as_dict() for item in self._overrides[-80:]],
        }
        self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def build_trust_summary(metrics: AutonomyMetrics, detailed: bool = False) -> dict[str, Any]:
    from .trust_engine import build_trust

    trust = build_trust(metrics)
    if detailed:
        return trust
    return {
        "trust_score": trust["trust_score"],
        "accepted_percent": trust["accepted_percent"],
        "manual_override_percent": trust["manual_override_percent"],
        "board_confidence": trust["board_confidence"],
    }


autonomy_store = AutonomyStore()
