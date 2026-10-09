# tests/test_security_hardening.py
"""
Comprehensive Phase 7 Zero-Trust Security, Tenant Isolation, and Reliability
Regression Test Suite for Sentra.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import sqlite3
import pytest
from starlette.testclient import TestClient

from app.auth.security import create_access_token, hash_password
from app.auth.store import auth_store
from app.core.config import settings
from app.core.security_network import is_safe_destination_url, validate_safe_url
from app.main import app
from app.operations.adapters import (
    EmergencyNotificationAdapter,
    IoTActuatorAdapter,
    SimulationAdapter,
    adapter_registry,
    idempotency_ledger,
)
from app.operations.backup import backup_manager
from app.operations.domain import (
    ActionProposalRecord,
    ActionRiskLevel,
    ActionReversibility,
    ActionType,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    ResponsePlanRecord,
    ResponsePlanStepRecord,
    SafetyDecision,
    compute_proposal_hash,
)
from app.operations.persistence import OperationsPersistence
from app.operations.safety_gate import safety_gate
from app.operations.store import operations_store
from app.operations.timeline import timeline_store


@pytest.fixture(autouse=True)
def reset_security_test_environment():
    """Resets durable database, idempotency ledger, and timeline before each test."""
    operations_store.reset_for_tests()
    idempotency_ledger.clear()
    timeline_store.clear()
    yield
    operations_store.reset_for_tests()
    idempotency_ledger.clear()
    timeline_store.clear()


@pytest.fixture
def tenant_tokens():
    """Creates authenticated tokens for two distinct tenants and an admin."""
    # Tenant Alpha User
    user_a = auth_store.get_user_by_email("alice@tenant-alpha.local")
    if not user_a:
        user_a = auth_store.create_user(
            name="Alice Alpha",
            email="alice@tenant-alpha.local",
            password_hash=hash_password("PassAlpha123!"),
            role="operations_commander",
        )
    token_a, _ = create_access_token(
        user_id=str(user_a["user_id"]),
        email=str(user_a["email"]),
        role=str(user_a["role"]),
        tenant_id="TEN-ALPHA",
    )

    # Tenant Alpha Approver (Separate Operator)
    user_a2 = auth_store.get_user_by_email("approver@tenant-alpha.local")
    if not user_a2:
        user_a2 = auth_store.create_user(
            name="Alpha Approver",
            email="approver@tenant-alpha.local",
            password_hash=hash_password("PassAlphaApprover123!"),
            role="security_manager",
        )
    token_a2, _ = create_access_token(
        user_id=str(user_a2["user_id"]),
        email=str(user_a2["email"]),
        role=str(user_a2["role"]),
        tenant_id="TEN-ALPHA",
    )

    # Tenant Beta User
    user_b = auth_store.get_user_by_email("bob@tenant-beta.local")
    if not user_b:
        user_b = auth_store.create_user(
            name="Bob Beta",
            email="bob@tenant-beta.local",
            password_hash=hash_password("PassBeta123!"),
            role="operations_commander",
        )
    token_b, _ = create_access_token(
        user_id=str(user_b["user_id"]),
        email=str(user_b["email"]),
        role=str(user_b["role"]),
        tenant_id="TEN-BETA",
    )

    # System Admin User
    admin = auth_store.get_user_by_email("sysadmin@sentra.local")
    if not admin:
        admin = auth_store.create_user(
            name="System Admin",
            email="sysadmin@sentra.local",
            password_hash=hash_password("AdminSecure999!"),
            role="super_admin",
        )
    token_admin, _ = create_access_token(
        user_id=str(admin["user_id"]),
        email=str(admin["email"]),
        role="super_admin",
        tenant_id="TEN-SYSTEM",
    )

    return {
        "tenant_a_user": user_a,
        "token_a": {"Authorization": f"Bearer {token_a}"},
        "tenant_a2_user": user_a2,
        "token_a2": {"Authorization": f"Bearer {token_a2}"},
        "tenant_b_user": user_b,
        "token_b": {"Authorization": f"Bearer {token_b}"},
        "token_admin": {"Authorization": f"Bearer {token_admin}"},
    }


# ==============================================================================
# 1. ZERO-TRUST UNIDENTIFIED REQUEST TESTS
# ==============================================================================


def test_unauthenticated_requests_rejected():
    """Confirms protected endpoints return HTTP 401 without bearer token."""
    client = TestClient(app)
    protected_urls = [
        f"{settings.api_prefix}/operations/mode",
        f"{settings.api_prefix}/operations/proposals",
        f"{settings.api_prefix}/operations/adapters",
        f"{settings.api_prefix}/operations/timeline",
        f"{settings.api_prefix}/operations/simulations/scenarios",
    ]
    for url in protected_urls:
        resp = client.get(url)
        assert resp.status_code == 401, f"Expected 401 on {url}, got {resp.status_code}"


def test_public_liveness_probe_accessible():
    """Confirms minimal public liveness probe is accessible without credentials."""
    client = TestClient(app)
    resp = client.get(f"{settings.api_prefix}/operations/liveness")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "sentra-operations"


# ==============================================================================
# 2. MULTI-TENANT ISOLATION & BOLA PREVENTION TESTS
# ==============================================================================


def test_multi_tenant_proposal_isolation(tenant_tokens):
    """Verifies Tenant B operator cannot see or access proposals created in Tenant A."""
    client = TestClient(app)

    now = datetime.now(timezone.utc)
    p_hash = compute_proposal_hash(
        action_type=ActionType.EVACUATION_ALERT.value,
        target_zone="Zone Alpha 1",
        parameters={"priority": "high"},
        incident_id="INC-ALPHA-01",
        tenant_id="TEN-ALPHA",
    )
    prop_a = ActionProposalRecord(
        id="PROP-ALPHA-01",
        incident_id="INC-ALPHA-01",
        tenant_id="TEN-ALPHA",
        title="Evacuation Broadcast Alpha",
        description="Evacuate Zone Alpha",
        action_type=ActionType.EVACUATION_ALERT,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="Zone Alpha 1",
        parameters={"priority": "high"},
        proposal_hash=p_hash,
        expires_at=now + timedelta(minutes=15),
        proposer_id=str(tenant_tokens["tenant_a_user"]["user_id"]),
    )
    operations_store.update_proposal(prop_a)

    # 1. Tenant A listing sees proposal
    resp_a = client.get(f"{settings.api_prefix}/operations/proposals", headers=tenant_tokens["token_a"])
    assert resp_a.status_code == 200
    proposals_a = resp_a.json()
    assert any(p["id"] == "PROP-ALPHA-01" for p in proposals_a)

    # 2. Tenant B listing CANNOT see Tenant A proposal
    resp_b = client.get(f"{settings.api_prefix}/operations/proposals", headers=tenant_tokens["token_b"])
    assert resp_b.status_code == 200
    proposals_b = resp_b.json()
    assert not any(p["id"] == "PROP-ALPHA-01" for p in proposals_b)

    # 3. Tenant B direct inspection of Tenant A proposal returns 403 Forbidden
    resp_b_direct = client.get(
        f"{settings.api_prefix}/operations/proposals/PROP-ALPHA-01",
        headers=tenant_tokens["token_b"],
    )
    assert resp_b_direct.status_code == 403
    assert "Cross-tenant access violation" in resp_b_direct.json()["detail"]


def test_cross_tenant_approval_and_execution_forbidden(tenant_tokens):
    """Verifies Tenant B operator cannot approve, reject, or execute Tenant A proposal."""
    client = TestClient(app)

    now = datetime.now(timezone.utc)
    p_hash = compute_proposal_hash(
        action_type=ActionType.NOTIFICATION_BROADCAST.value,
        target_zone="Zone Alpha 2",
        parameters={"channel": "audio"},
        incident_id="INC-ALPHA-02",
        tenant_id="TEN-ALPHA",
    )
    prop = ActionProposalRecord(
        id="PROP-ALPHA-CROSS-01",
        incident_id="INC-ALPHA-02",
        tenant_id="TEN-ALPHA",
        title="Broadcast Notification",
        description="Notify occupants",
        action_type=ActionType.NOTIFICATION_BROADCAST,
        risk_level=ActionRiskLevel.MEDIUM,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone Alpha 2",
        parameters={"channel": "audio"},
        proposal_hash=p_hash,
        expires_at=now + timedelta(minutes=15),
        proposer_id=str(tenant_tokens["tenant_a_user"]["user_id"]),
    )
    operations_store.update_proposal(prop)

    # 1. Tenant B attempt to approve Tenant A proposal -> 403
    approve_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/PROP-ALPHA-CROSS-01/approve",
        headers=tenant_tokens["token_b"],
        json={"notes": "Malicious cross-tenant approval"},
    )
    assert approve_resp.status_code == 403

    # 2. Tenant B attempt to reject Tenant A proposal -> 403
    reject_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/PROP-ALPHA-CROSS-01/reject",
        headers=tenant_tokens["token_b"],
        json={"rejection_reason": "Malicious cross-tenant reject"},
    )
    assert reject_resp.status_code == 403

    # 3. Tenant B attempt to execute Tenant A proposal -> 403
    exec_resp = client.post(
        f"{settings.api_prefix}/operations/proposals/PROP-ALPHA-CROSS-01/execute",
        headers=tenant_tokens["token_b"],
        json={"idempotency_key": "IDEMP-CROSS-TENANT-01", "is_simulation": True},
    )
    assert exec_resp.status_code == 403


# ==============================================================================
# 3. TWO-PERSON INTEGRITY (TPI) TESTS
# ==============================================================================


def test_two_person_integrity_blocks_self_approval(tenant_tokens):
    """Proposer cannot authorize their own action proposal."""
    client = TestClient(app)
    now = datetime.now(timezone.utc)
    proposer_id = str(tenant_tokens["tenant_a_user"]["user_id"])

    p_hash = compute_proposal_hash(
        action_type=ActionType.EVACUATION_ALERT.value,
        target_zone="Stairwell B",
        parameters={},
        incident_id="INC-TPI-01",
        tenant_id="TEN-ALPHA",
    )
    prop = ActionProposalRecord(
        id="PROP-TPI-01",
        incident_id="INC-TPI-01",
        tenant_id="TEN-ALPHA",
        title="Evacuation Command",
        description="Evacuate",
        action_type=ActionType.EVACUATION_ALERT,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="Stairwell B",
        parameters={},
        proposal_hash=p_hash,
        expires_at=now + timedelta(minutes=15),
        proposer_id=proposer_id,
    )
    operations_store.update_proposal(prop)

    # Proposer tries to self-approve -> 403
    resp = client.post(
        f"{settings.api_prefix}/operations/proposals/PROP-TPI-01/approve",
        headers=tenant_tokens["token_a"],
        json={"notes": "Self approval attempt"},
    )
    assert resp.status_code == 403
    assert "Two-person integrity policy" in resp.json()["detail"]

    # Independent second operator in Tenant A approves -> 200 SUCCESS
    resp2 = client.post(
        f"{settings.api_prefix}/operations/proposals/PROP-TPI-01/approve",
        headers=tenant_tokens["token_a2"],
        json={"notes": "Independent verification passed"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "APPROVED"


# ==============================================================================
# 4. PROPOSAL HASH INTEGRITY & ANTI-TAMPERING TESTS
# ==============================================================================


def test_proposal_hash_mismatch_denied():
    """Safety Gate denies execution if parameters are tampered with after creation."""
    now = datetime.now(timezone.utc)
    original_hash = compute_proposal_hash(
        action_type=ActionType.SUPPRESSION_TRIGGER.value,
        target_zone="Battery Room 1",
        parameters={"duration_seconds": 30},
        incident_id="INC-TAMPER-01",
        tenant_id="TEN-ALPHA",
    )
    prop = ActionProposalRecord(
        id="PROP-TAMPER-01",
        incident_id="INC-TAMPER-01",
        tenant_id="TEN-ALPHA",
        title="Inert Gas Suppression",
        description="Discharge clean agent",
        action_type=ActionType.SUPPRESSION_TRIGGER,
        risk_level=ActionRiskLevel.CRITICAL,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="Battery Room 1",
        parameters={"duration_seconds": 30},
        proposal_hash=original_hash,
        expires_at=now + timedelta(minutes=15),
        status=OperationLifecycleStatus.APPROVED,
        approved_by="operator-sec",
        approved_at=now,
        approval_hash=original_hash,
    )

    # Simulate in-memory tampering of parameters
    prop.parameters = {"duration_seconds": 300, "malicious_override": True}

    autonomy = operations_store.get_autonomy_state()
    decision, reasons = safety_gate.evaluate_proposal(
        proposal=prop,
        autonomy_state=autonomy,
        evidence_confidence=0.95,
        target_adapter_configured=True,
    )
    assert decision == SafetyDecision.DENY
    assert any("hash mismatch" in r.lower() for r in reasons)


# ==============================================================================
# 5. KILL SWITCH PRIVILEGED RESET SEPARATION
# ==============================================================================


def test_kill_switch_reset_requires_elevated_admin(tenant_tokens):
    """Any operator can trip kill-switch; only admin can reset it."""
    client = TestClient(app)

    # 1. Standard operator trips kill switch -> 200
    trip_resp = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        headers=tenant_tokens["token_a"],
        json={"engaged": True, "reason": "Operator observed containment breach"},
    )
    assert trip_resp.status_code == 200
    assert trip_resp.json()["kill_switch_engaged"] is True

    # 2. Standard operator attempts to reset kill switch -> 403 Forbidden
    reset_resp_denied = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        headers=tenant_tokens["token_a"],
        json={"engaged": False, "reason": "Attempting premature reset"},
    )
    assert reset_resp_denied.status_code == 403
    assert "administrative authorization" in reset_resp_denied.json()["detail"]

    # 3. Super Admin resets kill switch -> 200
    reset_resp_ok = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        headers=tenant_tokens["token_admin"],
        json={"engaged": False, "reason": "Post-incident containment cleared by Chief"},
    )
    assert reset_resp_ok.status_code == 200
    assert reset_resp_ok.json()["kill_switch_engaged"] is False


# ==============================================================================
# 6. HARDWARE HONESTY ENFORCEMENT
# ==============================================================================


def test_hardware_honesty_declares_unconfigured():
    """IoTActuatorAdapter strictly returns UNCONFIGURED when physical controllers unattached."""
    adapter = IoTActuatorAdapter(physical_integration_enabled=False)
    now = datetime.now(timezone.utc)
    prop = ActionProposalRecord(
        id="PROP-HARDWARE-01",
        incident_id="INC-HW-01",
        tenant_id="TEN-ALPHA",
        title="Close Fire Dampers",
        description="HVAC dampening",
        action_type=ActionType.HVAC_ISOLATION,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 4",
        proposal_hash="hash_hw",
        expires_at=now + timedelta(minutes=15),
    )

    receipt = adapter.execute(prop, idempotency_key="KEY-HW-HONEST-01")
    assert receipt.outcome == AdapterOutcome.UNCONFIGURED
    assert receipt.message == "NO REAL DISPATCH ADAPTER CONFIGURED"
    assert receipt.details["configured"] is False
    assert receipt.details["actuation_permitted"] is False
    assert receipt.external_reference is None


# ==============================================================================
# 7. IDEMPOTENCY LEDGER & PAYLOAD HASH CONFLICT PREVENTION
# ==============================================================================


def test_idempotency_replay_and_conflict_detection():
    """Ledger returns identical receipt on replay and raises on hash mismatch."""
    adapter = EmergencyNotificationAdapter(configured=True)
    now = datetime.now(timezone.utc)
    prop1 = ActionProposalRecord(
        id="PROP-IDEMP-01",
        incident_id="INC-IDEMP-01",
        tenant_id="TEN-ALPHA",
        title="Broadcast Alert 1",
        description="Alert",
        action_type=ActionType.NOTIFICATION_BROADCAST,
        risk_level=ActionRiskLevel.MEDIUM,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="North Wing",
        parameters={"msg": "Evacuate North"},
        proposal_hash="hash1",
        expires_at=now + timedelta(minutes=10),
    )

    key = "IDEMP-SHARED-KEY-100"
    receipt1 = adapter.execute(prop1, idempotency_key=key)
    assert receipt1.outcome == AdapterOutcome.SUCCESS

    # Replay with same key & same proposal returns exact cached receipt
    receipt_replay = adapter.execute(prop1, idempotency_key=key)
    assert receipt_replay.receipt_id == receipt1.receipt_id

    # Conflict check: Attempting to use same key with different payload hash raises error in ledger
    prop2_conflicting = ActionProposalRecord(
        id="PROP-IDEMP-CONFLICT",
        incident_id="INC-IDEMP-02",
        tenant_id="TEN-ALPHA",
        title="Different Alert",
        description="Conflicting Action",
        action_type=ActionType.EVACUATION_ALERT,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="South Wing",
        parameters={"msg": "Different Payload"},
        proposal_hash="hash2",
        expires_at=now + timedelta(minutes=10),
    )

    with pytest.raises(ValueError, match="Idempotency key collision with conflicting payload"):
        idempotency_ledger.record_execution(
            receipt1,
            payload_hash="COMPLETELY_DIFFERENT_PAYLOAD_HASH",
            tenant_id="TEN-ALPHA",
        )


# ==============================================================================
# 8. NETWORK SECURITY & SSRF PROTECTION TESTS
# ==============================================================================


def test_ssrf_filter_blocks_private_and_metadata_addresses():
    """Network security validator blocks all private CIDRs and metadata IP."""
    blocked_urls = [
        "http://127.0.0.1/admin",
        "http://localhost:8000/internal",
        "http://10.0.0.1/credentials",
        "http://172.16.5.10/database",
        "http://192.168.1.1/router",
        "http://169.254.169.254/latest/meta-data/",
        "http://[::1]/secret",
        "file:///etc/passwd",
        "gopher://internal.lan",
    ]
    for url in blocked_urls:
        assert not is_safe_destination_url(url), f"Expected {url} to be blocked by SSRF filter"
        with pytest.raises(ValueError):
            validate_safe_url(url)

    allowed_urls = [
        "https://api.pagerduty.com/incidents",
        "https://hooks.slack.com/services/T00/B00/X00",
        "https://sentra-01.vercel.app/api/webhooks",
    ]
    for url in allowed_urls:
        assert is_safe_destination_url(url), f"Expected {url} to be allowed"


# ==============================================================================
# 9. CRYPTOGRAPHIC FORENSIC TIMELINE & TAMPER DETECTION TESTS
# ==============================================================================


def test_forensic_timeline_sha256_hash_chain():
    """Events form an unbroken SHA-256 cryptographic chain verified by audit engine."""
    timeline_store.append_event(
        incident_id="INC-CHAIN-01",
        tenant_id="TEN-ALPHA",
        event_type="INCIDENT_DECLARED",
        source="sensor_mesh",
        actor_id="sensor_01",
        actor_role="sensor",
        summary="Thermal anomaly detected in Zone A",
    )
    timeline_store.append_event(
        incident_id="INC-CHAIN-01",
        tenant_id="TEN-ALPHA",
        event_type="TACTICAL_PLAN_READY",
        source="commander_agent",
        actor_id="agent_ic",
        actor_role="commander",
        summary="Tactical response plan synthesized",
    )
    timeline_store.append_event(
        incident_id="INC-CHAIN-01",
        tenant_id="TEN-ALPHA",
        event_type="ACTION_EXECUTED",
        source="notification_adapter",
        actor_id="operator_bob",
        actor_role="dispatcher",
        summary="Evacuation alert broadcasted",
    )

    valid, checked, err = timeline_store.verify_integrity()
    assert valid is True
    assert checked == 3
    assert err is None


def test_forensic_timeline_detects_database_tampering():
    """Direct row tampering in SQLite breaks hash chain and is flagged immediately."""
    timeline_store.append_event(
        incident_id="INC-TAMPER-01",
        tenant_id="TEN-ALPHA",
        event_type="EVENT_ONE",
        source="test",
        actor_id="test",
        actor_role="system",
        summary="Legitimate Event One",
    )
    timeline_store.append_event(
        incident_id="INC-TAMPER-01",
        tenant_id="TEN-ALPHA",
        event_type="EVENT_TWO",
        source="test",
        actor_id="test",
        actor_role="system",
        summary="Legitimate Event Two",
    )

    # Verify clean state
    valid, _, _ = timeline_store.verify_integrity()
    assert valid is True

    # Malicious actor directly modifies SQLite row summary
    conn = OperationsPersistence.get_instance()._get_connection()
    with conn:
        conn.execute("UPDATE operations_timeline_events SET summary = 'Falsified summary' WHERE rowid = 1")

    # Audit verification detects hash mismatch
    tamper_valid, checked, err = timeline_store.verify_integrity()
    assert tamper_valid is False
    assert "Hash mismatch" in err or "Broken chain" in err


# ==============================================================================
# 10. DISASTER RECOVERY & RESTORE REHEARSAL TESTS
# ==============================================================================


def test_automated_backup_and_restore_rehearsal(tmp_path):
    """Online backup generates valid checksummed snapshot; restore rehearsal verifies clean mount."""
    timeline_store.append_event(
        incident_id="INC-BACKUP-01",
        tenant_id="TEN-ALPHA",
        event_type="CRISIS_ACTIVE",
        source="system",
        actor_id="sys",
        actor_role="system",
        summary="Incident ongoing during backup",
    )

    # 1. Create online snapshot
    meta = backup_manager.create_backup(target_directory=str(tmp_path))
    assert meta.status == "SUCCESS"
    assert meta.size_bytes > 0
    assert len(meta.sha256_checksum) == 64

    # 2. Verify physical backup file
    valid, details = backup_manager.verify_backup(meta.backup_file_path, expected_sha256=meta.sha256_checksum)
    assert valid is True
    assert details["integrity_check"] == "ok"

    # 3. Execute automated restore rehearsal
    rehearsal = backup_manager.rehearse_restore(meta.backup_file_path)
    assert rehearsal["rehearsal_passed"] is True
    assert rehearsal["timeline_chain_valid"] is True
    assert rehearsal["rehearsal_status"] == "RESTORE_VERIFIED"


def test_corrupted_backup_handling_fails_safely(tmp_path):
    """Corrupted backup file fails checksum and restore rehearsal safely without affecting live database."""
    meta = backup_manager.create_backup(target_directory=str(tmp_path))
    assert meta.status == "SUCCESS"

    # Deliberately corrupt backup file
    backup_file = Path(meta.backup_file_path)
    with open(backup_file, "r+b") as f:
        f.seek(100)
        f.write(b"CORRUPTED_ZERO_BYTE_OVERWRITE_0000000000000000")

    # Checksum mismatch detected
    valid, details = backup_manager.verify_backup(str(backup_file), expected_sha256=meta.sha256_checksum)
    assert valid is False
    assert details.get("error") in ("Checksum mismatch", "SQLite integrity check failed")

    # Restore rehearsal safely flags failure
    rehearsal = backup_manager.rehearse_restore(str(backup_file))
    assert rehearsal["rehearsal_passed"] is False
    assert rehearsal["step_failed"] == "verify_backup"
