"""Operational state machine enforcing legal lifecycle transitions and concurrency guards."""

from __future__ import annotations

from datetime import datetime, timezone
import logging
from threading import Lock
from typing import Dict, Optional, Set, Tuple

from app.operations.domain import OperationLifecycleStatus

logger = logging.getLogger(__name__)


class IllegalStateTransitionError(ValueError):
    """Raised when an illegal lifecycle transition is attempted."""

    def __init__(
        self, current_state: OperationLifecycleStatus, target_state: OperationLifecycleStatus, details: str = ""
    ):
        message = f"Illegal operational state transition: cannot transition from {current_state.value} to {target_state.value}."
        if details:
            message += f" Details: {details}"
        super().__init__(message)
        self.current_state = current_state
        self.target_state = target_state


LEGAL_TRANSITIONS: Dict[OperationLifecycleStatus, Set[OperationLifecycleStatus]] = {
    OperationLifecycleStatus.OPEN: {
        OperationLifecycleStatus.ASSESSING,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.ASSESSING: {
        OperationLifecycleStatus.PLAN_READY,
        OperationLifecycleStatus.FAILED,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.PLAN_READY: {
        OperationLifecycleStatus.AWAITING_APPROVAL,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.AWAITING_APPROVAL: {
        OperationLifecycleStatus.APPROVED,
        OperationLifecycleStatus.REJECTED,
        OperationLifecycleStatus.EXPIRED,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.APPROVED: {
        OperationLifecycleStatus.EXECUTION_REQUESTED,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.EXECUTION_REQUESTED: {
        OperationLifecycleStatus.EXECUTING,
        OperationLifecycleStatus.FAILED,
        OperationLifecycleStatus.CANCELLED,
    },
    OperationLifecycleStatus.EXECUTING: {
        OperationLifecycleStatus.EXECUTED,
        OperationLifecycleStatus.FAILED,
    },
    OperationLifecycleStatus.EXECUTED: {
        OperationLifecycleStatus.VERIFYING,
        OperationLifecycleStatus.RESOLVED,
    },
    OperationLifecycleStatus.VERIFYING: {
        OperationLifecycleStatus.RESOLVED,
        OperationLifecycleStatus.ASSESSING,
    },
    OperationLifecycleStatus.FAILED: {
        OperationLifecycleStatus.ASSESSING,
        OperationLifecycleStatus.RESOLVED,
    },
    OperationLifecycleStatus.REJECTED: set(),
    OperationLifecycleStatus.EXPIRED: set(),
    OperationLifecycleStatus.CANCELLED: set(),
    OperationLifecycleStatus.RESOLVED: set(),
}


class ConcurrencyLeaseManager:
    """In-memory thread-safe lease manager to prevent race conditions during approvals and executions."""

    def __init__(self) -> None:
        self._lock = Lock()
        # entity_id -> (holder_id, expires_at_timestamp)
        self._leases: Dict[str, Tuple[str, float]] = {}

    def acquire_lease(self, entity_id: str, holder_id: str, ttl_seconds: float = 30.0) -> bool:
        now = datetime.now(timezone.utc).timestamp()
        with self._lock:
            existing = self._leases.get(entity_id)
            if existing is not None:
                existing_holder, expires_at = existing
                if existing_holder == holder_id:
                    # Refresh lease
                    self._leases[entity_id] = (holder_id, now + ttl_seconds)
                    return True
                if now < expires_at:
                    # Still locked by another holder
                    return False
            self._leases[entity_id] = (holder_id, now + ttl_seconds)
            return True

    def release_lease(self, entity_id: str, holder_id: str) -> bool:
        with self._lock:
            existing = self._leases.get(entity_id)
            if existing is not None and existing[0] == holder_id:
                del self._leases[entity_id]
                return True
            return False

    def is_locked(self, entity_id: str) -> bool:
        now = datetime.now(timezone.utc).timestamp()
        with self._lock:
            existing = self._leases.get(entity_id)
            if existing is not None:
                _, expires_at = existing
                return now < expires_at
            return False


lease_manager = ConcurrencyLeaseManager()


def validate_transition(
    current_state: OperationLifecycleStatus,
    target_state: OperationLifecycleStatus,
    details: str = "",
) -> None:
    """Validates that a transition from current_state to target_state is legal."""
    allowed = LEGAL_TRANSITIONS.get(current_state, set())
    if target_state not in allowed:
        logger.warning(
            "Rejected illegal state transition: %s -> %s (details=%s)",
            current_state.value,
            target_state.value,
            details,
        )
        raise IllegalStateTransitionError(current_state, target_state, details)
