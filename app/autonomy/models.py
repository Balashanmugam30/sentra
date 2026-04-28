"""In-memory/domain models for the Autonomy OS module."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

AutonomyMode = Literal["advisory", "approval_required", "semi_auto", "full_auto", "lockdown_mode"]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class AutonomyMetrics:
    tenant_id: str
    decision_supremacy: int = 94
    trust_score: int = 88
    learning_improvement_percent: int = 14
    accepted_decisions_percent: int = 71
    rejected_decisions_percent: int = 12
    override_rate_percent: int = 17
    best_objective: str = "fastest recovery"
    avg_recovery_eta_minutes: int = 11
    playbooks_learned: int = 37
    prediction_accuracy_percent: int = 89
    self_heal_success_percent: int = 96
    human_confidence: int = 91
    board_confidence: int = 86
    current_objective: str = "fastest recovery"
    autonomy_mode: AutonomyMode = "approval_required"
    updated_at: str = field(default_factory=utc_now)

    def as_dict(self) -> dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "decision_supremacy": self.decision_supremacy,
            "trust_score": self.trust_score,
            "learning_improvement_percent": self.learning_improvement_percent,
            "accepted_decisions_percent": self.accepted_decisions_percent,
            "rejected_decisions_percent": self.rejected_decisions_percent,
            "override_rate_percent": self.override_rate_percent,
            "best_objective": self.best_objective,
            "avg_recovery_eta_minutes": self.avg_recovery_eta_minutes,
            "playbooks_learned": self.playbooks_learned,
            "prediction_accuracy_percent": self.prediction_accuracy_percent,
            "self_heal_success_percent": self.self_heal_success_percent,
            "human_confidence": self.human_confidence,
            "board_confidence": self.board_confidence,
            "current_objective": self.current_objective,
            "autonomy_mode": self.autonomy_mode,
            "updated_at": self.updated_at,
        }


@dataclass(slots=True)
class AutonomyEvent:
    tenant_id: str
    action: str
    actor: str
    summary: str
    risk_score: int = 34
    event_id: str = field(default_factory=lambda: f"AUTO-EVT-{uuid4().hex[:8].upper()}")
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


@dataclass(slots=True)
class GovernanceOverride:
    tenant_id: str
    actor: str
    reason: str
    risk_score: int
    mode: AutonomyMode
    override_id: str = field(default_factory=lambda: f"AUTO-OVR-{uuid4().hex[:8].upper()}")
    timestamp: str = field(default_factory=utc_now)

    def as_dict(self) -> dict[str, Any]:
        return {
            "override_id": self.override_id,
            "tenant_id": self.tenant_id,
            "actor": self.actor,
            "reason": self.reason,
            "risk_score": self.risk_score,
            "mode": self.mode,
            "timestamp": self.timestamp,
        }

