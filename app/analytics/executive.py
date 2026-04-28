from __future__ import annotations

from app.analytics.engine import generate_kpi_cards, generate_live_analytics
from app.analytics.trends import generate_hotspot_snapshot, generate_trend_snapshot
from app.communications.acknowledgements import generate_acknowledgement_snapshot
from app.communications.delivery_queue import get_queue_snapshot
from app.communications.engine import generate_live_communications
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.commander import generate_commander_decisions
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.resources import generate_resource_deployments
from app.simulation.twin import generate_live_twin_state
from app.simulation.warroom import generate_warroom_state


def _status_for_score(score: int) -> str:
    if score < 40:
        return "critical"
    if score < 60:
        return "watch"
    if score < 80:
        return "good"
    return "excellent"


def _readiness_value(card_map: dict[str, int], key: str) -> int:
    return card_map.get(key, 0)


def _executive_risk_score(
    live: dict[str, object],
    fusion: dict[str, object],
    resources: dict[str, object],
    ack: dict[str, object],
    evacuation: dict[str, object],
    queue: dict[str, int],
) -> int:
    critical_fused = len([zone for zone in fusion["zones"] if zone.fused_score >= 80])
    score = (
        (live["summary"].critical_incidents * 12)
        + (critical_fused * 9)
        + (18 if resources["global_load"] == "overloaded" else 8 if resources["global_load"] == "elevated" else 0)
        + (ack["totals"].trapped * 18)
        + (ack["totals"].need_help * 8)
        + (14 if len(evacuation["recommended_safe_zones"]) == 0 else 0)
        + (queue["failed"] * 9)
        + (queue["pending"] * 4)
    )
    return max(0, min(100, score))


def _people_readiness(resources: dict[str, object], ack: dict[str, object], live: dict[str, object]) -> int:
    fire = resources["available_units"].fire_teams
    medical = resources["available_units"].medical_teams
    responders = fire + medical + resources["available_units"].security_teams
    evacuation_success = live["kpis"].evacuation_success_rate
    penalty = (ack["totals"].need_help * 6) + (ack["totals"].trapped * 14)
    score = round(45 + (responders * 3.5) + (evacuation_success * 0.28) - penalty)
    return max(0, min(100, score))


def _resource_readiness(resources: dict[str, object]) -> int:
    remaining = resources["available_units"]
    total = 18
    available = remaining.fire_teams + remaining.medical_teams + remaining.security_teams + remaining.drones
    score = round((available / total) * 100)
    return max(0, min(100, score))


def _communications_readiness(comms: dict[str, object], queue: dict[str, int]) -> int:
    sent = comms["delivery_status"].sent
    queued = comms["delivery_status"].queued + queue["pending"]
    failed = queue["failed"]
    total = max(1, sent + queued + failed)
    score = round((sent / total) * 100) - (failed * 4)
    return max(0, min(100, score))


def _infrastructure_readiness(twin: dict[str, object], evacuation: dict[str, object], fusion: dict[str, object]) -> int:
    stable_zones = len([zone for zone in twin["zones"] if zone.status == "stable"])
    total_zones = max(1, len(twin["zones"]))
    open_corridors = len([corridor for corridor in twin["corridors"] if corridor.status != "busy"])
    total_corridors = max(1, len(twin["corridors"])) if twin["corridors"] else 1
    cascading_risk = len([zone for zone in fusion["zones"] if "incoming fire spread" in zone.drivers])
    score = round(
        (stable_zones / total_zones) * 55
        + (open_corridors / total_corridors) * 25
        + (20 if evacuation["recommended_safe_zones"] else 0)
        - (cascading_risk * 6)
    )
    return max(0, min(100, score))


def _ai_decision_confidence(fusion: dict[str, object], coordinator: dict[str, object], warroom: dict[str, object]) -> int:
    fusion_confidence = round(
        sum(zone.confidence for zone in fusion["zones"][:3]) / max(len(fusion["zones"][:3]), 1)
    )
    score = round((fusion_confidence * 0.4) + (coordinator["cross_agent_score"] * 0.35) + (warroom["response_score"] * 0.25))
    return max(0, min(100, score))


def generate_readiness_scorecards(incidents: list[Incident]) -> dict[str, object]:
    live = generate_live_analytics(incidents)
    fusion = generate_fusion_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    ack = generate_acknowledgement_snapshot(incidents)
    comms = generate_live_communications(incidents)
    queue = get_queue_snapshot()
    twin = generate_live_twin_state(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    coordinator = generate_coordination_intelligence(incidents)
    warroom = generate_warroom_state(incidents)

    scorecards = [
        {
            "label": "People Readiness",
            "score": _people_readiness(resources, ack, live),
        },
        {
            "label": "Resource Readiness",
            "score": _resource_readiness(resources),
        },
        {
            "label": "Communications Readiness",
            "score": _communications_readiness(comms, queue),
        },
        {
            "label": "Infrastructure Readiness",
            "score": _infrastructure_readiness(twin, evacuation, fusion),
        },
        {
            "label": "AI Decision Confidence",
            "score": _ai_decision_confidence(fusion, coordinator, warroom),
        },
    ]

    for item in scorecards:
        item["status"] = _status_for_score(item["score"])

    overall = round(sum(item["score"] for item in scorecards) / len(scorecards))

    return {
        "scorecards": scorecards,
        "overall_readiness": overall,
    }


def _financial_impact_level(
    live: dict[str, object],
    resources: dict[str, object],
    commander: dict[str, object],
    queue: dict[str, int],
) -> str:
    pressure = (
        (live["summary"].active_incidents * 8)
        + (live["summary"].zones_impacted * 6)
        + (15 if resources["global_load"] == "overloaded" else 6 if resources["global_load"] == "elevated" else 0)
        + (12 if commander["incident_mode"] in {"lockdown", "mass-casualty"} else 0)
        + (queue["pending"] * 2)
    )
    if pressure >= 50:
        return "severe"
    if pressure >= 32:
        return "high"
    if pressure >= 18:
        return "moderate"
    return "low"


def _operational_continuity(twin: dict[str, object], resources: dict[str, object], commander: dict[str, object]) -> str:
    if commander["incident_mode"] in {"lockdown", "mass-casualty"}:
        return "disrupted"
    if twin["global_mode"] in {"evacuation", "critical"} or resources["global_load"] != "normal":
        return "degraded"
    return "stable"


def _top_threats(
    live: dict[str, object],
    hotspots: dict[str, object],
    resources: dict[str, object],
    queue: dict[str, int],
) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    if hotspots["zones"]:
        top = hotspots["zones"][0]
        severity = "critical" if top["risk_score"] >= 80 else "high" if top["risk_score"] >= 60 else "watch"
        items.append(
            {
                "title": f"{top['zone']} cascading hazard concentration",
                "severity": severity,
            }
        )

    if any("Medical" in shortage for shortage in resources["shortages"]):
        items.append(
            {
                "title": "Medical capacity exhaustion risk",
                "severity": "high",
            }
        )

    if queue["pending"] > 0 or queue["failed"] > 0:
        items.append(
            {
                "title": "Communication queue backlog",
                "severity": "watch" if queue["failed"] == 0 else "high",
            }
        )

    if len(items) < 3:
        for risk in live["top_risks"]:
            severity = "watch"
            if "fused risk" in risk or "cluster" in risk:
                severity = "high"
            items.append({"title": risk[0].upper() + risk[1:], "severity": severity})
            if len(items) == 3:
                break

    deduped: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in items:
        if item["title"] in seen:
            continue
        seen.add(item["title"])
        deduped.append(item)
    return deduped[:3]


def _strategic_priorities(
    coordinator: dict[str, object],
    commander: dict[str, object],
    ack: dict[str, object],
) -> list[str]:
    priorities: list[str] = []
    priorities.extend(coordinator["priority_stack"][:3])
    if ack["recommended_actions"]:
        priorities.append(ack["recommended_actions"][0])
    if commander["strategic_objectives"]:
        priorities.extend(commander["strategic_objectives"][:2])

    deduped: list[str] = []
    for item in priorities:
        if item not in deduped:
            deduped.append(item)
    return deduped[:4]


def _recommended_decisions(
    resources: dict[str, object],
    commander: dict[str, object],
    coordinator: dict[str, object],
    financial_impact_level: str,
) -> list[str]:
    decisions: list[str] = []
    if resources["global_load"] == "overloaded":
        decisions.append("Authorize mutual aid support")
    if commander["incident_mode"] in {"lockdown", "mass-casualty"} or coordinator["global_mode"] == "lockdown":
        decisions.append("Approve temporary lockdown expansion")
    if any("Shift" in order or "Reassign" in order for order in commander["resource_orders"]):
        decisions.append("Activate backup responder shift")
    if financial_impact_level in {"high", "severe"}:
        decisions.append("Approve operational continuity contingency")

    deduped: list[str] = []
    for item in decisions:
        if item not in deduped:
            deduped.append(item)
    return deduped[:4] if deduped else ["Maintain current executive posture"]


def _board_summary(
    live: dict[str, object],
    resources: dict[str, object],
    commander: dict[str, object],
    risk_score: int,
) -> list[str]:
    summary = [
        f"{live['summary'].zones_impacted} zones impacted",
        f"Resource load {resources['global_load']}",
        f"Response posture {live['global_status']}",
    ]

    if risk_score >= 80 or live["global_status"] == "critical" or commander["global_state"] == "critical":
        summary.append("Immediate executive attention required")
    elif risk_score >= 60:
        summary.append("Leadership attention advised")
    else:
        summary.append("Executive posture stable")

    return summary


def generate_executive_snapshot(incidents: list[Incident]) -> dict[str, object]:
    live = generate_live_analytics(incidents)
    readiness = generate_readiness_scorecards(incidents)
    fusion = generate_fusion_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    ack = generate_acknowledgement_snapshot(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    commander = generate_commander_decisions(incidents)
    coordinator = generate_coordination_intelligence(incidents)
    warroom = generate_warroom_state(incidents)
    twin = generate_live_twin_state(incidents)
    hotspots = generate_hotspot_snapshot(incidents)
    trends = generate_trend_snapshot(incidents)
    queue = get_queue_snapshot()
    _ = generate_kpi_cards(incidents)

    executive_risk_score = _executive_risk_score(
        live,
        fusion,
        resources,
        ack,
        evacuation,
        queue,
    )
    financial_impact_level = _financial_impact_level(live, resources, commander, queue)
    operational_continuity = _operational_continuity(twin, resources, commander)

    if trends["trend_flags"] and "Resource pressure elevated" in trends["trend_flags"] and financial_impact_level == "moderate":
        financial_impact_level = "high"

    return {
        "global_status": live["global_status"],
        "executive_risk_score": executive_risk_score,
        "organization_readiness": readiness["overall_readiness"],
        "financial_impact_level": financial_impact_level,
        "operational_continuity": operational_continuity,
        "top_threats": _top_threats(live, hotspots, resources, queue),
        "strategic_priorities": _strategic_priorities(coordinator, commander, ack),
        "recommended_decisions": _recommended_decisions(
            resources,
            commander,
            coordinator,
            financial_impact_level,
        ),
        "board_summary": _board_summary(
            live,
            resources,
            warroom,
            executive_risk_score,
        ),
    }
