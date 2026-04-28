from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from app.agents.memory import get_test_scenario, refresh_agent_memory, summarize_memory
from app.analytics.executive import generate_executive_snapshot, generate_readiness_scorecards
from app.analytics.forecast import generate_forecast_snapshot
from app.communications.engine import generate_live_communications
from app.models.incident import Incident
from app.operations.engine import get_live_operations_snapshot
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments
from app.resilience.recovery import get_resilience_live_snapshot
from app.simulation.timeline import generate_timeline_forecast


@dataclass
class SpecialistState:
    agent_id: str
    name: str
    domain: str
    status: str
    confidence: int
    stance: str
    priority_zone: str | None
    top_recommendation: str
    reasoning_drivers: list[str]
    memory_summary: list[str]
    last_updated: datetime


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _scenario_modifier(scenario: str | None, domain: str) -> tuple[int, str | None, str | None]:
    if scenario == "critical_fire" and domain == "fire_response":
        return 18, "Zone 3", "Contain ignition cluster before 30-minute spread"
    if scenario == "gas_leak" and domain in {"fire_response", "medical_response"}:
        return 14, "Zone 2", "Isolate gas zone and prepare exposure treatment"
    if scenario == "mass_panic" and domain == "security_control":
        return 16, "Zone 4", "Stabilize crowd lanes before corridor lock conflict"
    if scenario == "resource_shortage" and domain in {"resource_mobility", "executive_strategy"}:
        return 15, "Command Grid", "Shift backup assets and authorize reserve posture"
    if scenario == "comms_breakdown" and domain == "communications_control":
        return 17, "Communications Grid", "Increase alternate channel cadence immediately"
    return 0, None, None


def _top_zone(fusion: dict[str, object]) -> object | None:
    return fusion["zones"][0] if fusion["zones"] else None


def _priority_zone_name(zone: object | None) -> str | None:
    if zone is None:
        return None
    return getattr(zone, "zone", None)


def build_specialist_states(incidents: list[Incident]) -> list[SpecialistState]:
    fusion = generate_fusion_snapshot(incidents)
    operations = get_live_operations_snapshot(incidents)
    communications = generate_live_communications(incidents)
    resources = generate_resource_deployments(incidents)
    forecast = generate_forecast_snapshot(incidents)
    timeline = generate_timeline_forecast(incidents)
    readiness = generate_readiness_scorecards(incidents)
    executive = generate_executive_snapshot(incidents)
    resilience = get_resilience_live_snapshot(incidents)
    scenario = get_test_scenario()

    top_zone = _top_zone(fusion)
    top_zone_name = _priority_zone_name(top_zone)
    critical_zone_count = len([zone for zone in fusion["zones"] if zone.fused_score >= 80])
    queued_alerts = communications["delivery_status"].queued
    stalled_workflows = resilience["metrics"]["stalled_workflows"]
    resource_util = int(resources["global_load"] == "overloaded") * 20 + int(resources["global_load"] == "elevated") * 10
    alignment_pressure = max(window["risk_score"] for window in forecast["time_windows"])

    specs: list[tuple[str, str, str, int, str, str | None, list[str]]] = []

    fire_bonus, fire_zone_override, fire_reco_override = _scenario_modifier(scenario, "fire_response")
    fire_zone = fire_zone_override or top_zone_name
    fire_recommendation = fire_reco_override or (
        f"Commit suppression teams to {fire_zone or 'top fire zone'}"
    )
    fire_drivers = [
        f"Top fused zone {fire_zone or 'Zone 1'}",
        f"{critical_zone_count} zones at critical fusion pressure",
        f"60-minute forecast risk {alignment_pressure}",
    ]
    fire_confidence = max(45, min(98, 58 + critical_zone_count * 8 + fire_bonus))
    fire_status = "critical" if fire_confidence >= 82 else "watch" if fire_confidence >= 60 else "active"
    fire_stance = "urgent" if fire_confidence >= 80 else "support"
    specs.append((
        "fire_commander",
        "Fire Commander AI",
        "fire_response",
        fire_confidence,
        fire_status,
        fire_stance,
        fire_zone,
        fire_recommendation,
        fire_drivers,
    ))

    medical_bonus, medical_zone_override, medical_reco_override = _scenario_modifier(scenario, "medical_response")
    medical_zone = medical_zone_override or fire_zone or "Zone 1"
    medical_recommendation = medical_reco_override or (
        f"Stage triage and smoke exposure support near {medical_zone}"
    )
    medical_drivers = [
        f"Evac completion probability {forecast['metrics']['evac_completion_probability']}%",
        f"Resource recovery probability {forecast['metrics']['resource_recovery_probability']}%",
        f"Active workflows {operations['active_workflows_count']}",
    ]
    medical_confidence = max(42, min(96, 54 + (100 - forecast["metrics"]["evac_completion_probability"]) // 3 + medical_bonus))
    medical_status = "critical" if medical_confidence >= 82 else "watch" if medical_confidence >= 60 else "active"
    medical_stance = "urgent" if forecast["metrics"]["evac_completion_probability"] <= 55 else "support"
    specs.append((
        "medical_commander",
        "Medical Commander AI",
        "medical_response",
        medical_confidence,
        medical_status,
        medical_stance,
        medical_zone,
        medical_recommendation,
        medical_drivers,
    ))

    security_bonus, security_zone_override, security_reco_override = _scenario_modifier(scenario, "security_control")
    security_zone = security_zone_override or top_zone_name or "Zone 1"
    busy_corridors = len(
        [
            snapshot
            for snapshot in timeline["snapshots"]
            if getattr(snapshot, "corridor_loads", 0) >= 2
        ]
    )
    security_recommendation = security_reco_override or (
        f"Protect evacuation lanes and lock unstable access near {security_zone}"
    )
    security_drivers = [
        f"{busy_corridors} forecast intervals show corridor pressure",
        f"Pending approvals {operations['awaiting_approvals_count']}",
        f"Queued alerts {queued_alerts}",
    ]
    security_confidence = max(40, min(95, 50 + busy_corridors * 8 + operations["awaiting_approvals_count"] * 6 + security_bonus))
    security_status = "critical" if security_confidence >= 82 else "watch" if security_confidence >= 58 else "active"
    security_stance = "urgent" if busy_corridors >= 2 else "caution"
    specs.append((
        "security_commander",
        "Security Commander AI",
        "security_control",
        security_confidence,
        security_status,
        security_stance,
        security_zone,
        security_recommendation,
        security_drivers,
    ))

    logistics_bonus, logistics_zone_override, logistics_reco_override = _scenario_modifier(scenario, "resource_mobility")
    logistics_zone = logistics_zone_override or top_zone_name or "Command Grid"
    logistics_recommendation = logistics_reco_override or (
        f"Shift drones and backup assets toward {logistics_zone}"
    )
    logistics_drivers = [
        f"Resource load {resources['global_load']}",
        f"Recoveries completed {resilience['metrics']['recoveries_completed']}",
        f"Stalled workflows {stalled_workflows}",
    ]
    logistics_confidence = max(38, min(94, 48 + resource_util + stalled_workflows * 7 + logistics_bonus))
    logistics_status = "critical" if resources["global_load"] == "overloaded" else "watch" if logistics_confidence >= 58 else "active"
    logistics_stance = "urgent" if resources["global_load"] == "overloaded" else "support"
    specs.append((
        "logistics_commander",
        "Logistics Commander AI",
        "resource_mobility",
        logistics_confidence,
        logistics_status,
        logistics_stance,
        logistics_zone,
        logistics_recommendation,
        logistics_drivers,
    ))

    executive_bonus, executive_zone_override, executive_reco_override = _scenario_modifier(scenario, "executive_strategy")
    executive_zone = executive_zone_override or top_zone_name
    executive_recommendation = executive_reco_override or (
        "Authorize mutual aid and continuity posture before disruption peaks"
        if executive["financial_impact_level"] in {"high", "severe"}
        else "Maintain continuity posture and preserve executive updates"
    )
    executive_drivers = [
        f"Readiness {readiness['overall_readiness']}",
        f"Financial impact {executive['financial_impact_level']}",
        f"Recovery ETA {forecast['recovery_eta_minutes']} minutes",
    ]
    executive_confidence = max(44, min(97, 52 + (100 - readiness["overall_readiness"]) // 3 + executive_bonus))
    executive_status = "critical" if executive["financial_impact_level"] in {"high", "severe"} else "watch" if executive_confidence >= 60 else "active"
    executive_stance = "urgent" if readiness["overall_readiness"] < 45 else "caution"
    specs.append((
        "executive_strategy",
        "Executive Strategy AI",
        "executive_strategy",
        executive_confidence,
        executive_status,
        executive_stance,
        executive_zone,
        executive_recommendation,
        executive_drivers,
    ))

    comms_bonus, comms_zone_override, comms_reco_override = _scenario_modifier(scenario, "communications_control")
    comms_zone = comms_zone_override or top_zone_name or "Communications Grid"
    comms_recommendation = comms_reco_override or (
        f"Increase alert cadence and role messaging around {comms_zone}"
    )
    comms_drivers = [
        f"Queued alerts {queued_alerts}",
        f"Resilience state {resilience['global_state']}",
        f"Board continuity {executive['operational_continuity']}",
    ]
    comms_confidence = max(40, min(95, 50 + queued_alerts * 7 + resilience["metrics"]["circuits_open"] * 8 + comms_bonus))
    comms_status = "critical" if resilience["global_state"] in {"critical", "degraded"} and queued_alerts >= 1 else "watch" if comms_confidence >= 58 else "active"
    comms_stance = "urgent" if queued_alerts >= 2 else "support"
    specs.append((
        "communications_commander",
        "Communications AI",
        "communications_control",
        comms_confidence,
        comms_status,
        comms_stance,
        comms_zone,
        comms_recommendation,
        comms_drivers,
    ))

    states: list[SpecialistState] = []
    for (
        agent_id,
        name,
        domain,
        confidence,
        status,
        stance,
        priority_zone,
        recommendation,
        drivers,
    ) in specs:
        memory = refresh_agent_memory(
            agent_id,
            alert=drivers[0],
            decision=recommendation,
            failure=drivers[2] if "degraded" in drivers[2].lower() or "stalled" in drivers[2].lower() or "queued alerts" in drivers[0].lower() else None,
            pattern=drivers[1],
        )
        states.append(
            SpecialistState(
                agent_id=agent_id,
                name=name,
                domain=domain,
                status=status,
                confidence=confidence,
                stance=stance,
                priority_zone=priority_zone,
                top_recommendation=recommendation,
                reasoning_drivers=drivers[:3],
                memory_summary=summarize_memory(memory),
                last_updated=_now(),
            )
        )

    return states
