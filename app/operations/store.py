"""Operations persistent store, recovery manager, and startup reconciliation."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
from threading import Lock
from typing import Dict, List, Optional

from app.operations.domain import (
    ActionProposalRecord,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    ResponsePlanRecord,
)
from app.operations.state_machine import validate_transition
from app.operations.timeline import timeline_store

logger = logging.getLogger(__name__)

DATA_DIR = Path("data/operations")


class OperationsStore:
    """Thread-safe persistent repository for operations state, plans, proposals, and autonomy settings."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._autonomy_state = AutonomyState(
            mode=AutonomyMode.MODE_1_RECOMMEND,
            kill_switch_engaged=False,
            last_updated_at=datetime.now(timezone.utc),
            updated_by="system_init",
            reason="Initial startup in Mode 1 (Recommend)",
        )
        # incident_id -> current OperationLifecycleStatus
        self._incident_states: Dict[str, OperationLifecycleStatus] = {}
        # plan_id -> ResponsePlanRecord
        self._plans: Dict[str, ResponsePlanRecord] = {}
        # proposal_id -> ActionProposalRecord
        self._proposals: Dict[str, ActionProposalRecord] = {}

        # Reconcile on initialization
        self.reconcile_startup_state()

    def get_autonomy_state(self) -> AutonomyState:
        with self._lock:
            return self._autonomy_state.model_copy()

    def set_autonomy_mode(self, mode: AutonomyMode, updated_by: str, reason: str) -> AutonomyState:
        with self._lock:
            self._autonomy_state.mode = mode
            self._autonomy_state.updated_by = updated_by
            self._autonomy_state.reason = reason
            self._autonomy_state.last_updated_at = datetime.now(timezone.utc)
            timeline_store.append_event(
                incident_id="GLOBAL",
                event_type="AUTONOMY_MODE_CHANGED",
                source="operator_console",
                actor_id=updated_by,
                actor_role="commander",
                summary=f"Autonomy Mode changed to {mode.value}: {reason}",
                details={"mode": mode.value, "reason": reason},
            )
            return self._autonomy_state.model_copy()

    def set_kill_switch(self, engaged: bool, actor_id: str, reason: str) -> AutonomyState:
        with self._lock:
            self._autonomy_state.kill_switch_engaged = engaged
            self._autonomy_state.last_updated_at = datetime.now(timezone.utc)
            if engaged:
                self._autonomy_state.kill_switch_tripped_at = datetime.now(timezone.utc)
                self._autonomy_state.kill_switch_tripped_by = actor_id
                self._autonomy_state.kill_switch_reason = reason
            else:
                self._autonomy_state.kill_switch_tripped_at = None
                self._autonomy_state.kill_switch_tripped_by = None
                self._autonomy_state.kill_switch_reason = None

            timeline_store.append_event(
                incident_id="GLOBAL",
                event_type="KILL_SWITCH_TRIPPED" if engaged else "KILL_SWITCH_RESET",
                source="operator_console",
                actor_id=actor_id,
                actor_role="commander",
                summary=f"Emergency Kill Switch {'ENGAGED' if engaged else 'RESET'} by {actor_id}: {reason}",
                details={"engaged": engaged, "reason": reason},
            )
            return self._autonomy_state.model_copy()

    def get_incident_state(self, incident_id: str) -> OperationLifecycleStatus:
        with self._lock:
            return self._incident_states.get(incident_id, OperationLifecycleStatus.OPEN)

    def transition_incident_state(
        self,
        incident_id: str,
        target_state: OperationLifecycleStatus,
        actor_id: str,
        reason: str,
    ) -> OperationLifecycleStatus:
        with self._lock:
            current_state = self._incident_states.get(incident_id, OperationLifecycleStatus.OPEN)
            validate_transition(current_state, target_state, details=reason)
            self._incident_states[incident_id] = target_state

            timeline_store.append_event(
                incident_id=incident_id,
                event_type="OPERATIONAL_STATE_TRANSITION",
                source="operations_state_machine",
                actor_id=actor_id,
                actor_role="commander",
                summary=f"Incident transitioned from {current_state.value} to {target_state.value}: {reason}",
                details={"from_state": current_state.value, "to_state": target_state.value, "reason": reason},
            )
            return target_state

    def save_plan(self, plan: ResponsePlanRecord) -> None:
        with self._lock:
            self._plans[plan.plan_id] = plan
            for prop in plan.proposals:
                self._proposals[prop.id] = prop

    def get_plan(self, plan_id: str) -> Optional[ResponsePlanRecord]:
        with self._lock:
            return self._plans.get(plan_id)

    def get_latest_plan_for_incident(self, incident_id: str) -> Optional[ResponsePlanRecord]:
        with self._lock:
            incident_plans = [p for p in self._plans.values() if p.incident_id == incident_id]
            if not incident_plans:
                return None
            return sorted(incident_plans, key=lambda p: p.created_at, reverse=True)[0]

    def get_proposal(self, proposal_id: str) -> Optional[ActionProposalRecord]:
        with self._lock:
            return self._proposals.get(proposal_id)

    def list_proposals(
        self,
        incident_id: Optional[str] = None,
        status: Optional[OperationLifecycleStatus] = None,
    ) -> List[ActionProposalRecord]:
        with self._lock:
            proposals = list(self._proposals.values())
            if incident_id:
                proposals = [p for p in proposals if p.incident_id == incident_id]
            if status:
                proposals = [p for p in proposals if p.status == status]
            return sorted(proposals, key=lambda p: p.created_at, reverse=True)

    def update_proposal(self, proposal: ActionProposalRecord) -> None:
        with self._lock:
            self._proposals[proposal.id] = proposal
            # Update inside any associated plan
            for plan in self._plans.values():
                for i, p in enumerate(plan.proposals):
                    if p.id == proposal.id:
                        plan.proposals[i] = proposal
                        break

    def reconcile_startup_state(self) -> None:
        """
        Scans for in-flight executions that might have been interrupted by an unexpected worker or server restart.
        Any proposal stuck in EXECUTING is reconciled to FAILED / EXECUTION_OUTCOME_UNKNOWN.
        """
        with self._lock:
            for prop_id, prop in list(self._proposals.items()):
                if prop.status == OperationLifecycleStatus.EXECUTING:
                    logger.warning(
                        "Reconciling orphaned in-flight proposal %s on server startup -> EXECUTION_OUTCOME_UNKNOWN",
                        prop_id,
                    )
                    prop.status = OperationLifecycleStatus.FAILED
                    prop.execution_outcome = AdapterOutcome.EXECUTION_OUTCOME_UNKNOWN
                    prop.rejection_reason = (
                        "Interrupted by system restart during execution. Manual reconciliation required."
                    )
                    timeline_store.append_event(
                        incident_id=prop.incident_id,
                        event_type="STARTUP_RECONCILIATION",
                        source="operations_recovery",
                        actor_id="system",
                        actor_role="system",
                        summary=f"Reconciled orphaned action {prop.title} to EXECUTION_OUTCOME_UNKNOWN following server startup.",
                        details={"proposal_id": prop_id, "previous_status": "EXECUTING"},
                    )

    def reset_for_tests(self) -> None:
        """Resets store for clean test suites."""
        with self._lock:
            self._plans.clear()
            self._proposals.clear()
            self._incident_states.clear()
            self._autonomy_state = AutonomyState(
                mode=AutonomyMode.MODE_1_RECOMMEND,
                kill_switch_engaged=False,
                last_updated_at=datetime.now(timezone.utc),
                updated_by="test_reset",
                reason="Test reset",
            )
            timeline_store.clear()


operations_store = OperationsStore()
