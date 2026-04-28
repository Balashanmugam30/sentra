from __future__ import annotations

from app.models.incident import Incident
from app.prediction.zone_graph import getAdjacentZones
from app.simulation.schemas import ScenarioImpactItem
from app.simulation.twin import generate_live_twin_state


def _second_ring(zone: str) -> list[str]:
    neighbors = getAdjacentZones(zone)
    second_ring: list[str] = []

    for neighbor in neighbors:
        for candidate in getAdjacentZones(neighbor):
            if candidate != zone and candidate not in neighbors and candidate not in second_ring:
                second_ring.append(candidate)

    return second_ring


def _affected_zones(incident_zone: str, severity: int) -> list[str]:
    affected = [incident_zone]
    first_ring = getAdjacentZones(incident_zone)

    if severity >= 2:
        for zone in first_ring:
            if zone not in affected:
                affected.append(zone)

    if severity >= 3:
        for zone in _second_ring(incident_zone):
            if zone not in affected:
                affected.append(zone)

    if severity >= 4:
        for zone in [f"Zone {index}" for index in range(1, 6)]:
            if zone not in affected:
                affected.append(zone)

    return affected


def _recommended_mode(severity: int, affected_zone_count: int) -> str:
    if severity >= 4 or affected_zone_count >= 5:
        return "lockdown"

    if severity >= 3 or affected_zone_count >= 3:
        return "evacuation"

    if severity == 2:
        return "caution"

    return "normal"


def _resource_load(severity: int, affected_zone_count: int) -> str:
    if severity >= 4 or affected_zone_count >= 5:
        return "critical"

    if severity >= 3 or affected_zone_count >= 3:
        return "high"

    if severity == 2:
        return "medium"

    return "low"


def _severity_index(
    incident_zone: str,
    severity: int,
    baseline_risk: int,
    affected_zone_count: int,
) -> int:
    zone_bias = sum(ord(character) for character in incident_zone) % 7
    score = round(
        24
        + (severity * 16)
        + (baseline_risk * 0.32)
        + (affected_zone_count * 7)
        + zone_bias
    )
    return max(0, min(100, score))


def _impact_chain(
    incident_zone: str,
    severity: int,
    affected_zones: list[str],
) -> list[ScenarioImpactItem]:
    chain: list[ScenarioImpactItem] = []
    neighbors = getAdjacentZones(incident_zone)

    if severity == 1:
        chain.append(
            ScenarioImpactItem(
                minute=5,
                event=f"{incident_zone} remains localized with controlled perimeter pressure",
            )
        )
        chain.append(
            ScenarioImpactItem(
                minute=10,
                event=f"{incident_zone} responder staging likely to stabilize the scene",
            )
        )
        chain.append(
            ScenarioImpactItem(
                minute=15,
                event=f"{incident_zone} risk begins tapering if suppression is sustained",
            )
        )
        return chain

    if neighbors:
        chain.append(
            ScenarioImpactItem(
                minute=5,
                event=f"{neighbors[0]} enters elevated threat",
            )
        )

    congestion_zone = neighbors[-1] if neighbors else incident_zone
    chain.append(
        ScenarioImpactItem(
            minute=10,
            event=f"{congestion_zone} corridor congestion likely",
        )
    )

    if severity >= 4:
        chain.append(
            ScenarioImpactItem(
                minute=15,
                event="System-wide lockdown pressure escalates without external support",
            )
        )
    else:
        final_zone = affected_zones[-1] if affected_zones else incident_zone
        chain.append(
            ScenarioImpactItem(
                minute=15,
                event=f"{final_zone} requires sustained containment coverage",
            )
        )

    return chain


def _recommended_actions(
    incident_zone: str,
    severity: int,
    affected_zones: list[str],
) -> list[str]:
    actions = [f"Dispatch fire team to {incident_zone}"]

    if severity >= 2 and len(affected_zones) > 1:
        actions.append(f"Evacuate {affected_zones[1]} early")

    medical_zone = affected_zones[2] if len(affected_zones) > 2 else incident_zone
    actions.append(f"Stage medical support near {medical_zone}")

    if severity >= 3:
        actions.append("Protect primary evacuation corridors")

    if severity >= 4:
        actions.append("Prepare external mutual aid request")

    return actions[:4]


def generate_scenario_projection(
    incidents: list[Incident],
    incident_zone: str,
    severity: int,
    event_type: str,
) -> dict[str, object]:
    twin = generate_live_twin_state(incidents)
    zone_map = {zone.zone: zone for zone in twin["zones"]}
    baseline_risk = zone_map.get(incident_zone).risk_score if incident_zone in zone_map else 0
    affected_zones = _affected_zones(incident_zone, severity)
    severity_index = _severity_index(
        incident_zone,
        severity,
        baseline_risk,
        len(affected_zones),
    )

    return {
        "scenario": f"{event_type} in {incident_zone}",
        "recommended_mode": _recommended_mode(severity, len(affected_zones)),
        "severity_index": severity_index,
        "impact_chain": _impact_chain(incident_zone, severity, affected_zones),
        "affected_zones": affected_zones,
        "recommended_actions": _recommended_actions(incident_zone, severity, affected_zones),
        "resource_load": _resource_load(severity, len(affected_zones)),
    }
