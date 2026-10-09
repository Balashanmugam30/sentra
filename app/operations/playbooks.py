"""Crisis Playbook Engine: canonical playbooks, DAG cycle validation, and activation logic."""

from __future__ import annotations

from typing import Dict, List, Optional, Set
from app.operations.domain import (
    ActionRiskLevel,
    ActionReversibility,
    ActionType,
    PlaybookDefinition,
    PlaybookStatus,
    PlaybookStepDefinition,
)


class PlaybookValidationError(ValueError):
    """Raised when a playbook definition fails DAG structural validation."""

    pass


def validate_playbook_dag(playbook: PlaybookDefinition) -> None:
    """
    Validates that playbook steps form a valid Directed Acyclic Graph (DAG):
    1. Steps list must not be empty.
    2. Step IDs must be unique.
    3. All prerequisites must refer to existing step IDs within the playbook.
    4. Graph must contain NO cycles (validated via DFS recursion stack).
    """
    if not playbook.steps:
        raise PlaybookValidationError(f"Playbook {playbook.id} has no defined steps.")

    step_ids: Set[str] = set()
    adj_list: Dict[str, List[str]] = {}

    for step in playbook.steps:
        if step.step_id in step_ids:
            raise PlaybookValidationError(f"Duplicate step ID '{step.step_id}' in playbook {playbook.id}.")
        step_ids.add(step.step_id)
        adj_list[step.step_id] = []

    for step in playbook.steps:
        for prereq in step.prerequisites:
            if prereq not in step_ids:
                raise PlaybookValidationError(
                    f"Step '{step.step_id}' references unknown prerequisite '{prereq}' in playbook {playbook.id}."
                )
            if prereq == step.step_id:
                raise PlaybookValidationError(
                    f"Step '{step.step_id}' cannot list itself as a prerequisite in playbook {playbook.id}."
                )
            adj_list[prereq].append(step.step_id)

    # Cycle detection via DFS
    visited: Set[str] = set()
    rec_stack: Set[str] = set()

    def dfs(node: str) -> None:
        visited.add(node)
        rec_stack.add(node)
        for neighbor in adj_list.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
            elif neighbor in rec_stack:
                raise PlaybookValidationError(
                    f"Cyclic dependency detected in playbook {playbook.id} involving step '{neighbor}'."
                )
        rec_stack.remove(node)

    for node in step_ids:
        if node not in visited:
            dfs(node)


# 5 CANONICAL CRISIS PLAYBOOKS

CANONICAL_PLAYBOOKS: List[PlaybookDefinition] = [
    PlaybookDefinition(
        id="PB-FIRE-01",
        name="Structural Fire & Rapid Containment SOP",
        version="1.0.0",
        status=PlaybookStatus.ACTIVE,
        description="Comprehensive containment protocol for thermal escalation, active flames, and smoke spread.",
        applicable_categories=["fire", "thermal_anomaly", "explosion", "critical_fire"],
        severity_threshold=3,
        provenance_standard="NFPA 1600 / ISO 22320",
        safety_constraints=[
            "Never trigger suppression if occupants are detected in dry-chemical zone without warning.",
            "Verify HVAC shutdown before high-pressure vent actuation.",
        ],
        steps=[
            PlaybookStepDefinition(
                step_id="step-fire-01",
                title="HVAC Smoke Damper & Zone Air Isolation",
                description="Command HVAC dampers to seal ductwork and prevent toxic smoke migration across floor boundaries.",
                action_type=ActionType.HVAC_ISOLATION,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                timeout_seconds=45,
            ),
            PlaybookStepDefinition(
                step_id="step-fire-02",
                title="Broadcast Dynamic Audible & Visual Evacuation Directive",
                description="Trigger strobes, PA announcements, and mobile push notifications for affected sector.",
                action_type=ActionType.EVACUATION_ALERT,
                risk_level=ActionRiskLevel.CRITICAL,
                reversibility=ActionReversibility.IRREVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-fire-01"],
                timeout_seconds=30,
            ),
            PlaybookStepDefinition(
                step_id="step-fire-03",
                title="Emergency Egress Access Control Release",
                description="Unlock magnetic fail-safe egress doors along primary and secondary evacuation corridors.",
                action_type=ActionType.LOCKDOWN_ACCESS,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-fire-01"],
                timeout_seconds=30,
            ),
            PlaybookStepDefinition(
                step_id="step-fire-04",
                title="Pre-Arm Automated Deluge / Sprinkler Valves",
                description="Stage secondary pre-action water valves in high-heat core zone.",
                action_type=ActionType.SUPPRESSION_TRIGGER,
                risk_level=ActionRiskLevel.CRITICAL,
                reversibility=ActionReversibility.IRREVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-fire-02"],
                timeout_seconds=60,
                is_critical=True,
            ),
            PlaybookStepDefinition(
                step_id="step-fire-05",
                title="Mutual Aid Emergency Dispatch Packet",
                description="Transmit automated CAD incident telemetry and thermal heat map packet to municipal fire department.",
                action_type=ActionType.MUTUAL_AID_REQUEST,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.IRREVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-fire-04"],
                timeout_seconds=90,
            ),
        ],
    ),
    PlaybookDefinition(
        id="PB-GAS-02",
        name="Hazardous Airborne Contaminant & Gas Leak Isolation",
        version="1.0.0",
        status=PlaybookStatus.ACTIVE,
        description="Isolation protocol for toxic particulate, VOC spike, or combustible gas vapor release.",
        applicable_categories=["gas_leak", "hazmat", "chemical", "air_quality"],
        severity_threshold=3,
        provenance_standard="OSHA 1910.120 / NFPA 472",
        safety_constraints=[
            "Do not energize standard electrical switches or motors in combustible vapor atmospheres.",
            "Seal return air registers prior to exhaust fan activation.",
        ],
        steps=[
            PlaybookStepDefinition(
                step_id="step-gas-01",
                title="Airlock Corridor Hermetic Seal",
                description="Engage pneumatic door seals to isolate the source laboratory and adjacent hallway.",
                action_type=ActionType.LOCKDOWN_ACCESS,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                timeout_seconds=40,
            ),
            PlaybookStepDefinition(
                step_id="step-gas-02",
                title="Negative Pressure Scrubber Exhaust Activation",
                description="Spin up negative-pressure containment fans routing through chemical scrubbers.",
                action_type=ActionType.HVAC_ISOLATION,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-gas-01"],
                timeout_seconds=60,
            ),
            PlaybookStepDefinition(
                step_id="step-gas-03",
                title="Sector Hazmat Evacuation Directive",
                description="Issue localized shelter-in-place and downwind sector evacuation notifications.",
                action_type=ActionType.EVACUATION_ALERT,
                risk_level=ActionRiskLevel.CRITICAL,
                reversibility=ActionReversibility.IRREVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-gas-01"],
                timeout_seconds=30,
            ),
            PlaybookStepDefinition(
                step_id="step-gas-04",
                title="Medical Triage and Exposure Antidote Staging",
                description="Alert campus medical clinic with specific chemical SDS antidotes and decontamination readiness.",
                action_type=ActionType.NOTIFICATION_BROADCAST,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-gas-03"],
                timeout_seconds=45,
            ),
        ],
    ),
    PlaybookDefinition(
        id="PB-CROWD-03",
        name="Overcrowding & Chokepoint Evacuation Deconfliction",
        version="1.0.0",
        status=PlaybookStatus.ACTIVE,
        description="Crowd surge de-escalation, bottleneck relief, and dynamic egress re-routing.",
        applicable_categories=["mass_panic", "crowd_surge", "stampede", "bottleneck"],
        severity_threshold=2,
        provenance_standard="ISO 22320 / Crowd Safety Management Guidelines",
        safety_constraints=[
            "Avoid abrupt sirens that induce blind panic in bottleneck areas.",
            "Maintain green exit illumination along unobstructed routes.",
        ],
        steps=[
            PlaybookStepDefinition(
                step_id="step-crowd-01",
                title="Auxiliary Egress Door Release",
                description="Electromechanically release auxiliary fire gates and staff exits to double corridor egress width.",
                action_type=ActionType.LOCKDOWN_ACCESS,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                timeout_seconds=30,
            ),
            PlaybookStepDefinition(
                step_id="step-crowd-02",
                title="Dynamic Signage Re-Routing Broadcast",
                description="Update digital corridor displays and localized PA speakers to divert evacuees to East Stairwell.",
                action_type=ActionType.NOTIFICATION_BROADCAST,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-crowd-01"],
                timeout_seconds=20,
            ),
            PlaybookStepDefinition(
                step_id="step-crowd-03",
                title="Aerial Drone Chokepoint Monitoring Dispatch",
                description="Dispatch autonomous surveillance drone to monitor chokepoint clearance and report crowd density.",
                action_type=ActionType.DRONE_DISPATCH,
                risk_level=ActionRiskLevel.HIGH,
                reversibility=ActionReversibility.PARTIALLY_REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-crowd-01"],
                timeout_seconds=60,
            ),
        ],
    ),
    PlaybookDefinition(
        id="PB-CONFLICT-04",
        name="Conflicting Multimodal Sensor Resolution",
        version="1.0.0",
        status=PlaybookStatus.ACTIVE,
        description="Verification procedure when thermal, optical, and acoustic telemetry produce discordant signals.",
        applicable_categories=["conflicting_sensors", "sensor_anomaly", "telemetry_dispute"],
        severity_threshold=2,
        provenance_standard="NIST SP 800-160 / IEEE 1451",
        safety_constraints=[
            "Never assume safe conditions when a primary life-safety detector alerts, even if cameras appear clear.",
            "Require physical or robotic verification before downgrading alarm state.",
        ],
        steps=[
            PlaybookStepDefinition(
                step_id="step-conflict-01",
                title="Diagnostic Query & Ping Cluster",
                description="Query self-test registers and power telemetry across discordant sensor hardware.",
                action_type=ActionType.DIAGNOSTIC_PING,
                risk_level=ActionRiskLevel.LOW,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="operator",
                requires_human_approval=False,
                timeout_seconds=15,
            ),
            PlaybookStepDefinition(
                step_id="step-conflict-02",
                title="Deploy Inspection Drone to Conflict Coordinate",
                description="Dispatch inspection drone to provide ground-truth optical and thermal confirmation.",
                action_type=ActionType.DRONE_DISPATCH,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-conflict-01"],
                timeout_seconds=45,
            ),
            PlaybookStepDefinition(
                step_id="step-conflict-03",
                title="Recalibrate and Quarantine Drifted Telemetry Node",
                description="Quarantine aberrant sensor node from fusion calculations until technician recertification.",
                action_type=ActionType.SENSOR_RECALIBRATION,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-conflict-02"],
                timeout_seconds=30,
            ),
        ],
    ),
    PlaybookDefinition(
        id="PB-OUTAGE-05",
        name="Telemetry Sensor-Network Blackout & Fallback",
        version="1.0.0",
        status=PlaybookStatus.ACTIVE,
        description="Resilience and manual escalation SOP when telemetry gateway or sensor network drops offline.",
        applicable_categories=["sensor_outage", "network_blackout", "telemetry_loss", "comms_failure"],
        severity_threshold=3,
        provenance_standard="CISA Incident Response Guidelines / ISO 27001",
        safety_constraints=[
            "Default to conservative safety assumptions for any unmonitored zone adjacent to an active hazard.",
        ],
        steps=[
            PlaybookStepDefinition(
                step_id="step-outage-01",
                title="Poll Mesh Gateway Failover State",
                description="Query backup cellular and LoRaWAN gateways for heartbeat ping across offline zone.",
                action_type=ActionType.READ_STATUS,
                risk_level=ActionRiskLevel.LOW,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="operator",
                requires_human_approval=False,
                timeout_seconds=15,
            ),
            PlaybookStepDefinition(
                step_id="step-outage-02",
                title="Dispatch Physical Floor Warden Patrol",
                description="Task floor marshals with two-way radio sweep of dark telemetry sectors.",
                action_type=ActionType.DRONE_DISPATCH,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-outage-01"],
                timeout_seconds=60,
            ),
            PlaybookStepDefinition(
                step_id="step-outage-03",
                title="Broadcast Fallback Operating Posture Alert",
                description="Inform facility personnel that manual check-in protocol is activated.",
                action_type=ActionType.NOTIFICATION_BROADCAST,
                risk_level=ActionRiskLevel.MEDIUM,
                reversibility=ActionReversibility.REVERSIBLE,
                required_role="commander",
                requires_human_approval=True,
                prerequisites=["step-outage-02"],
                timeout_seconds=30,
            ),
        ],
    ),
]


class PlaybookEngine:
    """Manages playbook catalog, DAG validation, and incident playbook activation."""

    def __init__(self) -> None:
        self._playbooks: Dict[str, PlaybookDefinition] = {}
        for pb in CANONICAL_PLAYBOOKS:
            validate_playbook_dag(pb)
            self._playbooks[pb.id] = pb

    def get_playbook(self, playbook_id: str) -> Optional[PlaybookDefinition]:
        return self._playbooks.get(playbook_id)

    def list_playbooks(self, status: Optional[PlaybookStatus] = None) -> List[PlaybookDefinition]:
        if status is None:
            return list(self._playbooks.values())
        return [pb for pb in self._playbooks.values() if pb.status == status]

    def register_playbook(self, playbook: PlaybookDefinition) -> None:
        validate_playbook_dag(playbook)
        self._playbooks[playbook.id] = playbook

    def match_playbook_for_incident(
        self,
        category: str,
        severity: int = 3,
    ) -> Optional[PlaybookDefinition]:
        """Finds the most suitable active playbook based on incident category and severity threshold."""
        category_lower = category.lower()
        for pb in self._playbooks.values():
            if pb.status != PlaybookStatus.ACTIVE:
                continue
            if any(cat in category_lower or category_lower in cat for cat in pb.applicable_categories):
                if severity >= pb.severity_threshold:
                    return pb
        # Fallback to fire or first matching active playbook
        return self._playbooks.get("PB-FIRE-01")


playbook_engine = PlaybookEngine()
