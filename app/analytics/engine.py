from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone

from app.analytics.schemas import AnalyticsKpiCard, AnalyticsKpis, AnalyticsSummary
from app.communications.acknowledgements import generate_acknowledgement_snapshot
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.memory import generate_memory_snapshot
from app.prediction.resources import generate_resource_deployments


def _round_one_decimal(value: float) -> float:
    return round(value, 1)


def _status_from_value(value: float, excellent_max: float, good_max: float, watch_max: float) -> str:
    if value <= excellent_max:
        return "excellent"
    if value <= good_max:
        return "good"
    if value <= watch_max:
        return "watch"
    return "critical"


def _status_from_percentage(value: int, excellent_min: int, good_min: int, watch_min: int) -> str:
    if value >= excellent_min:
        return "excellent"
    if value >= good_min:
        return "good"
    if value >= watch_min:
        return "watch"
    return "critical"


def _response_minutes(incident: Incident) -> float:
    base = {
        1: 4.8,
        2: 3.9,
        3: 3.1,
        4: 2.4,
    }.get(min(max(incident.severity, 1), 4), 3.1)
    adjustment = (sum(ord(character) for character in incident.location) % 5) * 0.2
    return max(1.1, base + adjustment)


def _resolution_minutes(incident: Incident) -> float:
    base = {
        1: 11.5,
        2: 13.8,
        3: 16.4,
        4: 19.2,
    }.get(min(max(incident.severity, 1), 4), 14.8)
    adjustment = (sum(ord(character) for character in incident.type) % 6) * 0.35
    return max(6.0, base + adjustment)


def _evacuation_success_rate(ack_snapshot: dict[str, object]) -> int:
    totals = ack_snapshot["totals"]
    affected = max(1, totals.acknowledged + totals.need_help + totals.trapped + totals.evacuated + totals.pending)
    success = totals.acknowledged + totals.evacuated
    return max(0, min(100, round((success / affected) * 100)))


def _resource_utilization(resource_snapshot: dict[str, object]) -> int:
    remaining = resource_snapshot["available_units"]
    total_units = 6 + 4 + 5 + 3
    remaining_units = (
        remaining.fire_teams
        + remaining.medical_teams
        + remaining.security_teams
        + remaining.drones
    )
    used_units = max(0, total_units - remaining_units)
    return round((used_units / total_units) * 100)


def _containment_success_rate(
    incidents: list[Incident],
    fusion_snapshot: dict[str, object],
    resource_snapshot: dict[str, object],
) -> int:
    if not incidents:
        return 100

    deployment_map = {deployment.zone: deployment for deployment in resource_snapshot["deployments"]}
    zone_scores = {zone.zone: zone.fused_score for zone in fusion_snapshot["zones"]}
    successes = 0

    for incident in incidents:
        if incident.status != "active":
            successes += 1
            continue

        deployment = deployment_map.get(incident.location)
        fused_score = zone_scores.get(incident.location, 0)
        if deployment is None:
            continue

        if (
            incident.severity <= 2
            or deployment.priority in {"high", "critical"}
            or fused_score < 75
        ):
            successes += 1

    return max(0, min(100, round((successes / len(incidents)) * 100)))


def _critical_incident_count(incidents: list[Incident], fusion_snapshot: dict[str, object]) -> int:
    critical_zones = {
        zone.zone
        for zone in fusion_snapshot["zones"]
        if zone.fused_score >= 80
    }
    return sum(
        1
        for incident in incidents
        if incident.status == "active"
        and (incident.severity >= 3 or incident.location in critical_zones)
    )


def _resolved_today(incidents: list[Incident], memory_snapshot: dict[str, object]) -> int:
    today = datetime.now(timezone.utc).date()
    explicit_resolved = sum(
        1
        for incident in incidents
        if incident.status != "active" and incident.created_at.date() == today
    )
    if explicit_resolved > 0:
        return explicit_resolved

    observed = memory_snapshot["total_incidents_observed"]
    active = sum(1 for incident in incidents if incident.status == "active")
    return max(0, observed - active)


def _top_risks(
    incidents: list[Incident],
    fusion_snapshot: dict[str, object],
    resource_snapshot: dict[str, object],
    memory_snapshot: dict[str, object],
) -> list[str]:
    risks: list[str] = []
    top_zone = fusion_snapshot["zones"][0] if fusion_snapshot["zones"] else None

    if top_zone is not None and top_zone.state in {"elevated", "critical"}:
        risks.append(f"{top_zone.zone} fused risk concentration")

    if memory_snapshot["hotspot_zones"]:
        hotspot = memory_snapshot["hotspot_zones"][0]
        risks.append(f"{hotspot.zone} recurring {('fire ' if any(incident.type == 'fire' and incident.location == hotspot.zone for incident in incidents) else '')}cluster".strip())

    if any("Medical teams nearing capacity" == shortage for shortage in resource_snapshot["shortages"]):
        risks.append("Medical team saturation risk")
    elif resource_snapshot["global_load"] == "overloaded":
        risks.append("Response capacity overload pressure")

    high_density_zones = [
        zone.zone
        for zone in fusion_snapshot["zones"]
        if zone.sensor_score >= 65 and any("crowd" in driver for driver in zone.drivers)
    ]
    if high_density_zones:
        risks.append("Corridor congestion pattern")

    deduped: list[str] = []
    for risk in risks:
        if risk not in deduped:
            deduped.append(risk)

    return deduped[:3] if deduped else ["No elevated operational risks detected"]


def _next_actions(
    fusion_snapshot: dict[str, object],
    resource_snapshot: dict[str, object],
    ack_snapshot: dict[str, object],
) -> list[str]:
    actions: list[str] = []
    if fusion_snapshot["recommended_focus"]:
        actions.extend(fusion_snapshot["recommended_focus"][:2])
    if resource_snapshot["recommendations"]:
        actions.extend(resource_snapshot["recommendations"][:2])
    if ack_snapshot["recommended_actions"]:
        actions.extend(ack_snapshot["recommended_actions"][:2])

    deduped: list[str] = []
    for action in actions:
        if action not in deduped:
            deduped.append(action)

    return deduped[:4] if deduped else ["Maintain active command monitoring"]


def _global_status(summary: AnalyticsSummary, kpis: AnalyticsKpis) -> str:
    if summary.critical_incidents >= 3 or kpis.resource_utilization >= 85 or kpis.containment_success_rate < 60:
        return "critical"
    if summary.active_incidents >= 2 or kpis.resource_utilization >= 60 or kpis.evacuation_success_rate < 80:
        return "elevated"
    return "normal"


def generate_live_analytics(incidents: list[Incident]) -> dict[str, object]:
    active_incidents = [incident for incident in incidents if incident.status == "active"]
    fusion_snapshot = generate_fusion_snapshot(incidents)
    resource_snapshot = generate_resource_deployments(incidents)
    ack_snapshot = generate_acknowledgement_snapshot(incidents)
    memory_snapshot = generate_memory_snapshot(incidents)

    avg_response_minutes = _round_one_decimal(
        sum(_response_minutes(incident) for incident in active_incidents) / max(len(active_incidents), 1)
    )
    avg_resolution_minutes = _round_one_decimal(
        sum(_resolution_minutes(incident) for incident in incidents) / max(len(incidents), 1)
    )
    containment_success_rate = _containment_success_rate(incidents, fusion_snapshot, resource_snapshot)
    evacuation_success_rate = _evacuation_success_rate(ack_snapshot)
    resource_utilization = _resource_utilization(resource_snapshot)

    summary = AnalyticsSummary(
        active_incidents=len(active_incidents),
        critical_incidents=_critical_incident_count(incidents, fusion_snapshot),
        resolved_today=_resolved_today(incidents, memory_snapshot),
        alerts_sent=ack_snapshot["totals"].alerts_sent,
        zones_impacted=len({incident.location for incident in active_incidents}),
    )
    kpis = AnalyticsKpis(
        avg_response_minutes=avg_response_minutes,
        avg_resolution_minutes=avg_resolution_minutes,
        containment_success_rate=containment_success_rate,
        evacuation_success_rate=evacuation_success_rate,
        resource_utilization=resource_utilization,
    )

    return {
        "global_status": _global_status(summary, kpis),
        "summary": summary,
        "kpis": kpis,
        "top_risks": _top_risks(incidents, fusion_snapshot, resource_snapshot, memory_snapshot),
        "next_actions": _next_actions(fusion_snapshot, resource_snapshot, ack_snapshot),
    }


def generate_kpi_cards(incidents: list[Incident]) -> list[AnalyticsKpiCard]:
    live = generate_live_analytics(incidents)
    kpis = live["kpis"]
    ack_snapshot = generate_acknowledgement_snapshot(incidents)
    acknowledged = ack_snapshot["totals"].acknowledged + ack_snapshot["totals"].evacuated
    ack_total = max(1, len(ack_snapshot["responses"]))
    mean_time_to_ack = _round_one_decimal(
        max(0.8, 2.8 - ((acknowledged / ack_total) * 1.4))
    )

    return [
        AnalyticsKpiCard(
            key="MTTR",
            label="Mean Time To Resolve",
            value=f"{kpis.avg_resolution_minutes:.1f} min",
            status=_status_from_value(kpis.avg_resolution_minutes, 12, 15, 20),
        ),
        AnalyticsKpiCard(
            key="MTTA",
            label="Mean Time To Acknowledge",
            value=f"{mean_time_to_ack:.1f} min",
            status=_status_from_value(mean_time_to_ack, 2, 3.5, 5),
        ),
        AnalyticsKpiCard(
            key="UTIL",
            label="Resource Utilization",
            value=f"{kpis.resource_utilization}%",
            status=_status_from_value(kpis.resource_utilization, 50, 70, 85),
        ),
        AnalyticsKpiCard(
            key="EVAC",
            label="Evacuation Success",
            value=f"{kpis.evacuation_success_rate}%",
            status=_status_from_percentage(kpis.evacuation_success_rate, 85, 70, 55),
        ),
    ]
