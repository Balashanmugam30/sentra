from __future__ import annotations

from app.models.incident import Incident
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.resources import generate_resource_deployments
from app.simulation.schemas import WarRoomAgentItem
from app.simulation.twin import generate_live_twin_state


def _global_state(system_health: str) -> str:
    if system_health == "critical":
        return "critical"

    if system_health == "stressed":
        return "elevated"

    return "normal"


def _agent_priorities(
    twin: dict[str, object],
    coordinator: dict[str, object],
    resources: dict[str, object],
) -> list[WarRoomAgentItem]:
    top_risk_zone = max(twin["zones"], key=lambda zone: zone.risk_score)
    busiest_corridor = max(
        twin["corridors"],
        key=lambda corridor: corridor.traffic_load,
        default=None,
    )
    top_deployment = resources["deployments"][0] if resources["deployments"] else None
    shortage_pressure = len(resources["shortages"])

    fire_confidence = min(98, 60 + round(top_risk_zone.risk_score * 0.35))
    medical_confidence = min(
        95,
        58 + (12 if twin["global_mode"] in {"evacuation", "critical", "lockdown"} else 0),
    )
    security_confidence = min(
        94,
        55 + (busy_count := len([corridor for corridor in twin["corridors"] if corridor.status == "busy"])) * 10,
    )
    logistics_confidence = min(
        93,
        52 + shortage_pressure * 12 + (8 if resources["global_load"] != "normal" else 0),
    )

    agents = [
        WarRoomAgentItem(
            name="Fire Agent",
            priority=f"Contain {top_risk_zone.zone} immediately",
            confidence=fire_confidence,
        ),
        WarRoomAgentItem(
            name="Medical Agent",
            priority=f"Prepare triage near {top_risk_zone.zone if top_risk_zone.status == 'evacuating' else 'Zone 1'}",
            confidence=medical_confidence,
        ),
        WarRoomAgentItem(
            name="Security Agent",
            priority=(
                f"Lock corridor {busiest_corridor.from_zone} -> {busiest_corridor.to_zone}"
                if busiest_corridor is not None
                else "Secure primary evacuation corridors"
            ),
            confidence=security_confidence,
        ),
        WarRoomAgentItem(
            name="Logistics Agent",
            priority=(
                f"Move drone to {top_deployment.zone}"
                if top_deployment is not None and top_deployment.drone_support
                else f"Stage logistics support near {top_risk_zone.zone}"
            ),
            confidence=logistics_confidence,
        ),
    ]

    return agents


def _conflicts(agents: list[WarRoomAgentItem], twin: dict[str, object]) -> list[str]:
    conflicts: list[str] = []
    security_priority = next((agent.priority for agent in agents if agent.name == "Security Agent"), "")
    medical_priority = next((agent.priority for agent in agents if agent.name == "Medical Agent"), "")

    if "Lock corridor" in security_priority and "triage near" in medical_priority:
        conflicts.append("Medical wants corridor open while Security wants closure")

    if twin["global_mode"] == "evacuation" and any(corridor.status == "busy" for corridor in twin["corridors"]):
        conflicts.append("Evacuation flow competes with responder corridor access")

    return conflicts[:3]


def _consensus_plan(
    agents: list[WarRoomAgentItem],
    conflicts: list[str],
    coordinator: dict[str, object],
) -> list[str]:
    plan: list[str] = []

    if conflicts:
        plan.append("Open one controlled lane for medics")

    fire_agent = next((agent for agent in agents if agent.name == "Fire Agent"), None)
    if fire_agent is not None:
        zone = fire_agent.priority.replace("Contain ", "").replace(" immediately", "")
        plan.append(f"Deploy fire teams to {zone}")

    evacuation_action = next(
        (
            action.action
            for action in coordinator["coordinated_actions"]
            if action.agent == "communications" and "reroute via" in action.action
        ),
        None,
    )
    if evacuation_action is not None:
        reroute_zone = evacuation_action.split("reroute via ", 1)[1]
        plan.append(f"Evacuate civilians via {reroute_zone}")

    if not plan:
        plan.append("Maintain unified command posture")

    return plan[:4]


def _commander_decision(global_state: str, conflicts: list[str], twin: dict[str, object]) -> str:
    if global_state == "critical" and conflicts:
        return "Controlled evacuation with tactical containment"

    if twin["global_mode"] == "lockdown":
        return "Full lockdown with corridor hardening"

    if twin["global_mode"] == "evacuation":
        return "Coordinated evacuation with perimeter protection"

    return "Stabilize scene and hold response lanes"


def _response_score(
    agents: list[WarRoomAgentItem],
    conflicts: list[str],
    coordinator_score: int,
) -> int:
    average_confidence = round(sum(agent.confidence for agent in agents) / max(len(agents), 1))
    score = round((average_confidence * 0.55) + (coordinator_score * 0.45) - (len(conflicts) * 7))
    return max(0, min(100, score))


def generate_warroom_state(incidents: list[Incident]) -> dict[str, object]:
    twin = generate_live_twin_state(incidents)
    coordinator = generate_coordination_intelligence(incidents)
    resources = generate_resource_deployments(incidents)

    global_state = _global_state(twin["system_health"])
    agents = _agent_priorities(twin, coordinator, resources)
    conflicts = _conflicts(agents, twin)
    consensus_plan = _consensus_plan(agents, conflicts, coordinator)
    commander_decision = _commander_decision(global_state, conflicts, twin)
    response_score = _response_score(agents, conflicts, coordinator["cross_agent_score"])

    return {
        "global_state": global_state,
        "agents": agents,
        "conflicts": conflicts,
        "consensus_plan": consensus_plan,
        "commander_decision": commander_decision,
        "response_score": response_score,
    }
