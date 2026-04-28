from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.store import ai_decision_store


SCENARIOS: dict[str, dict[str, Any]] = {
    "hotel_kitchen_fire": {
        "label": "Hotel kitchen fire",
        "incident_type": "fire",
        "building": "Grand Meridian Hotel",
        "zone": "Kitchen Zone B",
        "floor": "3",
        "building_type": "hotel",
        "occupancy": 428,
        "responders_eta_minutes": 2,
        "blocked_exits": ["West service corridor"],
        "signals": ["flame_detected", "smoke_confidence_72", "gas_elevated", "camera_validation_requested"],
        "node_health": 88,
        "camera_confidence": 81,
        "weather": "clear",
        "time_of_day": "evening dinner rush",
        "prior_incidents": 2,
    },
    "basement_gas_leak": {
        "label": "Basement gas leak",
        "incident_type": "gas",
        "building": "Grand Meridian Hotel",
        "zone": "Basement generator bay",
        "floor": "B1",
        "building_type": "hotel",
        "occupancy": 96,
        "responders_eta_minutes": 4,
        "blocked_exits": [],
        "signals": ["gas_danger", "temperature_rising", "ventilation_warning"],
        "node_health": 79,
        "camera_confidence": 68,
        "weather": "humid",
        "time_of_day": "late night",
        "prior_incidents": 1,
    },
    "hospital_oxygen_leak": {
        "label": "Hospital oxygen leak",
        "incident_type": "medical_infra",
        "building": "Bala Hospital",
        "zone": "ICU oxygen manifold",
        "floor": "2",
        "building_type": "hospital",
        "occupancy": 612,
        "responders_eta_minutes": 3,
        "blocked_exits": ["Service lift bank"],
        "signals": ["oxygen_pressure_drop", "panic_button", "staff_escalation", "camera_visibility_clear"],
        "node_health": 91,
        "camera_confidence": 84,
        "weather": "clear",
        "time_of_day": "day shift",
        "prior_incidents": 0,
    },
    "mall_crowd_surge": {
        "label": "Mall crowd surge",
        "incident_type": "crowd",
        "building": "Metro Mall",
        "zone": "Main atrium",
        "floor": "G",
        "building_type": "mall",
        "occupancy": 2400,
        "responders_eta_minutes": 5,
        "blocked_exits": ["North escalator"],
        "signals": ["crowd_density_86", "queue_congestion_78", "panic_cluster"],
        "node_health": 86,
        "camera_confidence": 89,
        "weather": "rain outside",
        "time_of_day": "weekend peak",
        "prior_incidents": 3,
    },
    "power_outage_blockage": {
        "label": "Power outage + blockage",
        "incident_type": "utility",
        "building": "Bala University",
        "zone": "Engineering block",
        "floor": "5",
        "building_type": "university",
        "occupancy": 780,
        "responders_eta_minutes": 6,
        "blocked_exits": ["Stairwell A", "Elevator bank"],
        "signals": ["power_failure", "blocked_exit", "backup_lighting_degraded"],
        "node_health": 73,
        "camera_confidence": 72,
        "weather": "storm warning",
        "time_of_day": "class changeover",
        "prior_incidents": 1,
    },
    "false_alarm_validation": {
        "label": "False alarm validation",
        "incident_type": "validation",
        "building": "Grand Meridian Hotel",
        "zone": "Laundry utility",
        "floor": "2",
        "building_type": "hotel",
        "occupancy": 88,
        "responders_eta_minutes": 2,
        "blocked_exits": [],
        "signals": ["single_smoke_sensor", "camera_clear", "node_health_good"],
        "node_health": 94,
        "camera_confidence": 93,
        "weather": "clear",
        "time_of_day": "midday",
        "prior_incidents": 0,
    },
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def list_decision_scenarios() -> list[dict[str, str]]:
    return [{"scenario_id": key, "label": str(value["label"])} for key, value in SCENARIOS.items()]


def load_decision_scenario(scenario_id: str) -> dict[str, Any]:
    if scenario_id not in SCENARIOS:
        scenario_id = "hotel_kitchen_fire"
    ai_decision_store.set_scenario(scenario_id)
    return run_decision(scenario_id)


def _score_context(context: dict[str, Any]) -> dict[str, int | str]:
    signals = set(str(signal) for signal in context["signals"])
    occupancy = int(context["occupancy"])
    blocked_count = len(context["blocked_exits"])
    eta = int(context["responders_eta_minutes"])
    incident_type = str(context["incident_type"])

    base = 34
    if incident_type in {"fire", "gas", "medical_infra"}:
        base += 28
    if "flame_detected" in signals or "gas_danger" in signals or "oxygen_pressure_drop" in signals:
        base += 18
    if occupancy >= 400:
        base += 12
    if blocked_count:
        base += blocked_count * 7
    if eta > 4:
        base += 5
    severity_score = min(100, base)
    escalation_risk = min(100, severity_score - 8 + blocked_count * 7 + int(context["prior_incidents"]) * 3)
    people_impact = min(100, round(occupancy / 30) + blocked_count * 12 + (18 if incident_type in {"fire", "crowd"} else 8))
    business_impact = min(100, 48 + (18 if context["building_type"] in {"hotel", "hospital"} else 10) + int(context["prior_incidents"]) * 4)
    urgency = "critical" if severity_score >= 82 else "high" if severity_score >= 64 else "watch"
    return {
        "severity_score": severity_score,
        "escalation_risk": escalation_risk,
        "people_impact_score": people_impact,
        "business_impact_score": business_impact,
        "urgency_level": urgency,
    }


def _build_strategies(context: dict[str, Any], scores: dict[str, int | str]) -> list[dict[str, Any]]:
    severity = int(scores["severity_score"])
    blocked = len(context["blocked_exits"])
    eta = int(context["responders_eta_minutes"])
    options = [
        {
            "option_id": "A",
            "name": "Immediate evacuation",
            "success_probability": min(97, 68 + severity // 4 - blocked * 3),
            "estimated_evacuation_time": f"{max(4, 12 - eta)} min",
            "casualty_reduction_estimate": min(94, 54 + severity // 3),
            "operational_disruption": 78,
            "confidence": 88,
        },
        {
            "option_id": "B",
            "name": "Targeted zone lockdown",
            "success_probability": 74 if severity < 85 else 62,
            "estimated_evacuation_time": "6 min",
            "casualty_reduction_estimate": 66,
            "operational_disruption": 42,
            "confidence": 72,
        },
        {
            "option_id": "C",
            "name": "Responder-first containment",
            "success_probability": 82 if eta <= 3 else 68,
            "estimated_evacuation_time": "8 min",
            "casualty_reduction_estimate": 71,
            "operational_disruption": 50,
            "confidence": 79,
        },
        {
            "option_id": "D",
            "name": "Shelter in place",
            "success_probability": 76 if context["incident_type"] in {"utility", "validation"} else 41,
            "estimated_evacuation_time": "not applicable",
            "casualty_reduction_estimate": 44,
            "operational_disruption": 22,
            "confidence": 58,
        },
    ]
    for option in options:
        option["score"] = round(
            int(option["success_probability"]) * 0.38
            + int(option["casualty_reduction_estimate"]) * 0.32
            + int(option["confidence"]) * 0.2
            - int(option["operational_disruption"]) * 0.1
        )
    return sorted(options, key=lambda item: int(item["score"]), reverse=True)


def _build_actions(context: dict[str, Any], winning_strategy: dict[str, Any]) -> list[dict[str, Any]]:
    zone = str(context["zone"])
    floor = str(context["floor"])
    base_actions = [
        ("Trigger evacuation alarm for affected floor", f"Activate floor {floor} alarm and route signage", "automation", 96),
        ("Dispatch responders", f"Send 2 responders to {zone}", "human", 93),
        ("Lock elevators", "Hold elevators outside affected floor and prioritize stairwell routes", "facility", 89),
        ("Open safest stairwell route", "Route occupants away from blocked exits", "routing", 87),
        ("Notify external agency", "Prepare fire/medical escalation packet", "comms", 84),
        ("Request camera validation", "Capture public corridor verification snapshot", "vision", 81),
    ]
    if context["incident_type"] == "validation":
        base_actions = [
            ("Validate alarm source", "Compare smoke sensor with public camera visibility and node health", "ai", 88),
            ("Dispatch single staff check", f"Send staff to {zone} with PPE", "human", 76),
            ("Hold broad evacuation", "Keep evacuation pending until second signal appears", "governance", 72),
        ]
    return [
        {
            "rank": index + 1,
            "title": title,
            "detail": detail,
            "owner": owner,
            "priority": priority,
            "strategy_dependency": winning_strategy["name"],
        }
        for index, (title, detail, owner, priority) in enumerate(base_actions)
    ]


def _build_forecast(context: dict[str, Any], scores: dict[str, int | str]) -> list[dict[str, Any]]:
    escalation = int(scores["escalation_risk"])
    return [
        {
            "window": "Next 5 min",
            "prediction": "Smoke/gas signature may enter adjacent corridor" if escalation >= 70 else "Incident remains localized pending validation",
            "risk": min(100, escalation),
            "recommended_watch": "camera visibility and stairwell congestion",
        },
        {
            "window": "Next 15 min",
            "prediction": "Congestion builds at primary stairwell if west route remains blocked",
            "risk": min(100, escalation + 6),
            "recommended_watch": "evacuation throughput and responder ETA",
        },
        {
            "window": "Next 60 min",
            "prediction": "Business disruption depends on containment success and utility isolation",
            "risk": max(18, escalation - 14),
            "recommended_watch": "re-entry readiness and executive communications",
        },
    ]


def _build_resources(context: dict[str, Any], scores: dict[str, int | str]) -> dict[str, Any]:
    severity = int(scores["severity_score"])
    return {
        "responders_needed": 4 if severity >= 82 else 2,
        "medics_needed": 2 if int(scores["people_impact_score"]) >= 40 else 1,
        "security_needed": 3 if context["incident_type"] in {"crowd", "fire"} else 1,
        "route_marshals_needed": 6 if int(context["occupancy"]) >= 400 else 2,
        "external_agency_required": severity >= 78,
        "resource_summary": "Prioritize responders, route marshals, and external escalation readiness.",
    }


def run_decision(scenario_id: str | None = None) -> dict[str, Any]:
    selected = scenario_id or ai_decision_store.get_scenario()
    context = dict(SCENARIOS.get(selected, SCENARIOS["hotel_kitchen_fire"]))
    scores = _score_context(context)
    strategies = _build_strategies(context, scores)
    winning_strategy = strategies[0]
    actions = _build_actions(context, winning_strategy)
    forecast = _build_forecast(context, scores)
    resources = _build_resources(context, scores)
    data_quality = max(52, min(98, int(context["node_health"]) - len(context["blocked_exits"]) * 3))
    confidence = {
        "data_quality_score": data_quality,
        "sensor_confidence": int(context["node_health"]),
        "camera_confidence": int(context["camera_confidence"]),
        "recommendation_confidence": int(winning_strategy["confidence"]),
        "missing_data_warnings": [] if data_quality >= 75 else ["Some telemetry paths are degraded; keep human review active."],
        "human_review_required": data_quality < 70 or int(scores["severity_score"]) >= 90,
    }
    summary = (
        f"{context['zone']} {context['incident_type']} risk detected at {context['building']}. "
        f"Severity {scores['severity_score']}/100 with escalation risk {scores['escalation_risk']}/100. "
        f"Recommend {winning_strategy['name'].lower()} and dispatch resources within {context['responders_eta_minutes']} minutes."
    )
    decision = {
        "generated_at": _now(),
        "scenario_id": selected,
        "active_incident": context,
        "scores": scores,
        "recommended_strategy": winning_strategy,
        "strategies": strategies,
        "actions": actions,
        "explainability": [
            f"Signals considered: {', '.join(context['signals'])}.",
            f"Occupancy {context['occupancy']} and blocked exits {len(context['blocked_exits'])} increase people-impact risk.",
            f"Responder ETA {context['responders_eta_minutes']}m makes {winning_strategy['name']} the highest confidence strategy.",
        ],
        "confidence": confidence,
        "forecast": forecast,
        "resources": resources,
        "executive_summary": summary,
    }
    ai_decision_store.set_decision(decision)
    return decision


def get_current_decision() -> dict[str, Any]:
    return ai_decision_store.get_decision() or run_decision()


def get_summary() -> dict[str, Any]:
    decision = get_current_decision()
    return {
        "generated_at": _now(),
        "scenario_id": decision["scenario_id"],
        "executive_summary": decision["executive_summary"],
        "severity_score": decision["scores"]["severity_score"],
        "escalation_risk": decision["scores"]["escalation_risk"],
    }


def get_forecast() -> dict[str, Any]:
    decision = get_current_decision()
    return {"generated_at": _now(), "forecast": decision["forecast"], "scenario_id": decision["scenario_id"]}


def get_resources() -> dict[str, Any]:
    decision = get_current_decision()
    return {"generated_at": _now(), "resources": decision["resources"], "scenario_id": decision["scenario_id"]}
