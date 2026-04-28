from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.decision_engine import build_autonomous_snapshot
from app.ai.orchestration import build_resource_rebalancer
from app.ai.strategic_learning import build_weak_signals


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def _target_for(threat: str, zone: str, swarm: str) -> str:
    if swarm == "cyber_defense_swarm":
        return "Command Network"
    if swarm == "traffic_control_swarm":
        return "Priority corridors"
    if swarm == "comms_swarm":
        return "Occupants and public channels"
    if swarm == "medical_swarm":
        return f"Triage edge near {zone}"
    if swarm == "drone_swarm":
        return f"Recon orbit over {zone}"
    return f"{threat.title()} response in {zone}"


def build_swarm_snapshot() -> dict[str, Any]:
    live = build_autonomous_snapshot()
    resources = build_resource_rebalancer()
    weak = build_weak_signals()
    urgency = int(live["urgency_score"])
    confidence = int(live["confidence_score"])
    reserve = int(resources["reserve_readiness"])
    zone = str(live["affected_zones"][0])
    threat = str(live["top_threat"])
    swarm_seed = [
        ("responder_swarm", "Responder Swarm", 6, 0.92, ["medical corridor", "suppression route"]),
        ("drone_swarm", "Drone Swarm", 3, 0.86, ["smoke plume", "blocked egress"]),
        ("comms_swarm", "Comms Swarm", 4, 0.82, ["rumor channel", "occupant instructions"]),
        ("cyber_defense_swarm", "Cyber Defense Swarm", 5, 0.78, ["privileged sessions", "command API"]),
        ("traffic_control_swarm", "Traffic Control Swarm", 4, 0.84, ["ambulance lane", "gate choke"]),
        ("medical_swarm", "Medical Swarm", 3, 0.88, ["triage staging", "casualty corridor"]),
    ]
    swarms: list[dict[str, Any]] = []
    for index, (swarm_id, name, units, multiplier, bottlenecks) in enumerate(swarm_seed):
        efficiency = _clamp(confidence * multiplier + reserve * 0.18 - index * 2)
        autonomy = "semi_auto" if confidence >= 76 and urgency >= 65 else "approval_required"
        reroutes = max(1, round(urgency / 28) - index % 2)
        swarms.append(
            {
                "swarm_id": swarm_id,
                "name": name,
                "units_active": units + (1 if urgency >= 76 and index in {0, 4} else 0),
                "current_target": _target_for(threat, zone, swarm_id),
                "efficiency_score": efficiency,
                "reroutes": reroutes,
                "bottlenecks": bottlenecks[: 1 + (urgency >= 70)],
                "autonomy_level": autonomy,
            }
        )
    return {
        "generated_at": _now(),
        "swarm_posture": "coordinated_response" if urgency >= 65 else "strategic_watch",
        "global_efficiency": _clamp(sum(int(item["efficiency_score"]) for item in swarms) / len(swarms)),
        "active_swarms": swarms,
        "priority_target": weak["highest_probability"]["weak_signal"],
        "coordination_summary": f"{len(swarms)} swarms are reallocating around {zone} with {confidence}% AI confidence.",
    }
