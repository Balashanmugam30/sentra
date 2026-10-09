# app/operations/store.py
"""Operations persistent store, recovery manager, and startup reconciliation."""

from __future__ import annotations

import logging
from typing import List, Optional

from app.operations.domain import (
    ActionProposalRecord,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    ResponsePlanRecord,
)
from app.operations.persistence import OperationsPersistence, persistence
from app.operations.state_machine import validate_transition
from app.operations.timeline import timeline_store

logger = logging.getLogger(__name__)


class OperationsStore:
    """
    Durable, thread-safe repository for operations state, plans, proposals,
    and autonomy settings backed by ACID-compliant SQLite WAL persistence.
    """

    def __init__(self, persistence_layer: Optional[OperationsPersistence] = None) -> None:
        self._persistence = persistence_layer or persistence
        # Reconcile any orphaned in-flight executions on initialization
        self.reconcile_startup_state()

    def get_autonomy_state(self) -> AutonomyState:
        return self._persistence.get_autonomy_state()

    def set_autonomy_mode(
        self, mode: AutonomyMode, updated_by: str, reason: str, tenant_id: str = "SYSTEM"
    ) -> AutonomyState:
        state = self._persistence.set_autonomy_mode(mode=mode, updated_by=updated_by, reason=reason)
        timeline_store.append_event(
            incident_id="GLOBAL",
            tenant_id=tenant_id,
            event_type="AUTONOMY_MODE_CHANGED",
            source="operator_console",
            actor_id=updated_by,
            actor_role="commander",
            summary=f"Autonomy Mode changed to {mode.value}: {reason}",
            details={"mode": mode.value, "reason": reason},
        )
        return state

    def set_kill_switch(
        self, engaged: bool, actor_id: str, reason: str, tenant_id: str = "SYSTEM"
    ) -> AutonomyState:
        state = self._persistence.set_kill_switch(engaged=engaged, actor_id=actor_id, reason=reason)
        timeline_store.append_event(
            incident_id="GLOBAL",
            tenant_id=tenant_id,
            event_type="KILL_SWITCH_TRIPPED" if engaged else "KILL_SWITCH_RESET",
            source="operator_console",
            actor_id=actor_id,
            actor_role="commander",
            summary=f"Emergency Kill Switch {'ENGAGED' if engaged else 'RESET'} by {actor_id}: {reason}",
            details={"engaged": engaged, "reason": reason},
        )
        return state

    def get_incident_state(self, incident_id: str, tenant_id: Optional[str] = None) -> OperationLifecycleStatus:
        return self._persistence.get_incident_state(incident_id=incident_id, tenant_id=tenant_id)

    def transition_incident_state(
        self,
        incident_id: str,
        target_state: OperationLifecycleStatus,
        actor_id: str,
        reason: str,
        tenant_id: str = "SYSTEM",
    ) -> OperationLifecycleStatus:
        current_state = self._persistence.get_incident_state(incident_id=incident_id, tenant_id=tenant_id)
        validate_transition(current_state, target_state, details=reason)
        self._persistence.set_incident_state(
            incident_id=incident_id,
            tenant_id=tenant_id,
            status=target_state,
            updated_by=actor_id,
        )

        timeline_store.append_event(
            incident_id=incident_id,
            tenant_id=tenant_id,
            event_type="OPERATIONAL_STATE_TRANSITION",
            source="operations_state_machine",
            actor_id=actor_id,
            actor_role="commander",
            summary=f"Incident transitioned from {current_state.value} to {target_state.value}: {reason}",
            details={"from_state": current_state.value, "to_state": target_state.value, "reason": reason},
        )
        return target_state

    def save_plan(self, plan: ResponsePlanRecord) -> None:
        self._persistence.save_plan(plan)

    def get_plan(self, plan_id: str, tenant_id: Optional[str] = None) -> Optional[ResponsePlanRecord]:
        return self._persistence.get_plan(plan_id=plan_id, tenant_id=tenant_id)

    def get_latest_plan_for_incident(
        self, incident_id: str, tenant_id: Optional[str] = None
    ) -> Optional[ResponsePlanRecord]:
        return self._persistence.get_latest_plan_for_incident(incident_id=incident_id, tenant_id=tenant_id)

    def get_proposal(self, proposal_id: str, tenant_id: Optional[str] = None) -> Optional[ActionProposalRecord]:
        return self._persistence.get_proposal(proposal_id=proposal_id, tenant_id=tenant_id)

    def list_proposals(
        self,
        tenant_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        status: Optional[OperationLifecycleStatus] = None,
    ) -> List[ActionProposalRecord]:
        return self._persistence.list_proposals(tenant_id=tenant_id, incident_id=incident_id, status=status)

    def update_proposal(self, proposal: ActionProposalRecord) -> None:
        self._persistence.update_proposal(proposal)

    def reconcile_startup_state(self) -> None:
        """
        Scans durable relational store on server boot for in-flight executions
        interrupted by unexpected worker crashes, container restarts, or deployments.
        Reconciles orphaned executions to FAILED / EXECUTION_OUTCOME_UNKNOWN.
        """
        in_flight = self._persistence.get_in_flight_proposals()
        for prop in in_flight:
            logger.warning(
                "DURABLE RECOVERY: Reconciling orphaned in-flight proposal %s on startup -> EXECUTION_OUTCOME_UNKNOWN",
                prop.id,
            )
            prop.status = OperationLifecycleStatus.FAILED
            prop.execution_outcome = AdapterOutcome.EXECUTION_OUTCOME_UNKNOWN
            prop.details["reconciled_on_boot"] = True
            prop.details["reconciled_reason"] = "Process or container reboot during active execution lease"
            self._persistence.update_proposal(prop)

            timeline_store.append_event(
                incident_id=prop.incident_id,
                tenant_id=prop.tenant_id,
                event_type="EXECUTION_RECONCILED_ON_BOOT",
                source="recovery_manager",
                actor_id="system_recovery",
                actor_role="system",
                summary=f"Reconciled in-flight proposal {prop.id} to EXECUTION_OUTCOME_UNKNOWN on server reboot.",
                details={"proposal_id": prop.id, "action_type": prop.action_type.value},
            )

    def reset_for_tests(self) -> None:
        """Resets durable store and autonomy state for test suites."""
        self._persistence.clear_all_for_tests()


operations_store = OperationsStore()
