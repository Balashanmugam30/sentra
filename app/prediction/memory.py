from __future__ import annotations

from collections import defaultdict

from app.models.incident import Incident
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.resources import generate_resource_deployments
from app.prediction.schemas import (
    HistoricalRouteItem,
    HotspotZoneItem,
    ResourceEffectivenessItem,
    TrustedSafeZoneItem,
)


def _ordered_incidents(incidents: list[Incident]) -> list[Incident]:
    return sorted(incidents, key=lambda incident: incident.created_at)


def generate_memory_snapshot(incidents: list[Incident]) -> dict[str, object]:
    ordered_incidents = _ordered_incidents(incidents)
    total_incidents = len(ordered_incidents)

    if total_incidents == 0:
        return {
            "total_incidents_observed": 0,
            "hotspot_zones": [],
            "trusted_safe_zones": [],
            "historical_route_success": [],
            "resource_effectiveness": [],
            "learning_status": "active",
        }

    zone_counts: dict[str, int] = defaultdict(int)
    zone_severity_totals: dict[str, int] = defaultdict(int)
    safe_zone_usage: dict[str, int] = defaultdict(int)
    route_counts: dict[tuple[str, str], int] = defaultdict(int)
    route_origin_counts: dict[str, int] = defaultdict(int)
    unit_effectiveness: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for incident in ordered_incidents:
        zone_counts[incident.location] += 1
        zone_severity_totals[incident.location] += incident.severity

    for index in range(1, total_incidents + 1):
        snapshot = ordered_incidents[:index]
        evacuation = generate_evacuation_recommendations(snapshot)
        resources = generate_resource_deployments(snapshot)

        for safe_zone in evacuation["recommended_safe_zones"]:
            safe_zone_usage[safe_zone.zone] += 1

        for route in evacuation["routes"]:
            route_counts[(route.from_zone, route.to_zone)] += 1
            route_origin_counts[route.from_zone] += 1

        for deployment in resources["deployments"]:
            zone_unit_scores = unit_effectiveness[deployment.zone]
            zone_unit_scores["fire_team"] += (deployment.fire_teams * 10) + (
                14 if deployment.priority in {"high", "critical"} else 5
            )
            zone_unit_scores["medical_team"] += (deployment.medical_teams * 9) + (
                10 if deployment.priority in {"high", "critical"} else 4
            )
            zone_unit_scores["security_team"] += (deployment.security_teams * 7) + (
                9 if deployment.priority in {"high", "critical"} else 4
            )
            if deployment.drone_support:
                zone_unit_scores["drone"] += 11

    hotspot_zones = sorted(
        [
            HotspotZoneItem(
                zone=zone,
                score=min(
                    100,
                    round(
                        ((count / total_incidents) * 70)
                        + ((zone_severity_totals[zone] / count) / 5 * 30)
                    ),
                ),
            )
            for zone, count in zone_counts.items()
        ],
        key=lambda item: (-item.score, item.zone),
    )[:5]

    trusted_safe_zones = sorted(
        [
            TrustedSafeZoneItem(
                zone=zone,
                reliability=max(
                    0,
                    min(
                        100,
                        round(
                            48
                            + (safe_zone_usage[zone] * 8)
                            - (zone_counts.get(zone, 0) * 6)
                        ),
                    ),
                ),
            )
            for zone in safe_zone_usage
        ],
        key=lambda item: (-item.reliability, item.zone),
    )[:4]

    historical_route_success = sorted(
        [
            HistoricalRouteItem(
                from_zone=from_zone,
                to_zone=to_zone,
                success_rate=max(
                    0,
                    min(
                        100,
                        round((count / max(route_origin_counts[from_zone], 1)) * 100),
                    ),
                ),
            )
            for (from_zone, to_zone), count in route_counts.items()
        ],
        key=lambda item: (-item.success_rate, item.from_zone, item.to_zone),
    )[:5]

    resource_effectiveness = sorted(
        [
            ResourceEffectivenessItem(
                zone=zone,
                best_unit=max(unit_scores.items(), key=lambda item: item[1])[0],
                impact_score=min(
                    100,
                    round(max(unit_scores.values()) / max(total_incidents, 1) * 12),
                ),
            )
            for zone, unit_scores in unit_effectiveness.items()
            if unit_scores
        ],
        key=lambda item: (-item.impact_score, item.zone),
    )[:5]

    return {
        "total_incidents_observed": total_incidents,
        "hotspot_zones": hotspot_zones,
        "trusted_safe_zones": trusted_safe_zones,
        "historical_route_success": historical_route_success,
        "resource_effectiveness": resource_effectiveness,
        "learning_status": "active",
    }
