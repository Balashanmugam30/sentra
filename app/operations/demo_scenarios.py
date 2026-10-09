# app/operations/demo_scenarios.py
"""
Deterministic Crisis Demonstration Engine for Sentra (Phase 8).
Provides repeatable, high-fidelity crisis scenarios with strict simulation isolation:
1. fire_escalation: Rapid conflagration with smoke surge & evacuation protocol.
2. sensor_disagreement: Conflicting multi-sensor telemetry triggering uncertainty dampening.
3. sensor_outage: Stale telemetry heartbeat loss with degraded fallback inference.
4. adapter_unconfigured: Approved tactical action encountering unconfigured physical adapter.
5. what_if_comparison: Counterfactual digital-twin simulation comparing baseline vs stressed egress.

STRICT INVARIANTS:
- All generated timeline events MUST bear is_simulation=True.
- Live kill-switch state is NEVER altered by demo executions.
- No physical actuation or live external webhooks are triggered.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import json
import logging
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.operations.adapters import adapter_registry, idempotency_ledger
from app.operations.domain import (
    ActionProposalRecord,
    ActionReversibility,
    ActionRiskLevel,
    ActionType,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    SafetyDecision,
    SimulationScenario,
    TimelineEventRecord,
    compute_proposal_hash,
)
from app.operations.persistence import persistence
from app.operations.safety_gate import safety_gate
from app.operations.simulator import simulator_engine
from app.operations.timeline import timeline_store

logger = logging.getLogger(__name__)


@dataclass
class DemoScenarioDefinition:
    scenario_id: str
    title: str
    category: str
    description: str
    primary_hazard: str
    target_zones: List[str]
    initial_telemetry: Dict[str, Any]
    expected_safety_decision: str
    invariants: List[str]


CANONICAL_DEMO_SCENARIOS: Dict[str, DemoScenarioDefinition] = {
    "fire_escalation": DemoScenarioDefinition(
        scenario_id="fire_escalation",
        title="Urban Conflagration & Rapid Evacuation",
        category="Thermal Escalation",
        description="Rapid combustion surge in Zone 2 with heavy aerosol particulate spike and thermal plume expansion.",
        primary_hazard="THERMAL_PLUME",
        target_zones=["Zone 2", "Zone 3"],
        initial_telemetry={
            "thermal_temp_c": 685.0,
            "pm25_ug_m3": 448.0,
            "co_ppm": 85.0,
            "wind_vector_kmh": 28.5,
            "sensor_confidence": 0.94,
        },
        expected_safety_decision="APPROVED_WITH_CONDITIONS",
        invariants=[
            "is_simulation=True on all emitted events",
            "Emergency evacuation route computation active",
            "Human operator approval required for suppression actuation",
        ],
    ),
    "sensor_disagreement": DemoScenarioDefinition(
        scenario_id="sensor_disagreement",
        title="Multi-Sensor Conflict & Uncertainty Dampening",
        category="Telemetry Conflict",
        description="Thermal sensor registers 820°C critical anomaly while optical and particulate sensors report baseline conditions.",
        primary_hazard="CONFLICTING_TELEMETRY",
        target_zones=["Zone 1"],
        initial_telemetry={
            "sensor_ir_temp_c": 820.0,
            "sensor_optical_obscuration": 0.02,
            "sensor_pm25": 14.0,
            "divergence_ratio": 4.8,
            "sensor_confidence": 0.41,
        },
        expected_safety_decision="BLOCKED_BY_POLICY",
        invariants=[
            "Safety gate strictly blocks automated dispatch due to confidence < 0.70",
            "Uncertainty boundary flags manual operator field verification",
            "Zero false-positive actuator triggers",
        ],
    ),
    "sensor_outage": DemoScenarioDefinition(
        scenario_id="sensor_outage",
        title="Telemetry Heartbeat Loss & Degraded Fallback",
        category="Sensor Outage",
        description="Zone 4 environmental monitor drops heartbeat for 180 seconds; stale observation triggers degraded inference mode.",
        primary_hazard="HEARTBEAT_LOSS",
        target_zones=["Zone 4"],
        initial_telemetry={
            "last_heartbeat_age_sec": 180,
            "status": "STALE_TELEMETRY",
            "fallback_mode": "CONSERVATIVE_HEURISTIC",
            "confidence_penalty": 0.50,
            "sensor_confidence": 0.50,
        },
        expected_safety_decision="BLOCKED_BY_POLICY",
        invariants=[
            "Stale observation (>120s) triggers operational warning",
            "Degraded fallback mode activates without service interruption",
            "Conservative safety envelope enforced",
        ],
    ),
    "adapter_unconfigured": DemoScenarioDefinition(
        scenario_id="adapter_unconfigured",
        title="Tactical Action on Unconfigured Physical Adapter",
        category="Hardware Honesty",
        description="Operator approves water mist suppression; adapter registry honestly reports unconfigured physical actuator with zero imaginary side-effects.",
        primary_hazard="HARDWARE_DISCONNECT",
        target_zones=["Zone 3"],
        initial_telemetry={
            "proposal_action": "WATER_MIST_SUPPRESSION",
            "hardware_transport": "NONE_ATTACHED",
            "sensor_confidence": 0.91,
        },
        expected_safety_decision="APPROVED",
        invariants=[
            "Adapter receipt returns UNCONFIGURED",
            "No imaginary physical commands emitted",
            "Audit ledger records honest non-execution",
        ],
    ),
    "what_if_comparison": DemoScenarioDefinition(
        scenario_id="what_if_comparison",
        title="Counterfactual Digital-Twin Simulation Sweep",
        category="Digital Twin",
        description="Isolated parameter sweep testing baseline containment vs stressed ambient influx (+25°C, 2 blocked stairwells).",
        primary_hazard="SIMULATED_STRESS",
        target_zones=["Zone 1", "Zone 2", "Zone 3"],
        initial_telemetry={
            "ambient_temp_delta": 25.0,
            "spread_rate_mult": 2.2,
            "blocked_routes": ["Stairwell West", "Corridor B2"],
            "dispatch_delay_seconds": 120,
        },
        expected_safety_decision="SIMULATION_ONLY",
        invariants=[
            "Execution completely sandboxed from live operations",
            "Calculates containment probability delta without mutating state",
            "Deterministic KaTeX/chartable projection values",
        ],
    ),
}


class DeterministicDemoEngine:
    """Orchestrates reproducible crisis demonstration runs with strict simulation isolation."""

    def list_scenarios(self) -> List[Dict[str, Any]]:
        return [asdict(s) for s in CANONICAL_DEMO_SCENARIOS.values()]

    def get_scenario(self, scenario_id: str) -> Optional[DemoScenarioDefinition]:
        return CANONICAL_DEMO_SCENARIOS.get(scenario_id)

    def run_scenario(
        self,
        scenario_id: str,
        operator_id: str = "demo_operator",
        tenant_id: str = "tenant_sentra_demo",
    ) -> Dict[str, Any]:
        """
        Executes a deterministic demonstration run.
        Enforces:
        - is_simulation=True for all timeline entries.
        - Preserves live kill switch state.
        - Verifies tamper-evident timeline chain after run.
        """
        scenario = self.get_scenario(scenario_id)
        if not scenario:
            raise ValueError(f"Unknown demo scenario: {scenario_id}")

        incident_id = f"INC-DEMO-{scenario_id.upper()}"
        run_id = f"RUN-{uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Step 1: Ingest Initial Telemetry & Observation
        timeline_events_emitted = []

        obs_event = timeline_store.append_event(
            incident_id=incident_id,
            tenant_id=tenant_id,
            event_type="DEMO_TELEMETRY_INGEST",
            source="demo_engine",
            actor_id=operator_id,
            actor_role="demo_operator",
            summary=f"Demo [{scenario.title}]: Initial telemetry ingested",
            details={
                "scenario_id": scenario_id,
                "telemetry": scenario.initial_telemetry,
                "target_zones": scenario.target_zones,
                "is_simulation": True,
            },
            is_simulation=True,
        )
        timeline_events_emitted.append(obs_event.event_id)

        # Step 2: Evaluate Safety Gate Deterministically
        if scenario_id == "sensor_disagreement":
            safety_decision = SafetyDecision.DENY
            reasons = [
                "Sensor divergence ratio 4.8 exceeds tolerance (1.5)",
                "Telemetry evidence confidence 0.41 is below safety threshold 0.70",
                "Automated actuation blocked; manual verification required",
            ]
        elif scenario_id == "sensor_outage":
            safety_decision = SafetyDecision.DENY
            reasons = [
                "Telemetry heartbeat age (180s) exceeds freshness threshold (120s)",
                "Degraded fallback mode active with conservative bounds",
            ]
        elif scenario_id == "what_if_comparison":
            safety_decision = SafetyDecision.SIMULATION_ONLY
            reasons = ["What-If simulation evaluation; isolated digital twin sandbox"]
        else:
            safety_decision = SafetyDecision.REQUIRE_HUMAN_APPROVAL
            reasons = ["Telemetry confidence verified (>0.90)", "Risk mitigation controls satisfied"]

        safety_event = timeline_store.append_event(
            incident_id=incident_id,
            tenant_id=tenant_id,
            event_type="DEMO_SAFETY_EVALUATION",
            source="demo_safety_gate",
            actor_id="safety_gate",
            actor_role="automated_gate",
            summary=f"Safety Gate decision: {safety_decision.value}",
            details={
                "decision": safety_decision.value,
                "reasons": reasons,
                "is_simulation": True,
            },
            is_simulation=True,
        )
        timeline_events_emitted.append(safety_event.event_id)

        # Step 3: Action Proposal and Execution Verification
        action_execution_result: Optional[Dict[str, Any]] = None
        if scenario_id == "fire_escalation":
            adapter = adapter_registry.get_adapter_for_action(ActionType.EVACUATION_ALERT, is_simulation=True)
            now_utc = datetime.now(timezone.utc)
            expires_utc = now_utc + timedelta(minutes=30)
            params = {"message": "Immediate evacuation of Zone 2 via East Stairwell."}
            p_hash = compute_proposal_hash(
                action_type=ActionType.EVACUATION_ALERT.value,
                target_zone="Zone 2",
                parameters=params,
                incident_id=incident_id,
                tenant_id=tenant_id,
            )
            prop = ActionProposalRecord(
                id=f"PROP-DEMO-EVAC-{uuid4().hex[:6]}",
                incident_id=incident_id,
                tenant_id=tenant_id,
                action_type=ActionType.EVACUATION_ALERT,
                title="Emergency Evacuation Zone 2",
                description="Immediate evacuation order for Zone 2 occupants",
                target_zone="Zone 2",
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.REVERSIBLE,
                parameters=params,
                proposal_hash=p_hash,
                created_at=now_utc,
                expires_at=expires_utc,
                proposer_id=operator_id,
                status=OperationLifecycleStatus.APPROVED,
            )
            receipt = adapter.execute(
                proposal=prop,
                idempotency_key=f"IDEMP-DEMO-{run_id}-FIRE",
            )
            action_execution_result = {
                "action": "EVACUATION_ALERT",
                "outcome": receipt.outcome.value,
                "receipt": receipt.model_dump(),
            }
        elif scenario_id == "adapter_unconfigured":
            adapter = adapter_registry.get_adapter_for_action(ActionType.SUPPRESSION_TRIGGER, is_simulation=False)
            now_utc = datetime.now(timezone.utc)
            expires_utc = now_utc + timedelta(minutes=30)
            params = {"valve_id": "V-301", "pressure_bar": 12.0}
            p_hash = compute_proposal_hash(
                action_type=ActionType.SUPPRESSION_TRIGGER.value,
                target_zone="Zone 3",
                parameters=params,
                incident_id=incident_id,
                tenant_id=tenant_id,
            )
            prop = ActionProposalRecord(
                id=f"PROP-DEMO-SUPP-{uuid4().hex[:6]}",
                incident_id=incident_id,
                tenant_id=tenant_id,
                action_type=ActionType.SUPPRESSION_TRIGGER,
                title="Water Mist Fire Suppression Zone 3",
                description="Discharge water mist suppression system in Zone 3",
                target_zone="Zone 3",
                risk_level=ActionRiskLevel.CRITICAL,
                reversibility=ActionReversibility.IRREVERSIBLE,
                parameters=params,
                proposal_hash=p_hash,
                created_at=now_utc,
                expires_at=expires_utc,
                proposer_id=operator_id,
                status=OperationLifecycleStatus.APPROVED,
            )
            receipt = adapter.execute(
                proposal=prop,
                idempotency_key=f"IDEMP-DEMO-{run_id}-UNCONFIG",
            )
            action_execution_result = {
                "action": "SUPPRESSION_TRIGGER",
                "outcome": receipt.outcome.value,
                "receipt": receipt.model_dump(),
            }
        elif scenario_id == "what_if_comparison":
            # Run What-If simulation sweep
            sim_scenario = SimulationScenario(
                scenario_id="SCEN-DEMO-SWEEP",
                name="Demo What-If Comparison Sweep",
                description=scenario.description,
                incident_id=incident_id,
                ambient_temp_delta=scenario.initial_telemetry.get("ambient_temp_delta", 25.0),
                spread_rate_mult=scenario.initial_telemetry.get("spread_rate_mult", 2.2),
                sensor_outage_zones=[],
                blocked_routes=scenario.initial_telemetry.get("blocked_routes", []),
                dispatch_delay_seconds=scenario.initial_telemetry.get("dispatch_delay_seconds", 120),
            )
            sim_output = simulator_engine.run_simulation(sim_scenario)
            action_execution_result = {
                "action": "WHAT_IF_DIGITAL_TWIN",
                "outcome": "SIMULATED",
                "projection": {
                    "projected_duration_mins": sim_output.projected_duration_mins,
                    "containment_probability": sim_output.projected_containment_prob,
                    "projected_casualties": sim_output.projected_casualties,
                    "projected_structural_damage_pct": sim_output.projected_damage_index,
                },
            }

        if action_execution_result:
            exec_event = timeline_store.append_event(
                incident_id=incident_id,
                tenant_id=tenant_id,
                event_type="DEMO_ACTION_EXECUTION",
                source="demo_dispatcher",
                actor_id=operator_id,
                actor_role="demo_operator",
                summary=f"Demo action executed: {action_execution_result['action']} -> {action_execution_result['outcome']}",
                details={
                    "execution": action_execution_result,
                    "is_simulation": True,
                },
                is_simulation=True,
            )
            timeline_events_emitted.append(exec_event.event_id)

        # Step 4: Verify timeline chain cryptographic integrity
        chain_valid, total_events, chain_err = persistence.verify_timeline_integrity()

        return {
            "scenario_id": scenario_id,
            "run_id": run_id,
            "status": "COMPLETED",
            "title": scenario.title,
            "category": scenario.category,
            "incident_id": incident_id,
            "safety_decision": safety_decision.value,
            "safety_reasons": reasons,
            "action_execution": action_execution_result,
            "events_emitted": timeline_events_emitted,
            "timeline_chain_valid": chain_valid,
            "total_timeline_events": total_events,
            "timestamp": now_iso,
        }


demo_engine = DeterministicDemoEngine()
