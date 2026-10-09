# tests/test_operational_e2e_path.py
"""
End-to-End Operational Golden Path & Concurrency Protection Suite (Phase 8).
Validates the complete operational lifecycle:
Incident Ingestion -> Playbook Matching -> Plan Generation -> Safety Gate Evaluation
-> Action Proposal -> Operator Approval (Two-Person Rule) -> Idempotent Dispatch
-> Receipt Generation -> Cryptographic Hash-Chain Verification -> Audit Event Ledger.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.auth.security import create_access_token, hash_password
from app.auth.store import auth_store
from app.core.config import settings
from app.main import app
from app.operations.domain import (
    ActionProposalRecord,
    ActionRiskLevel,
    ActionType,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    SafetyDecision,
)
from app.operations.persistence import persistence
from app.operations.state_machine import lease_manager
from app.operations.store import operations_store
from app.services.incident_service import create_incident, get_all_incidents


@pytest.fixture(autouse=True)
def setup_persistence_and_state():
    """Reset persistence before each test for total test isolation."""
    persistence.clear_all_for_tests()
    operations_store.set_autonomy_mode(AutonomyMode.MODE_1_RECOMMEND, "system", "Test init")
    operations_store.set_kill_switch(engaged=False, actor_id="system", reason="Test init")
    yield
    persistence.clear_all_for_tests()


@pytest.fixture
def initiator_headers():
    admin = auth_store.get_user_by_email("admin@sentra.local")
    if not admin:
        admin = auth_store.create_user(
            name="Sentra Admin",
            email="admin@sentra.local",
            password_hash=hash_password("AdminPass123!"),
            role="super_admin",
        )
    token, _ = create_access_token(
        user_id=str(admin["user_id"]),
        email=str(admin["email"]),
        role=str(admin["role"]),
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def commander_approver_headers():
    approver = auth_store.get_user_by_email("commander@sentra.local")
    if not approver:
        approver = auth_store.create_user(
            name="Commander Sarah",
            email="commander@sentra.local",
            password_hash=hash_password("CommanderPass123!"),
            role="operations_commander",
        )
    else:
        auth_store.update_user(approver["user_id"], role="operations_commander")
    token, _ = create_access_token(
        user_id=str(approver["user_id"]),
        email=str(approver["email"]),
        role="operations_commander",
    )
    return {"Authorization": f"Bearer {token}"}


def test_operational_golden_path_full_lifecycle(initiator_headers, commander_approver_headers):
    """
    Validates complete golden path from incident trigger to verified cryptographic receipt.
    """
    client = TestClient(app)

    # 1. Probe readiness & durability before starting
    readiness = client.get(f"{settings.api_prefix}/operations/readiness", headers=initiator_headers)
    assert readiness.status_code == 200
    assert readiness.json()["status"] == "ready"
    assert readiness.json()["durability"]["backend"] == "sqlite3_wal"

    # 2. Ingest / Select Incident
    incident_id = "INC-TEST-01"

    # 3. Trigger Autonomous Orchestration
    orch_resp = client.post(
        f"{settings.api_prefix}/operations/incidents/{incident_id}/orchestrate",
        json={"simulated": False},
        headers=initiator_headers,
    )
    assert orch_resp.status_code == 200
    orch_data = orch_resp.json()
    assert orch_data["incident_id"] == incident_id
    assert "proposals" in orch_data
    assert len(orch_data["proposals"]) > 0

    proposals = orch_data["proposals"]
    proposal_id = proposals[0]["id"]

    # 4. Attempt unapproved live execution -> MUST fail with 403
    fail_exec = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": "IDEMP-E2E-PREMATURE", "is_simulation": False},
        headers=initiator_headers,
    )
    assert fail_exec.status_code == 403

    # 5. Commander approves proposal
    approve_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/approve",
        json={"notes": "Authorized by Field Incident Commander"},
        headers=commander_approver_headers,
    )
    assert approve_resp.status_code == 200
    appr_data = approve_resp.json()
    assert appr_data["status"] == "APPROVED"
    assert appr_data["approved_by"] is not None
    assert appr_data["approval_hash"] is not None

    # 6. Execute approved proposal with idempotency key
    idemp_key = f"IDEMP-E2E-{proposal_id[:8]}"
    exec_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": idemp_key, "is_simulation": True},
        headers=commander_approver_headers,
    )
    assert exec_resp.status_code == 200
    exec_data = exec_resp.json()
    assert exec_data["status"] == "executed"
    assert exec_data["outcome"] in ("SUCCESS", "SIMULATED", "UNCONFIGURED")

    # 7. Replay attack: execute again with SAME idempotency key -> MUST return cached replay
    replay_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": idemp_key, "is_simulation": True},
        headers=commander_approver_headers,
    )
    assert replay_resp.status_code == 200
    replay_data = replay_resp.json()
    assert replay_data["status"] == "idempotent_replay"

    # 8. Cryptographic timeline audit verification
    verify_resp = client.get(f"{settings.api_prefix}/operations/timeline/verify", headers=initiator_headers)
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["status"] == "valid"
    assert verify_data["tamper_detected"] is False
    assert verify_data["verified_events_count"] >= 2
    assert verify_data["error"] is None


def test_kill_switch_tripped_midway_blocks_dispatch(initiator_headers, commander_approver_headers):
    """
    If kill-switch is engaged after proposal approval, execution is strictly blocked.
    """
    client = TestClient(app)
    incident_id = "INC-TEST-01"

    # Orchestrate to get an approved proposal
    orch_resp = client.post(
        f"{settings.api_prefix}/operations/incidents/{incident_id}/orchestrate",
        json={"simulated": False},
        headers=initiator_headers,
    )
    assert orch_resp.status_code == 200
    proposal_id = orch_resp.json()["proposals"][0]["id"]

    # Approve proposal
    appr_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/approve",
        json={"notes": "Approved for test"},
        headers=commander_approver_headers,
    )
    assert appr_resp.status_code == 200

    # Trip central emergency kill switch
    trip_resp = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        json={"engaged": True, "reason": "Immediate field hazard; operator trip"},
        headers=initiator_headers,
    )
    assert trip_resp.status_code == 200
    assert trip_resp.json()["kill_switch_engaged"] is True

    # Attempt execution -> MUST be rejected due to kill-switch (403 Safety Gate deny)
    blocked_exec = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": "IDEMP-KS-BLOCKED", "is_simulation": False},
        headers=commander_approver_headers,
    )
    assert blocked_exec.status_code == 403
    assert "kill switch" in blocked_exec.json()["detail"].lower()

    # Reset kill-switch
    reset_resp = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        json={"engaged": False, "reason": "Hazard cleared by incident commander"},
        headers=initiator_headers,
    )
    assert reset_resp.status_code == 200
    assert reset_resp.json()["kill_switch_engaged"] is False

    # Execution in simulation now succeeds
    success_exec = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": "IDEMP-KS-RESUMED", "is_simulation": True},
        headers=commander_approver_headers,
    )
    assert success_exec.status_code == 200


def test_proposal_rejection_lifecycle(initiator_headers, commander_approver_headers):
    """Rejection path prevents subsequent approval or dispatch."""
    client = TestClient(app)
    incident_id = "INC-TEST-01"

    orch_resp = client.post(
        f"{settings.api_prefix}/operations/incidents/{incident_id}/orchestrate",
        json={"simulated": False},
        headers=initiator_headers,
    )
    proposal_id = orch_resp.json()["proposals"][0]["id"]

    # Reject proposal
    reject_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/reject",
        json={"rejection_reason": "Personnel currently in targeted evacuation zone"},
        headers=commander_approver_headers,
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"

    # Subsequent approval must fail (400 or 403 or 409)
    fail_appr = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/approve",
        json={"notes": "Try approving"},
        headers=commander_approver_headers,
    )
    assert fail_appr.status_code in (400, 403, 409)

    # Subsequent execution must fail
    fail_exec = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        json={"idempotency_key": "IDEMP-REJECTED-EXEC", "is_simulation": True},
        headers=commander_approver_headers,
    )
    assert fail_exec.status_code in (400, 403, 409)


def test_lease_concurrency_isolation():
    """Validates incident lease mutual exclusion."""
    incident_id = "INC-LEASE-MUTEX-01"

    # Acquire lease by worker 1
    acquired = lease_manager.acquire_lease(incident_id, holder_id="worker_1", ttl_seconds=10.0)
    assert acquired is True

    # Worker 2 attempts acquisition on same incident -> MUST fail
    acquired_2 = lease_manager.acquire_lease(incident_id, holder_id="worker_2", ttl_seconds=10.0)
    assert acquired_2 is False

    # Release lease by worker 1
    released = lease_manager.release_lease(incident_id, holder_id="worker_1")
    assert released is True

    # Worker 2 can now acquire lease
    acquired_after = lease_manager.acquire_lease(incident_id, holder_id="worker_2", ttl_seconds=10.0)
    assert acquired_after is True
