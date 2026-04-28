from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any

from app.ai.memory import append_decision_memory, list_decision_memory, memory_summary
from app.ai.playbooks import get_playbook
from app.environment.engine import build_environment_live_snapshot
from app.geospatial.engine import build_geo_live_snapshot
from app.osint.engine import build_osint_live_snapshot
from app.public_safety.engine import build_public_safety_live_snapshot
from app.services.incident_service import get_all_incidents
from app.soc.engine import build_soc_detections_snapshot


_state_lock = Lock()
_state: dict[str, Any] = {
    "scenario": "baseline",
    "autonomy_mode": "approval_required",
    "cycle": 0,
}
_cache: dict[str, Any] = {"expires": 0.0, "snapshot": None}


SCENARIO_PROFILES: dict[str, dict[str, Any]] = {
    "zone_fire_escalation": {"threat": "fire", "zone": "Zone 2", "boost": 48},
    "gas_leak_north": {"threat": "gas", "zone": "Zone 4", "boost": 48},
    "panic_gate_a": {"threat": "panic", "zone": "Zone 1", "boost": 46},
    "coordinated_intrusion": {"threat": "intrusion", "zone": "Zone 5", "boost": 46},
    "cyber_dashboard_attack": {"threat": "cyber", "zone": "Command Network", "boost": 48},
    "city_power_failure": {"threat": "power", "zone": "Campus", "boost": 48},
    "fake_rumor_wave": {"threat": "misinformation", "zone": "Public Channels", "boost": 46},
    "tower_fire_spread": {"threat": "fire", "zone": "Tower A", "boost": 50},
    "gas_leak_basement": {"threat": "gas", "zone": "Basement", "boost": 50},
    "crowd_panic_gate_a": {"threat": "panic", "zone": "Gate A", "boost": 48},
    "city_grid_failure": {"threat": "power", "zone": "Campus", "boost": 50},
    "cyber_ransomware_attack": {"threat": "cyber", "zone": "Command Network", "boost": 50},
    "cyclone_landfall": {"threat": "storm", "zone": "Campus", "boost": 50},
    "misinformation_viral_wave": {"threat": "misinformation", "zone": "Public Channels", "boost": 48},
    "baseline": {"threat": "fire", "zone": "Zone 2", "boost": 0},
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def set_test_scenario(scenario: str) -> None:
    with _state_lock:
        _state["scenario"] = scenario
        _state["cycle"] = int(_state.get("cycle", 0)) + 1
        _cache["expires"] = 0.0


def set_autonomy_mode(mode: str) -> None:
    with _state_lock:
        _state["autonomy_mode"] = mode
        _cache["expires"] = 0.0


def _safe_snapshot(builder, fallback: dict[str, Any]) -> dict[str, Any]:
    try:
        return builder()
    except Exception:
        return fallback


def _collect_signals() -> dict[str, Any]:
    incidents = get_all_incidents()
    return {
        "incidents": incidents,
        "geo": _safe_snapshot(lambda: build_geo_live_snapshot(summary_only=True), {"incidents": [], "hotspots": []}),
        "environment": _safe_snapshot(
            lambda: build_environment_live_snapshot(summary_only=True),
            {"global_hazard_score": 20, "hazards": {}, "operational_impacts": {}},
        ),
        "public_safety": _safe_snapshot(
            lambda: build_public_safety_live_snapshot(summary_only=True, incidents=incidents),
            {"global_pressure": 18, "public_alerts": []},
        ),
        "osint": _safe_snapshot(
            lambda: build_osint_live_snapshot(summary_only=True),
            {"reputation_risk": 18, "mention_volume": 0, "external_alerts": [], "top_keywords": []},
        ),
        "soc": _safe_snapshot(lambda: build_soc_detections_snapshot(), {"detections": []}),
    }


def _score_threats(signals: dict[str, Any], scenario: str) -> dict[str, int]:
    incidents = signals["incidents"]
    env_score = int(signals["environment"].get("global_hazard_score", 20))
    public_pressure = int(signals["public_safety"].get("global_pressure", 18))
    reputation = int(signals["osint"].get("reputation_risk", 18))
    detections = len(signals["soc"].get("detections", []))
    geo_incidents = signals["geo"].get("incidents", [])

    scores = {
        "fire": env_score + len([item for item in geo_incidents if "fire" in str(item.get("type", ""))]) * 12,
        "gas": int(signals["environment"].get("hazards", {}).get("smoke_risk", 16)) + env_score // 3,
        "panic": public_pressure + reputation // 3,
        "intrusion": detections * 12 + public_pressure // 3,
        "cyber": detections * 14 + reputation // 4,
        "power": 18 + public_pressure // 2,
        "misinformation": reputation + int(signals["osint"].get("mention_volume", 0)) // 5,
        "storm": env_score + public_pressure // 2,
    }
    for incident in incidents:
        text = f"{incident.type} {incident.incident_type} {incident.recommended_action}".lower()
        severity = int(getattr(incident, "severity", 3) or 3)
        if "fire" in text or "smoke" in text:
            scores["fire"] += severity * 9
        if "gas" in text or "toxic" in text:
            scores["gas"] += severity * 9
        if "panic" in text or "crowd" in text:
            scores["panic"] += severity * 8

    scenario_profile = SCENARIO_PROFILES.get(scenario, SCENARIO_PROFILES["baseline"])
    scores[str(scenario_profile["threat"])] += int(scenario_profile["boost"])
    return {key: max(0, min(100, value)) for key, value in scores.items()}


def _affected_zones(signals: dict[str, Any], scenario: str) -> list[str]:
    zones = []
    profile = SCENARIO_PROFILES.get(scenario, SCENARIO_PROFILES["baseline"])
    zones.append(str(profile["zone"]))
    for item in signals["geo"].get("incidents", [])[:3]:
        zone = str(item.get("zone") or "")
        if zone and zone not in zones:
            zones.append(zone)
    return zones[:4]


def _recommendations(threat: str, urgency: int, confidence: int, zones: list[str], signals: list[str]) -> list[dict[str, Any]]:
    zone = zones[0] if zones else "Zone 2"
    playbook = get_playbook(threat)
    templates = {
        "fire": [
            ("Evacuate protected corridor", "evacuation", "Open guided evacuation through safest corridor while fire teams suppress source.", True),
            ("Dispatch Fire Team Alpha", "dispatch", "Send highest-effectiveness suppression team to the active fire zone.", False),
            ("Lock south corridor selectively", "facility_control", "Prevent smoke migration without blocking medical egress.", True),
        ],
        "gas": [
            ("Shut down HVAC in hazard zone", "facility_control", "Stop air recirculation before gas disperses into occupied corridors.", True),
            ("Route responders upwind", "routing", "Reduce responder exposure while maintaining access to isolation valves.", False),
            ("Stage medical triage outside plume", "medical", "Prepare casualty support without crowding the hazard boundary.", False),
        ],
        "panic": [
            ("Pause entry gates", "crowd_control", "Reduce inflow pressure while supervised exit lanes stabilize.", True),
            ("Broadcast calm instructions", "communications", "Lower rumor-driven urgency and direct people to verified routes.", False),
            ("Dispatch crowd stewards", "field", "Move responders to queue edges for flow control.", False),
        ],
        "intrusion": [
            ("Lock affected corridor", "security", "Contain unauthorized movement while preserving emergency exits.", True),
            ("Dispatch security sweep", "field", "Verify threat location with responders and CCTV metadata.", False),
            ("Escalate access-control watch", "facility_control", "Increase scrutiny on adjacent doors and checkpoints.", True),
        ],
        "cyber": [
            ("Switch autonomy to advisory-only", "governance", "Prevent sensitive control execution during suspected dashboard attack.", True),
            ("Freeze privileged actions", "security", "Reduce blast radius while SOC validates sessions.", True),
            ("Route command through manual channel", "operations", "Preserve crisis execution if digital trust is degraded.", False),
        ],
        "power": [
            ("Activate backup power", "facility_control", "Preserve life-safety systems and command connectivity.", True),
            ("Enable offline local mode", "resilience", "Keep field tasks and hardware controls operational without WAN.", False),
            ("Dispatch facility inspection", "field", "Verify generator and transfer switch state.", False),
        ],
        "misinformation": [
            ("Trigger public statement", "communications", "Counter false claims before panic spreads.", True),
            ("Cross-check environment claims", "intelligence", "Validate toxic or fire rumors against sensors and weather.", False),
            ("Brief executive spokesperson", "executive", "Align leadership message with verified operational facts.", False),
        ],
        "storm": [
            ("Pre-stage storm response teams", "dispatch", "Move responders and medical reserves ahead of wind and flood disruption.", False),
            ("Activate backup generator watch", "facility_control", "Protect command, lighting, elevators, and life-safety power during grid instability.", True),
            ("Issue shelter and route advisory", "communications", "Prevent outdoor movement into flood or wind-exposed corridors.", True),
        ],
    }
    actions = []
    for index, (title, action_type, why, approval) in enumerate(templates.get(threat, templates["fire"]), start=1):
        actions.append(
            {
                "recommendation_id": f"AI-{threat.upper()}-{index:02d}",
                "title": title,
                "action_type": action_type,
                "zone": zone,
                "why": f"{why} Playbook: {playbook['primary']}",
                "urgency": max(30, min(100, urgency - (index - 1) * 7)),
                "confidence": max(42, min(98, confidence - (index - 1) * 5)),
                "expected_impact": "Reduces exposure and time-to-stability while preserving human override.",
                "approval_required": approval,
                "execute_action": title.lower().replace(" ", "_"),
                "signals": signals[:4],
            }
        )
    return actions


def _agent_opinions(threat: str, urgency: int, confidence: int, zone: str) -> list[dict[str, Any]]:
    base = [
        ("security", "Security Agent", "access_control", "Contain threat movement and protect restricted corridors"),
        ("operations", "Operations Agent", "workflow_execution", "Prioritize field tasking and response sequencing"),
        ("infrastructure", "Infrastructure Agent", "facility_hardware", "Use facility controls to reduce spread"),
        ("communications", "Public Communications Agent", "public_messaging", "Reduce panic with verified instructions"),
        ("executive", "Executive Strategy Agent", "continuity", "Protect continuity, reputation, and governance posture"),
        ("medical", "Medical / Safety Agent", "life_safety", "Preserve evacuation lanes and triage capacity"),
    ]
    opinions = []
    for index, (agent_id, name, domain, rationale) in enumerate(base):
        stance = "support"
        if threat in {"fire", "gas"} and agent_id == "executive":
            stance = "conditional"
        if threat == "cyber" and agent_id == "infrastructure":
            stance = "concern"
        opinions.append(
            {
                "agent_id": agent_id,
                "name": name,
                "domain": domain,
                "proposed_action": f"{name} recommends {threat.replace('_', ' ')} playbook in {zone}.",
                "confidence": max(40, min(96, confidence - index * 3)),
                "urgency": max(35, min(100, urgency - index * 2)),
                "rationale": rationale,
                "stance": stance,
            }
        )
    return opinions


def build_autonomous_snapshot(*, force: bool = False) -> dict[str, Any]:
    now = utc_now()
    if not force and _cache["snapshot"] is not None and now.timestamp() < float(_cache["expires"]):
        return dict(_cache["snapshot"])

    with _state_lock:
        scenario = str(_state["scenario"])
        autonomy_mode = str(_state["autonomy_mode"])

    signals = _collect_signals()
    scores = _score_threats(signals, scenario)
    top_threat = max(scores, key=scores.get)
    urgency = scores[top_threat]
    confidence = max(58, min(96, 62 + urgency // 4 + len(signals["soc"].get("detections", [])) * 2))
    zones = _affected_zones(signals, scenario)
    signal_trace = [
        f"Threat score {top_threat}={urgency}",
        f"Environment hazard {signals['environment'].get('global_hazard_score', 0)}",
        f"Public pressure {signals['public_safety'].get('global_pressure', 0)}",
        f"Reputation risk {signals['osint'].get('reputation_risk', 0)}",
        f"SOC detections {len(signals['soc'].get('detections', []))}",
    ]
    actions = _recommendations(top_threat, urgency, confidence, zones, signal_trace)
    agents = _agent_opinions(top_threat, urgency, confidence, zones[0])
    support = len([agent for agent in agents if agent["stance"] == "support"])
    agreement = round((support / len(agents)) * 100)
    posture = (
        "manual_hold"
        if autonomy_mode in {"paused", "manual_control", "advisory"}
        else "active_response"
        if urgency >= 75 or autonomy_mode in {"semi_auto", "full_auto", "lockdown_emergency"}
        else "advising"
    )
    explanation = {
        "generated_at": now,
        "decision_id": actions[0]["recommendation_id"],
        "why_this_action": actions[0]["why"],
        "signals_considered": signal_trace,
        "rejected_alternatives": [
            "Full lockdown rejected where it would slow evacuation or medical access.",
            "Passive monitoring rejected because fused urgency exceeds advisory threshold.",
        ],
        "confidence_factors": [
            "Multiple independent signal families agree on affected priority.",
            "Decision memory favors corridor-first and controlled facility actions.",
        ],
        "human_readable_trace": [
            f"Detected {top_threat} as dominant threat.",
            f"Mapped affected zones: {', '.join(zones)}.",
            f"Selected action: {actions[0]['title']}.",
            f"Human approval required: {'yes' if actions[0]['approval_required'] else 'no'}.",
        ],
    }
    snapshot = {
        "generated_at": now,
        "autonomy_mode": autonomy_mode,
        "ai_posture": posture,
        "top_threat": top_threat.replace("_", " "),
        "urgency_score": urgency,
        "confidence_score": confidence,
        "affected_zones": zones,
        "estimated_damage": "High operational exposure" if urgency >= 75 else "Moderate controlled exposure",
        "recovery_eta": f"{max(12, 48 - urgency // 3)} minutes",
        "reasoning_summary": f"Fusion selected {top_threat} because live signals show urgency {urgency}/100 with confidence {confidence}/100.",
        "top_decision": actions[0],
        "recommended_actions": actions,
        "consensus": {
            "generated_at": now,
            "agreement_percent": agreement,
            "final_merged_strategy": get_playbook(top_threat)["primary"],
            "disagreements": [
                "Executive strategy requests continuity guardrails before broad lockdown."
            ] if agreement < 100 else [],
            "minority_concerns": [
                "Medical / Safety requires protected evacuation lane before sealing corridors."
            ] if top_threat in {"fire", "gas"} else [],
            "fallback_strategy": get_playbook(top_threat)["fallback"],
            "agents": agents,
        },
        "explanation": explanation,
        "memory_summary": memory_summary(),
    }
    _cache.update({"snapshot": snapshot, "expires": now.timestamp() + 4})
    return dict(snapshot)


def record_decision(*, recommendation_id: str, status: str, scenario: str | None = None) -> dict[str, Any]:
    live = build_autonomous_snapshot(force=True)
    action = next(
        (item for item in live["recommended_actions"] if item["recommendation_id"] == recommendation_id),
        live["top_decision"],
    )
    quality_delta = 8 if status == "approved" else -8 if status == "rejected" else 3
    return append_decision_memory(
        decision=action["title"],
        status=status,
        scenario=scenario or str(_state["scenario"]),
        outcome_quality=max(20, min(100, int(action["confidence"]) + quality_delta)),
        response_speed=max(20, min(100, int(action["urgency"]) - 8)),
        false_alarm=status == "rejected" and int(action["confidence"]) < 70,
        time_to_stabilize_minutes=max(8, 42 - int(action["urgency"]) // 3),
        lesson=f"{action['title']} was {status}; future confidence adjusts around {action['action_type']} timing.",
    )


def run_cycle(scenario: str | None = None) -> dict[str, Any]:
    if scenario:
        set_test_scenario(scenario)
    with _state_lock:
        _state["cycle"] = int(_state.get("cycle", 0)) + 1
    live = build_autonomous_snapshot(force=True)
    append_decision_memory(
        decision=live["top_decision"]["title"],
        status="observed",
        scenario=scenario or str(_state["scenario"]),
        outcome_quality=live["confidence_score"],
        response_speed=live["urgency_score"],
        false_alarm=False,
        time_to_stabilize_minutes=int(str(live["recovery_eta"]).split(" ", 1)[0]),
        lesson=f"Cycle observed {live['top_threat']} and selected {live['top_decision']['title']}.",
    )
    return live


def get_explanations() -> list[dict[str, Any]]:
    live = build_autonomous_snapshot()
    secondary = dict(live["explanation"])
    secondary["decision_id"] = "AI-ALT-01"
    secondary["why_this_action"] = "Alternative retained as fallback if primary action is rejected or field conditions degrade."
    return [live["explanation"], secondary]


def get_memory() -> list[dict[str, Any]]:
    return list_decision_memory()
