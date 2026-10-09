"""Comprehensive test suite for Phase 6 Autonomous Crisis Operations."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.operations.adapters import (
    AdapterOutcome,
    EmergencyNotificationAdapter,
    IoTActuatorAdapter,
    SimulationAdapter,
    idempotency_ledger,
)
from app.operations.domain import (
    ActionProposalRecord,
    ActionRiskLevel,
    ActionReversibility,
    ActionType,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    PlaybookDefinition,
    PlaybookStatus,
    PlaybookStepDefinition,
    SafetyDecision,
    SimulationScenario,
    compute_proposal_hash,
)
from app.operations.orchestrator import orchestrator
from app.operations.playbooks import (
    CANONICAL_PLAYBOOKS,
    PlaybookValidationError,
    playbook_engine,
    validate_playbook_dag,
)
from app.operations.safety_gate import safety_gate
from app.operations.simulator import simulator_engine
from app.operations.state_machine import (
    IllegalStateTransitionError,
    lease_manager,
    validate_transition,
)
from app.operations.store import operations_store
from app.operations.timeline import timeline_store


@pytest.fixture(autouse=True)
def reset_operations_environment():
    """Resets in-memory store, leases, ledger, and timeline before each test."""
    operations_store.reset_for_tests()
    idempotency_ledger.clear()
    timeline_store.clear()
    yield
    operations_store.reset_for_tests()
    idempotency_ledger.clear()
    timeline_store.clear()


# ==============================================================================
# 1. STATE MACHINE TESTS
# ==============================================================================


def test_legal_state_transitions():
    """Verifies standard operational lifecycle progression."""
    # OPEN -> ASSESSING
    validate_transition(OperationLifecycleStatus.OPEN, OperationLifecycleStatus.ASSESSING)
    # ASSESSING -> PLAN_READY
    validate_transition(OperationLifecycleStatus.ASSESSING, OperationLifecycleStatus.PLAN_READY)
    # PLAN_READY -> AWAITING_APPROVAL
    validate_transition(OperationLifecycleStatus.PLAN_READY, OperationLifecycleStatus.AWAITING_APPROVAL)
    # AWAITING_APPROVAL -> APPROVED
    validate_transition(OperationLifecycleStatus.AWAITING_APPROVAL, OperationLifecycleStatus.APPROVED)
    # APPROVED -> EXECUTION_REQUESTED
    validate_transition(OperationLifecycleStatus.APPROVED, OperationLifecycleStatus.EXECUTION_REQUESTED)
    # EXECUTION_REQUESTED -> EXECUTING
    validate_transition(OperationLifecycleStatus.EXECUTION_REQUESTED, OperationLifecycleStatus.EXECUTING)
    # EXECUTING -> EXECUTED
    validate_transition(OperationLifecycleStatus.EXECUTING, OperationLifecycleStatus.EXECUTED)
    # EXECUTED -> VERIFYING
    validate_transition(OperationLifecycleStatus.EXECUTED, OperationLifecycleStatus.VERIFYING)
    # VERIFYING -> RESOLVED
    validate_transition(OperationLifecycleStatus.VERIFYING, OperationLifecycleStatus.RESOLVED)


def test_illegal_state_transitions_rejected():
    """Verifies that skipping mandatory stages raises IllegalStateTransitionError."""
    with pytest.raises(IllegalStateTransitionError):
        # Cannot jump from OPEN directly to EXECUTING
        validate_transition(OperationLifecycleStatus.OPEN, OperationLifecycleStatus.EXECUTING)

    with pytest.raises(IllegalStateTransitionError):
        # Cannot jump from AWAITING_APPROVAL directly to RESOLVED
        validate_transition(OperationLifecycleStatus.AWAITING_APPROVAL, OperationLifecycleStatus.RESOLVED)

    with pytest.raises(IllegalStateTransitionError):
        # Cannot transition out of terminal state RESOLVED
        validate_transition(OperationLifecycleStatus.RESOLVED, OperationLifecycleStatus.EXECUTING)


def test_concurrency_lease_manager():
    """Verifies mutual exclusion and lease refresh."""
    assert lease_manager.acquire_lease("PROP-1", "worker_A", ttl_seconds=10.0) is True
    # Worker B cannot acquire same lease while active
    assert lease_manager.acquire_lease("PROP-1", "worker_B", ttl_seconds=10.0) is False
    # Worker A can re-acquire/refresh
    assert lease_manager.acquire_lease("PROP-1", "worker_A", ttl_seconds=10.0) is True
    # Worker A releases lease
    assert lease_manager.release_lease("PROP-1", "worker_A") is True
    # Now Worker B can acquire
    assert lease_manager.acquire_lease("PROP-1", "worker_B", ttl_seconds=10.0) is True
    lease_manager.release_lease("PROP-1", "worker_B")


# ==============================================================================
# 2. PLAYBOOK ENGINE & DAG VALIDATION TESTS
# ==============================================================================


def test_canonical_playbooks_valid():
    """Verifies all 5 canonical playbooks pass DAG validation."""
    assert len(CANONICAL_PLAYBOOKS) == 5
    for pb in CANONICAL_PLAYBOOKS:
        validate_playbook_dag(pb)
        registered = playbook_engine.get_playbook(pb.id)
        assert registered is not None
        assert registered.version == "1.0.0"


def test_playbook_dag_cycle_rejection():
    """Verifies cyclic prerequisite chains are caught and rejected."""
    cyclic_playbook = PlaybookDefinition(
        id="PB-CYCLE-TEST",
        name="Cyclic Playbook",
        description="Testing cycle detection",
        applicable_categories=["test"],
        steps=[
            PlaybookStepDefinition(
                step_id="step-1",
                title="Step 1",
                description="Prereq step 2",
                action_type=ActionType.READ_STATUS,
                risk_level=ActionRiskLevel.LOW,
                reversibility=ActionReversibility.REVERSIBLE,
                prerequisites=["step-2"],
            ),
            PlaybookStepDefinition(
                step_id="step-2",
                title="Step 2",
                description="Prereq step 1",
                action_type=ActionType.READ_STATUS,
                risk_level=ActionRiskLevel.LOW,
                reversibility=ActionReversibility.REVERSIBLE,
                prerequisites=["step-1"],
            ),
        ],
    )
    with pytest.raises(PlaybookValidationError) as exc:
        validate_playbook_dag(cyclic_playbook)
    assert "Cyclic dependency detected" in str(exc.value)


def test_playbook_unknown_prerequisite_rejection():
    """Verifies referencing an unknown prerequisite step raises error."""
    invalid_playbook = PlaybookDefinition(
        id="PB-UNKNOWN-PRE",
        name="Unknown Prereq",
        description="Testing unknown prereq",
        applicable_categories=["test"],
        steps=[
            PlaybookStepDefinition(
                step_id="step-1",
                title="Step 1",
                description="Invalid prereq",
                action_type=ActionType.READ_STATUS,
                risk_level=ActionRiskLevel.LOW,
                reversibility=ActionReversibility.REVERSIBLE,
                prerequisites=["non_existent_step"],
            ),
        ],
    )
    with pytest.raises(PlaybookValidationError) as exc:
        validate_playbook_dag(invalid_playbook)
    assert "references unknown prerequisite" in str(exc.value)


# ==============================================================================
# 3. SAFETY GATE & AUTONOMY MODES TESTS
# ==============================================================================


def test_safety_gate_mode_0_observe_denial():
    """Mode 0 OBSERVE must strictly deny all operational executions."""
    state = AutonomyState(mode=AutonomyMode.MODE_0_OBSERVE)
    prop = ActionProposalRecord(
        id="PROP-OBS",
        incident_id="INC-1",
        title="Test Action",
        description="Test",
        action_type=ActionType.LOCKDOWN_ACCESS,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.DENY
    assert "Mode 0 (OBSERVE) active" in reasons[0]


def test_safety_gate_kill_switch_engagement():
    """Kill switch engagement must immediately deny all actions."""
    state = AutonomyState(
        mode=AutonomyMode.MODE_2_HUMAN_APPROVED,
        kill_switch_engaged=True,
        kill_switch_tripped_by="commander_alice",
        kill_switch_reason="Manual safety trip",
    )
    prop = ActionProposalRecord(
        id="PROP-KILL",
        incident_id="INC-1",
        title="Test Action",
        description="Test",
        action_type=ActionType.LOCKDOWN_ACCESS,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.DENY
    assert "Emergency Kill Switch engaged" in reasons[0]


def test_safety_gate_expired_approval_rejection():
    """An expired action proposal must be rejected."""
    state = AutonomyState(mode=AutonomyMode.MODE_2_HUMAN_APPROVED)
    prop = ActionProposalRecord(
        id="PROP-EXP",
        incident_id="INC-1",
        title="Test Action",
        description="Test",
        action_type=ActionType.LOCKDOWN_ACCESS,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=5),  # expired 5 min ago
    )
    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.DENY
    assert "Proposal expired" in reasons[0]


def test_safety_gate_low_evidence_confidence_blocks_critical_action():
    """Critical actions with evidence confidence < 0.65 must require additional evidence."""
    state = AutonomyState(mode=AutonomyMode.MODE_2_HUMAN_APPROVED)
    prop = ActionProposalRecord(
        id="PROP-CRIT",
        incident_id="INC-1",
        title="Critical Deluge Trigger",
        description="Suppression",
        action_type=ActionType.SUPPRESSION_TRIGGER,
        risk_level=ActionRiskLevel.CRITICAL,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="Zone 1",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    # Confidence 0.50 < 0.65 threshold
    decision, reasons = safety_gate.evaluate_proposal(prop, state, evidence_confidence=0.50)
    assert decision == SafetyDecision.REQUIRE_ADDITIONAL_EVIDENCE
    assert "below the required safety threshold" in reasons[0]


def test_safety_gate_proposal_hash_mismatch_denial():
    """If proposal parameters are tampered with post-approval, Safety Gate must deny execution."""
    state = AutonomyState(mode=AutonomyMode.MODE_2_HUMAN_APPROVED)
    original_params = {"zone": "Zone 1", "vent_speed": "high"}
    correct_hash = compute_proposal_hash(
        action_type=ActionType.HVAC_ISOLATION.value,
        target_zone="Zone 1",
        parameters=original_params,
        incident_id="INC-1",
        tenant_id="TEN-BALA-UNI",
    )

    # Approved with correct_hash
    prop = ActionProposalRecord(
        id="PROP-TAMPER",
        incident_id="INC-1",
        title="HVAC Isolation",
        description="Test",
        action_type=ActionType.HVAC_ISOLATION,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        parameters={"zone": "Zone 1", "vent_speed": "MAXIMUM_UNAUTHORIZED_CHANGE"},  # Tampered
        proposal_hash=correct_hash,
        approval_hash=correct_hash,
        approved_by="commander_bob",
        approved_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )

    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.DENY
    assert "Proposal hash mismatch" in reasons[0]


def test_two_person_integrity_proposer_cannot_approve():
    """Proposer cannot approve their own high-risk proposal."""
    state = AutonomyState(mode=AutonomyMode.MODE_2_HUMAN_APPROVED)
    params = {"step": 1}
    p_hash = compute_proposal_hash(
        action_type=ActionType.LOCKDOWN_ACCESS.value,
        target_zone="Zone 1",
        parameters=params,
        incident_id="INC-1",
        tenant_id="TEN-BALA-UNI",
    )

    prop = ActionProposalRecord(
        id="PROP-2P",
        incident_id="INC-1",
        title="Lockdown",
        description="Test",
        action_type=ActionType.LOCKDOWN_ACCESS,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        parameters=params,
        proposal_hash=p_hash,
        approval_hash=p_hash,
        proposer_id="operator_sam",
        approved_by="operator_sam",  # Same user!
        approved_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )

    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.DENY
    assert "Two-person integrity violation" in reasons[0]


def test_mode_3_bounded_automation_allows_low_risk_auto_executes():
    """Mode 3 permits low-risk reversible diagnostics automatically."""
    state = AutonomyState(mode=AutonomyMode.MODE_3_BOUNDED_AUTOMATION)
    prop = ActionProposalRecord(
        id="PROP-AUTO",
        incident_id="INC-1",
        title="Diagnostic Ping",
        description="Sensor self-test",
        action_type=ActionType.DIAGNOSTIC_PING,
        risk_level=ActionRiskLevel.LOW,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 1",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    decision, reasons = safety_gate.evaluate_proposal(prop, state)
    assert decision == SafetyDecision.ALLOW_READ_ONLY
    assert "Mode 3 (Bounded Automation)" in reasons[0]


# ==============================================================================
# 4. ADAPTERS & IDEMPOTENT EXECUTION TESTS
# ==============================================================================


def test_idempotent_execution_suppresses_duplicates():
    """Repeating execution with the same idempotency key must return cached receipt."""
    adapter = EmergencyNotificationAdapter()
    prop = ActionProposalRecord(
        id="PROP-IDEMP",
        incident_id="INC-1",
        title="Evacuation Alert",
        description="Alert",
        action_type=ActionType.EVACUATION_ALERT,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.IRREVERSIBLE,
        target_zone="Sector B",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )

    key = "IDEMP-KEY-999"
    receipt1 = adapter.execute(prop, idempotency_key=key)
    assert receipt1.outcome == AdapterOutcome.SUCCESS
    assert receipt1.idempotency_key == key

    # Second call with identical key
    receipt2 = adapter.execute(prop, idempotency_key=key)
    assert receipt2.receipt_id == receipt1.receipt_id
    assert receipt2.dispatched_at == receipt1.dispatched_at


def test_iot_adapter_unconfigured_honest_declaration():
    """IoT Actuator adapter without real physical integration declares NO REAL DISPATCH ADAPTER CONFIGURED."""
    adapter = IoTActuatorAdapter(physical_integration_enabled=False)
    prop = ActionProposalRecord(
        id="PROP-IOT",
        incident_id="INC-1",
        title="HVAC Damper Close",
        description="Dampers",
        action_type=ActionType.HVAC_ISOLATION,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 2",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    receipt = adapter.execute(prop, idempotency_key="KEY-IOT-1")
    assert receipt.outcome == AdapterOutcome.UNCONFIGURED
    assert receipt.message == "NO REAL DISPATCH ADAPTER CONFIGURED"


def test_adapter_uncertain_outcome_handling():
    """Simulating timeout during execution records EXECUTION_OUTCOME_UNKNOWN."""
    adapter = IoTActuatorAdapter(physical_integration_enabled=True)
    prop = ActionProposalRecord(
        id="PROP-TIMEOUT",
        incident_id="INC-1",
        title="Door Lock",
        description="Lock",
        action_type=ActionType.LOCKDOWN_ACCESS,
        risk_level=ActionRiskLevel.HIGH,
        reversibility=ActionReversibility.REVERSIBLE,
        target_zone="Zone 3",
        proposal_hash="hash123",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    receipt = adapter.execute(prop, idempotency_key="KEY-TIMEOUT", simulate_timeout=True)
    assert receipt.outcome == AdapterOutcome.EXECUTION_OUTCOME_UNKNOWN
    assert receipt.details.get("reconciliation_needed") is True


# ==============================================================================
# 5. SIMULATOR & TIMELINE TESTS
# ==============================================================================


def test_what_if_simulator_isolation_and_disclaimer():
    """What-If simulator carries mandatory simulation disclaimer and runs deterministically."""
    scenario = SimulationScenario(
        scenario_id="SCEN-TEST",
        name="Test Simulation",
        description="Testing simulator",
        incident_id="INC-TEST",
        ambient_temp_delta=20.0,
        spread_rate_mult=2.0,
        sensor_outage_zones=["Zone 3"],
        blocked_routes=["Stairwell A"],
        dispatch_delay_seconds=60,
    )
    result = simulator_engine.run_simulation(scenario)
    assert result.disclaimer == "SIMULATION / NOT LIVE OPERATIONAL DATA"
    assert result.is_simulation is True
    assert result.projected_duration_mins > 45.0
    assert 0.0 <= result.projected_containment_prob <= 1.0
    assert len(result.recommended_adjustments) > 0


def test_timeline_deduplication():
    """Timeline deduplicates rapid identical event submissions."""
    ev1 = timeline_store.append_event(
        incident_id="INC-1",
        event_type="SENSOR_SPIKE",
        source="sensor_network",
        actor_id="sensor_101",
        actor_role="sensor",
        summary="Thermal reading exceeded 70C",
    )
    # Immediately append duplicate event
    ev2 = timeline_store.append_event(
        incident_id="INC-1",
        event_type="SENSOR_SPIKE",
        source="sensor_network",
        actor_id="sensor_101",
        actor_role="sensor",
        summary="Thermal reading exceeded 70C",
    )
    assert ev1.event_id == ev2.event_id
    assert len(timeline_store.get_events(incident_id="INC-1")) == 1


# ==============================================================================
# 6. REST API INTEGRATION TESTS
# ==============================================================================


@pytest.fixture
def auth_headers():
    from app.auth.security import create_access_token, hash_password
    from app.auth.store import auth_store

    admin = auth_store.get_user_by_email("admin@sentra.local")
    if not admin:
        admin = auth_store.create_user(
            name="Sentra Admin",
            email="admin@sentra.local",
            password_hash=hash_password("StrongPass123!"),
            role="super_admin",
        )
    token, _ = create_access_token(
        user_id=str(admin["user_id"]),
        email=str(admin["email"]),
        role=str(admin["role"]),
    )
    return {"Authorization": f"Bearer {token}"}


def test_api_readiness(auth_headers):
    client = TestClient(app)
    response = client.get(f"{settings.api_prefix}/operations/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["phase"] == 6
    assert data["active_playbooks_count"] >= 5


def test_api_autonomy_mode_lifecycle(auth_headers):
    client = TestClient(app)
    # Get initial mode
    resp = client.get(f"{settings.api_prefix}/operations/mode", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["mode"] == "MODE_1_RECOMMEND"

    # Update mode to MODE_2_HUMAN_APPROVED
    resp = client.post(
        f"{settings.api_prefix}/operations/mode",
        headers=auth_headers,
        json={"mode": "MODE_2_HUMAN_APPROVED", "reason": "Incident escalated to severe"},
    )
    assert resp.status_code == 200
    assert resp.json()["mode"] == "MODE_2_HUMAN_APPROVED"

    # Trip Kill Switch
    resp = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        headers=auth_headers,
        json={"engaged": True, "reason": "Operator observed critical telemetry discrepancy"},
    )
    assert resp.status_code == 200
    assert resp.json()["kill_switch_engaged"] is True

    # Reset Kill Switch
    resp = client.post(
        f"{settings.api_prefix}/operations/kill-switch",
        headers=auth_headers,
        json={"engaged": False, "reason": "Discrepancy resolved"},
    )
    assert resp.status_code == 200
    assert resp.json()["kill_switch_engaged"] is False


def test_api_playbooks_catalog(auth_headers):
    client = TestClient(app)
    resp = client.get(f"{settings.api_prefix}/operations/playbooks", headers=auth_headers)
    assert resp.status_code == 200
    playbooks = resp.json()
    assert len(playbooks) >= 5
    ids = {pb["id"] for pb in playbooks}
    assert "PB-FIRE-01" in ids
    assert "PB-GAS-02" in ids
    assert "PB-CROWD-03" in ids
    assert "PB-CONFLICT-04" in ids
    assert "PB-OUTAGE-05" in ids


def test_api_orchestrate_and_proposal_approval_lifecycle(auth_headers):
    client = TestClient(app)
    # 1. Orchestrate incident
    resp = client.post(
        f"{settings.api_prefix}/operations/incidents/INC-TEST-01/orchestrate",
        headers=auth_headers,
        json={"simulated": False},
    )
    assert resp.status_code == 200
    plan = resp.json()
    assert plan["incident_id"] == "INC-TEST-01"
    assert len(plan["proposals"]) > 0

    proposal_id = plan["proposals"][0]["id"]

    # 2. Approve proposal with separate operator ID
    from app.auth.security import create_access_token, hash_password
    from app.auth.store import auth_store

    bob = auth_store.get_user_by_email("bob@sentra.local")
    if not bob:
        bob = auth_store.create_user(
            name="Commander Bob",
            email="bob@sentra.local",
            password_hash=hash_password("StrongPass123!"),
            role="operations_commander",
        )
    else:
        auth_store.update_user(bob["user_id"], role="operations_commander")
        bob["role"] = "operations_commander"
    approver_token, _ = create_access_token(
        user_id=str(bob["user_id"]),
        email=str(bob["email"]),
        role=str(bob["role"]),
    )
    approver_headers = {"Authorization": f"Bearer {approver_token}"}

    resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/approve",
        headers=approver_headers,
        json={"notes": "Verified clear corridors via camera feed."},
    )
    assert resp.status_code == 200
    approved_prop = resp.json()
    assert approved_prop["status"] == "APPROVED"
    assert approved_prop["approved_by"] == str(bob["user_id"])

    # 3. Execute approved proposal
    resp = client.post(
        f"{settings.api_prefix}/operations/proposals/{proposal_id}/execute",
        headers=approver_headers,
        json={"idempotency_key": "IDEMP-TEST-EXEC-01", "is_simulation": True},
    )
    assert resp.status_code == 200
    exec_result = resp.json()
    assert exec_result["status"] == "executed"
    assert exec_result["outcome"] == "SIMULATED"


def test_api_what_if_simulation_run(auth_headers):
    client = TestClient(app)
    resp = client.post(
        f"{settings.api_prefix}/operations/simulations/run",
        headers=auth_headers,
        json={
            "scenario_id": "SCEN-FLASH-OVER",
            "ambient_temp_delta": 30.0,
            "spread_rate_mult": 2.5,
        },
    )
    assert resp.status_code == 200
    sim = resp.json()
    assert sim["disclaimer"] == "SIMULATION / NOT LIVE OPERATIONAL DATA"
    assert sim["is_simulation"] is True
    assert sim["projected_containment_prob"] < 0.90
