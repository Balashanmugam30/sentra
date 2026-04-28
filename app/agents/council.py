from __future__ import annotations

from statistics import mean
from types import SimpleNamespace

from app.agents.learning import get_learning_adjustments
from app.agents.memory import get_agent_memory_snapshot, reset_agent_state, set_test_scenario
from app.agents.specialists import build_specialist_states
from app.models.incident import Incident


def _global_state(agents: list[object]) -> str:
    critical = len([agent for agent in agents if getattr(agent, "status", "") == "critical"])
    urgent = len([agent for agent in agents if getattr(agent, "stance", "") == "urgent"])
    if critical >= 4 or urgent >= 4:
        return "emergency"
    if critical >= 2 or urgent >= 2:
        return "critical"
    if any(getattr(agent, "status", "") == "watch" for agent in agents):
        return "elevated"
    return "stable"


def _alignment_score(agents: list[object]) -> int:
    if not agents:
        return 100
    zones = [getattr(agent, "priority_zone", None) for agent in agents if getattr(agent, "priority_zone", None)]
    dominant_zone_count = max((zones.count(zone) for zone in set(zones)), default=1)
    urgent_agents = len([agent for agent in agents if getattr(agent, "stance", "") == "urgent"])
    oppose_agents = len([agent for agent in agents if getattr(agent, "stance", "") == "oppose"])
    shared_recommendations = len({getattr(agent, "top_recommendation", "") for agent in agents})
    score = round(
        48
        + (dominant_zone_count / max(len(agents), 1)) * 32
        + urgent_agents * 3
        - oppose_agents * 9
        - max(shared_recommendations - 3, 0) * 2
    )
    return max(0, min(100, score))


def _council_health(agents: list[object], alignment_score: int) -> int:
    if not agents:
        return 0
    avg_confidence = round(mean(getattr(agent, "confidence", 0) for agent in agents))
    offline_count = len([agent for agent in agents if getattr(agent, "status", "") == "offline"])
    health = round((avg_confidence * 0.72) + (alignment_score * 0.28) - (offline_count * 20))
    return max(0, min(100, health))


def _top_priorities(agents: list[object]) -> list[str]:
    ordered = sorted(
        agents,
        key=lambda agent: (getattr(agent, "stance", "") != "urgent", -getattr(agent, "confidence", 0)),
    )
    return [getattr(agent, "top_recommendation", "") for agent in ordered[:4]]


def _shared_risks(agents: list[object]) -> list[str]:
    risks: list[str] = []
    for agent in agents:
        for driver in getattr(agent, "reasoning_drivers", [])[:2]:
            if driver not in risks:
                risks.append(driver)
    return risks[:4]


def _recommended_joint_plan(agents: list[object]) -> list[str]:
    plan: list[str] = []
    zone = next((getattr(agent, "priority_zone", None) for agent in agents if getattr(agent, "stance", "") == "urgent"), None)
    if zone:
        plan.append(f"Concentrate multi-domain response around {zone}")
    plan.extend(_top_priorities(agents)[:2])
    if any("mutual aid" in getattr(agent, "top_recommendation", "").lower() for agent in agents):
        plan.append("Prepare executive authorization path for external support")
    deduped: list[str] = []
    for item in plan:
        if item not in deduped:
            deduped.append(item)
    return deduped[:4]


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _apply_learning_adjustments(agent_payloads: list[dict[str, object]]) -> list[dict[str, object]]:
    adjustments = get_learning_adjustments()
    strategy_weights = adjustments["strategy_weights"]
    confidence_adjustments = adjustments["agent_confidence_adjustments"]

    adjusted: list[dict[str, object]] = []
    for agent in agent_payloads:
        item = {**agent}
        item["confidence"] = _clamp(
            int(item["confidence"]) + int(confidence_adjustments.get(item["agent_id"], 0)),
            0,
            100,
        )

        if item["agent_id"] in {"medical_commander", "security_commander"} and strategy_weights.get("corridor_first", 50) >= 60:
            if "corridor" not in str(item["top_recommendation"]).lower():
                item["top_recommendation"] = f"{item['top_recommendation']} with protected corridor priority"
            item["reasoning_drivers"] = [*list(item["reasoning_drivers"])[:2], "learning favors corridor-first containment"]
            if item["stance"] == "caution":
                item["stance"] = "support"

        if item["agent_id"] == "executive_strategy":
            if strategy_weights.get("full_lockdown", 50) <= 46:
                item["top_recommendation"] = "Favor protected corridor + selective lockdown over blanket closure"
                if item["stance"] == "urgent":
                    item["stance"] = "caution"
                item["reasoning_drivers"] = [*list(item["reasoning_drivers"])[:2], "learning penalizes costly blanket lockdowns"]
            elif strategy_weights.get("mutual_aid_early", 50) >= 60 and "mutual aid" not in str(item["top_recommendation"]).lower():
                item["top_recommendation"] = "Authorize mutual aid earlier to compress recovery window"
                item["reasoning_drivers"] = [*list(item["reasoning_drivers"])[:2], "learning supports earlier mutual aid timing"]

        if item["agent_id"] == "logistics_commander" and strategy_weights.get("reserve_preserve", 50) >= 60:
            item["top_recommendation"] = "Shift drones while preserving tactical reserve for secondary escalation"
            item["reasoning_drivers"] = [*list(item["reasoning_drivers"])[:2], "learning rewards reserve-preserving logistics"]

        item["reasoning_drivers"] = list(dict.fromkeys(item["reasoning_drivers"]))[:3]
        adjusted.append(item)

    return adjusted


def generate_council_snapshot(incidents: list[Incident]) -> dict[str, object]:
    specialist_states = build_specialist_states(incidents)
    agent_payloads = _apply_learning_adjustments(
        [
            {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "domain": agent.domain,
                "status": agent.status,
                "confidence": agent.confidence,
                "stance": agent.stance,
                "priority_zone": agent.priority_zone,
                "top_recommendation": agent.top_recommendation,
                "reasoning_drivers": agent.reasoning_drivers,
                "memory_summary": agent.memory_summary,
                "last_updated": agent.last_updated,
            }
            for agent in specialist_states
        ]
    )
    agents = [SimpleNamespace(**agent) for agent in agent_payloads]
    alignment_score = _alignment_score(agents)
    council_health = _council_health(agents, alignment_score)
    global_state = _global_state(agents)
    top_priorities = _top_priorities(agents)
    shared_risks = _shared_risks(agents)
    joint_plan = _recommended_joint_plan(agents)
    learning = get_learning_adjustments()
    command_summary = (
        f"{len([agent for agent in agents if agent.status == 'critical'])} specialists are at critical posture; "
        f"alignment is {alignment_score}% and council health is {council_health}%. "
        f"Learning currently favors {str(learning['best_strategy']).replace('_', ' ')}."
    )

    return {
        "global_state": global_state,
        "council_health": council_health,
        "alignment_score": alignment_score,
        "agents": agent_payloads,
        "top_priorities": top_priorities,
        "shared_risks": shared_risks,
        "recommended_joint_plan": joint_plan,
        "command_summary": command_summary,
    }


def generate_memory_snapshot() -> dict[str, object]:
    return {"agents": get_agent_memory_snapshot()}


def generate_council_focus_weights(incidents: list[Incident]) -> dict[str, int]:
    snapshot = generate_council_snapshot(incidents)
    weights: dict[str, int] = {}
    for agent in snapshot["agents"]:
        zone = agent.get("priority_zone")
        if not zone:
            continue
        stance_bonus = 8 if agent.get("stance") == "urgent" else 4 if agent.get("stance") == "support" else 2
        weight = round(agent.get("confidence", 0) * 0.12) + stance_bonus
        weights[zone] = weights.get(zone, 0) + weight
    return weights


def reset_council_state() -> dict[str, object]:
    count = reset_agent_state()
    return {"status": "reset", "agents_reset": count}


def apply_test_scenario(incidents: list[Incident], scenario: str) -> dict[str, object]:
    set_test_scenario(scenario)
    return generate_council_snapshot(incidents)


def apply_optimization_scenario(incidents: list[Incident], scenario: str | None) -> dict[str, object]:
    mapped = scenario
    if scenario == "dual_incident":
        mapped = "critical_fire"
    elif scenario == "citywide_pressure":
        mapped = "resource_shortage"

    if mapped is None:
        return generate_council_snapshot(incidents)

    set_test_scenario(mapped)
    return generate_council_snapshot(incidents)
