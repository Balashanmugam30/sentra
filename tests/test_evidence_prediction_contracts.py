# tests/test_evidence_prediction_contracts.py
"""
Evidence & Prediction Contract Verification Suite (Phase 8).
Validates:
1. Observation freshness & stale telemetry penalties.
2. Sensor disagreement detection and uncertainty dampening.
3. Fallback degradation modes during sensor outages.
4. Strict simulation isolation invariants (is_simulation=True).
5. Deterministic crisis demonstration suite (5 canonical scenarios).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from app.auth.security import create_access_token, hash_password
from app.auth.store import auth_store
from app.core.config import settings
from app.main import app
from app.operations.demo_scenarios import CANONICAL_DEMO_SCENARIOS, demo_engine
from app.operations.domain import (
    ActionProposalRecord,
    ActionReversibility,
    ActionRiskLevel,
    ActionType,
    AutonomyMode,
    AutonomyState,
    SafetyDecision,
)
from app.operations.persistence import persistence
from app.operations.safety_gate import MIN_CRITICAL_EVIDENCE_CONFIDENCE, safety_gate


@pytest.fixture(autouse=True)
def setup_persistence():
    persistence.clear_all_for_tests()
    yield
    persistence.clear_all_for_tests()


@pytest.fixture
def admin_headers():
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


def test_observation_freshness_penalty():
    """
    Evidence confidence degrades as telemetry ages past freshness thresholds.
    High-risk action evaluated under low evidence confidence (< 0.65) is held
    for additional evidence rather than permitted.
    """
    autonomy = AutonomyState(
        mode=AutonomyMode.MODE_1_RECOMMEND,
        kill_switch_engaged=False,
        last_updated_at=datetime.now(timezone.utc),
        updated_by="system",
        reason="Baseline",
    )

    high_risk_prop = ActionProposalRecord(
        id="PROP-FRESH-01",
        incident_id="INC-FRESH-01",
        tenant_id="TEN-BALA-UNI",
        action_type=ActionType.SUPPRESSION_TRIGGER,
        title="Discharge Suppression System",
        description="Release fire suppression chemical agent",
        target_zone="Zone 1",
        risk_level=ActionRiskLevel.CRITICAL,
        reversibility=ActionReversibility.IRREVERSIBLE,
        proposal_hash="hash_fresh_test_01",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        proposer_id="system_agent",
        parameters={"valve_id": "V-101"},
    )

    # 1. Fresh telemetry (confidence = 0.90) requires human approval
    fresh_decision, fresh_reasons = safety_gate.evaluate_proposal(
        proposal=high_risk_prop,
        autonomy_state=autonomy,
        evidence_confidence=0.90,
        is_simulation=False,
    )
    assert fresh_decision == SafetyDecision.REQUIRE_HUMAN_APPROVAL

    # 2. Stale observation / low confidence (0.45 < 0.65 threshold) triggers REQUIRE_ADDITIONAL_EVIDENCE
    stale_decision, stale_reasons = safety_gate.evaluate_proposal(
        proposal=high_risk_prop,
        autonomy_state=autonomy,
        evidence_confidence=0.45,
        is_simulation=False,
    )
    assert stale_decision == SafetyDecision.REQUIRE_ADDITIONAL_EVIDENCE
    assert any("below the required safety threshold" in r for r in stale_reasons)


def test_sensor_conflict_uncertainty_dampening():
    """
    When conflicting sensors are detected, confidence is dampened and safety gate denies/blocks high-risk action.
    """
    res = demo_engine.run_scenario("sensor_disagreement")
    assert res["status"] == "COMPLETED"
    assert res["safety_decision"] == "DENY"
    assert any("divergence" in r.lower() or "confidence" in r.lower() for r in res["safety_reasons"])
    assert res["timeline_chain_valid"] is True


def test_sensor_outage_degraded_fallback():
    """
    Sensor heartbeat loss triggers degraded fallback mode with conservative boundary.
    """
    res = demo_engine.run_scenario("sensor_outage")
    assert res["status"] == "COMPLETED"
    assert res["safety_decision"] == "DENY"
    assert any("stale" in r.lower() or "heartbeat" in r.lower() for r in res["safety_reasons"])
    assert res["timeline_chain_valid"] is True


def test_adapter_unconfigured_hardware_honesty():
    """
    Approved action on unconfigured physical actuator returns UNCONFIGURED receipt
    without emitting false physical commands.
    """
    res = demo_engine.run_scenario("adapter_unconfigured")
    assert res["status"] == "COMPLETED"
    assert res["action_execution"]["outcome"] == "UNCONFIGURED"
    assert res["timeline_chain_valid"] is True


def test_what_if_comparison_sandbox_isolation():
    """
    Counterfactual digital-twin simulation sweep projects outcomes with zero live mutation.
    """
    res = demo_engine.run_scenario("what_if_comparison")
    assert res["status"] == "COMPLETED"
    assert res["action_execution"]["outcome"] == "SIMULATED"
    projection = res["action_execution"]["projection"]
    assert projection["containment_probability"] < 0.88
    assert projection["projected_duration_mins"] > 45.0
    assert res["timeline_chain_valid"] is True


def test_all_five_canonical_demo_scenarios_via_api(admin_headers):
    """
    All 5 canonical scenarios execute deterministically via the authenticated API
    and enforce strict simulation markers on every event.
    """
    client = TestClient(app)

    # 1. Fetch catalog
    cat_resp = client.get(f"{settings.api_prefix}/operations/demo/scenarios", headers=admin_headers)
    assert cat_resp.status_code == 200
    scenarios = cat_resp.json()
    assert len(scenarios) == 5
    scenario_ids = [s["scenario_id"] for s in scenarios]
    assert set(scenario_ids) == {
        "fire_escalation",
        "sensor_disagreement",
        "sensor_outage",
        "adapter_unconfigured",
        "what_if_comparison",
    }

    # 2. Execute each scenario via POST /operations/demo/run
    for sc_id in scenario_ids:
        run_resp = client.post(
            f"{settings.api_prefix}/operations/demo/run",
            json={"scenario_id": sc_id},
            headers=admin_headers,
        )
        assert run_resp.status_code == 200, f"Failed executing scenario {sc_id}: {run_resp.text}"
        data = run_resp.json()
        assert data["status"] == "COMPLETED"
        assert data["scenario_id"] == sc_id
        assert data["timeline_chain_valid"] is True

    # 3. Verify all timeline events created carry is_simulation=True
    events = persistence.list_timeline_events(limit=100)
    assert len(events) >= 5
    for ev in events:
        assert ev["is_simulation"] is True, f"Event {ev['event_id']} leaked into live timeline!"

    # 4. Verify overall cryptographic chain remains 100% valid
    chain_valid, total, err = persistence.verify_timeline_integrity()
    assert chain_valid is True
    assert total >= 5
    assert err is None
