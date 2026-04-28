from __future__ import annotations

from collections import defaultdict

from app.agents.routes import route_context_for_zone
from app.models.incident import Incident

RESOURCE_TOTALS: dict[str, int] = {
    "fire_teams": 6,
    "medical_teams": 4,
    "security_teams": 5,
    "drones": 3,
    "ambulances": 3,
    "logistics_units": 3,
}

RESOURCE_SPEED: dict[str, float] = {
    "fire_teams": 1.0,
    "medical_teams": 1.05,
    "security_teams": 1.1,
    "drones": 1.45,
    "ambulances": 1.2,
    "logistics_units": 0.92,
}

RESOURCE_MAX_PARALLEL: dict[str, int] = {
    "fire_teams": 2,
    "medical_teams": 2,
    "security_teams": 2,
    "drones": 1,
    "ambulances": 1,
    "logistics_units": 1,
}

RESOURCE_EFFECTIVENESS: dict[str, dict[str, float]] = {
    "fire_teams": {"fire": 1.0, "gas": 0.72, "panic": 0.28, "anomaly": 0.42},
    "medical_teams": {"fire": 0.68, "gas": 0.84, "panic": 0.74, "anomaly": 0.45},
    "security_teams": {"fire": 0.42, "gas": 0.38, "panic": 0.96, "anomaly": 0.58},
    "drones": {"fire": 0.74, "gas": 0.66, "panic": 0.42, "anomaly": 0.62},
    "ambulances": {"fire": 0.64, "gas": 0.8, "panic": 0.72, "anomaly": 0.32},
    "logistics_units": {"fire": 0.56, "gas": 0.5, "panic": 0.36, "anomaly": 0.72},
}


def _incident_type_key(zone: str, incidents: list[Incident], drivers: list[str]) -> str:
    active_zone_incidents = [
        incident.type
        for incident in incidents
        if incident.status == "active" and incident.location == zone
    ]
    if "fire" in active_zone_incidents:
        return "fire"
    if "hazardous_gas" in active_zone_incidents or any("gas" in driver for driver in drivers):
        return "gas"
    if "crowd_panic" in active_zone_incidents or any("crowd" in driver for driver in drivers):
        return "panic"
    return "anomaly"


def _busy_counts(resources: dict[str, object], operations: dict[str, object]) -> dict[str, int]:
    deployments = resources["deployments"]
    used_fire = sum(item.fire_teams for item in deployments)
    used_medical = sum(item.medical_teams for item in deployments)
    used_security = sum(item.security_teams for item in deployments)
    used_drones = sum(1 for item in deployments if item.drone_support)
    running_workflows = len(
        [
            workflow
            for workflow in operations["workflows"]
            if workflow.status in {"queued", "running", "awaiting_approval", "paused"}
        ]
    )

    return {
        "fire_teams": used_fire,
        "medical_teams": used_medical,
        "security_teams": used_security,
        "drones": used_drones,
        "ambulances": min(RESOURCE_TOTALS["ambulances"], max(0, used_medical - 1)),
        "logistics_units": min(RESOURCE_TOTALS["logistics_units"], max(0, running_workflows // 2)),
    }


def build_resource_pools(
    resources: dict[str, object],
    operations: dict[str, object],
    resilience: dict[str, object],
    scenario: str | None,
) -> dict[str, dict[str, int | float]]:
    available_units = resources["available_units"]
    busy_counts = _busy_counts(resources, operations)
    degraded_providers = len(
        [
            provider
            for provider in resilience["providers"]
            if provider["status"] in {"degraded", "offline"}
        ]
    )
    pools: dict[str, dict[str, int | float]] = {}

    for resource_type, total in RESOURCE_TOTALS.items():
        if resource_type == "fire_teams":
            available = int(available_units.fire_teams)
        elif resource_type == "medical_teams":
            available = int(available_units.medical_teams)
        elif resource_type == "security_teams":
            available = int(available_units.security_teams)
        elif resource_type == "drones":
            available = int(available_units.drones)
        elif resource_type == "ambulances":
            available = max(0, total - int(busy_counts["ambulances"]))
        else:
            available = max(0, total - int(busy_counts["logistics_units"]) - degraded_providers // 2)

        if scenario == "resource_shortage":
            available = max(0, available - 1)
        elif scenario == "citywide_pressure" and resource_type in {"security_teams", "ambulances"}:
            available = max(0, available - 1)

        pools[resource_type] = {
            "available_count": available,
            "busy_count": min(total, int(busy_counts.get(resource_type, total - available))),
            "travel_speed": RESOURCE_SPEED[resource_type],
            "max_parallel_assignments": RESOURCE_MAX_PARALLEL[resource_type],
        }

    return pools


def build_zone_demands(
    incidents: list[Incident],
    fusion: dict[str, object],
    twin: dict[str, object],
    timeline: dict[str, object],
    debate: dict[str, object],
    council_focus: dict[str, int],
    governance: dict[str, object],
    resilience: dict[str, object],
    scenario: str | None,
) -> list[dict[str, object]]:
    occupancy_map = {
        zone.zone: zone.occupancy
        for zone in twin["zones"]
    }
    severity_by_zone: dict[str, int] = defaultdict(int)
    for incident in incidents:
        if incident.status != "active":
            continue
        severity_by_zone[incident.location] = max(severity_by_zone[incident.location], incident.severity)

    debate_bonus_by_zone: dict[str, int] = defaultdict(int)
    for item in debate["final_plan"]:
        for zone in occupancy_map:
            if zone in item:
                debate_bonus_by_zone[zone] += 8
        if "medical corridor" in item.lower():
            for zone in occupancy_map:
                debate_bonus_by_zone[zone] += 2

    if debate["recommended_next_action"]:
        for zone in occupancy_map:
            if zone in debate["recommended_next_action"]:
                debate_bonus_by_zone[zone] += 6

    paused_targets = {
        request["workflow_id"]
        for request in governance["recent_requests"]
        if request["status"] == "pending"
    }
    top_zone_name = fusion["zones"][0].zone if fusion["zones"] else None
    second_zone_name = fusion["zones"][1].zone if len(fusion["zones"]) > 1 else None
    provider_penalty = len(
        [provider for provider in resilience["providers"] if provider["status"] == "offline"]
    )
    demand_rows: list[dict[str, object]] = []

    for zone in fusion["zones"]:
        route = route_context_for_zone(zone.zone, twin, timeline)
        incident_key = _incident_type_key(zone.zone, incidents, list(zone.drivers))
        spread_weight = 16 if "incoming fire spread" in zone.drivers else 8 if zone.prediction_score >= 70 else 3
        occupancy_weight = round(occupancy_map.get(zone.zone, 40) * 0.18)
        incident_severity = severity_by_zone.get(zone.zone, max(1, zone.incident_score // 30))
        debate_priority_bonus = debate_bonus_by_zone[zone.zone] + council_focus.get(zone.zone, 0)
        congestion_penalty = int(route["congestion_penalty"]) + provider_penalty

        if scenario == "critical_fire" and zone.zone in {top_zone_name, second_zone_name}:
            incident_key = "fire"
            debate_priority_bonus += 16 if zone.zone == top_zone_name else 10
            spread_weight += 10
            incident_severity = max(incident_severity, 4 if zone.zone == top_zone_name else 3)
        elif scenario == "gas_leak" and zone.zone in {top_zone_name, second_zone_name}:
            incident_key = "gas"
            debate_priority_bonus += 15 if zone.zone == top_zone_name else 8
            incident_severity = max(incident_severity, 4 if zone.zone == top_zone_name else 3)
        elif scenario == "mass_panic" and zone.zone in {top_zone_name, second_zone_name}:
            incident_key = "panic"
            debate_priority_bonus += 18 if zone.zone == top_zone_name else 10
            incident_severity = max(incident_severity, 4 if zone.zone == top_zone_name else 3)
        elif scenario == "dual_incident":
            if zone.zone == top_zone_name:
                incident_key = "fire"
                incident_severity = max(incident_severity, 4)
                debate_priority_bonus += 15
                spread_weight += 8
            elif zone.zone == second_zone_name:
                incident_key = "panic"
                incident_severity = max(incident_severity, 4)
                debate_priority_bonus += 12
            else:
                debate_priority_bonus += 6
        elif scenario == "citywide_pressure":
            occupancy_weight += 6
        elif scenario == "resource_shortage":
            congestion_penalty += 4

        priority_score = max(
            8,
            round(
                (zone.fused_score * 0.48)
                + occupancy_weight
                + spread_weight
                + (incident_severity * 9)
                + debate_priority_bonus
                - congestion_penalty
            ),
        )

        demand_sequence = {
            "fire": ["fire_teams", "medical_teams", "drones", "security_teams", "logistics_units"],
            "gas": ["medical_teams", "fire_teams", "security_teams", "drones", "ambulances"],
            "panic": ["security_teams", "medical_teams", "ambulances", "drones", "logistics_units"],
            "anomaly": ["security_teams", "drones", "logistics_units", "medical_teams"],
        }[incident_key]

        if (
            any("corridor" in item.lower() for item in debate["final_plan"])
            and "security_teams" in demand_sequence
            and incident_key != "fire"
        ):
            demand_sequence = ["security_teams"] + [item for item in demand_sequence if item != "security_teams"]

        desired_assignments = 2 if priority_score >= 78 else 1
        if scenario == "dual_incident" and zone.state == "critical":
            desired_assignments = min(2, desired_assignments + 1)

        demand_rows.append(
            {
                "zone": zone.zone,
                "priority_score": min(priority_score, 100),
                "state": zone.state,
                "drivers": list(zone.drivers),
                "incident_key": incident_key,
                "route_hint": str(route["route_hint"]),
                "eta_adjustment": int(route["eta_adjustment"]),
                "demand_sequence": demand_sequence,
                "desired_assignments": desired_assignments,
                "workflow_dependency": any(target in zone.zone for target in paused_targets),
            }
        )

    return sorted(
        demand_rows,
        key=lambda item: (-int(item["priority_score"]), str(item["zone"])),
    )


def allocate_resource_plan(
    incidents: list[Incident],
    fusion: dict[str, object],
    twin: dict[str, object],
    timeline: dict[str, object],
    resources: dict[str, object],
    operations: dict[str, object],
    governance: dict[str, object],
    resilience: dict[str, object],
    debate: dict[str, object],
    council_focus: dict[str, int],
    scenario: str | None,
) -> dict[str, object]:
    pools = build_resource_pools(resources, operations, resilience, scenario)
    zone_demands = build_zone_demands(
        incidents,
        fusion,
        twin,
        timeline,
        debate,
        council_focus,
        governance,
        resilience,
        scenario,
    )

    assignments_per_zone: dict[str, int] = defaultdict(int)
    allocations: list[dict[str, object]] = []
    unserved: list[str] = []
    tradeoffs: list[str] = []
    total_impact = 0
    total_cost = 0

    for zone in zone_demands:
        demand_sequence = list(zone["demand_sequence"])
        for resource_type in demand_sequence:
            pool = pools[resource_type]
            available_count = int(pool["available_count"])
            if available_count <= 0:
                continue
            if assignments_per_zone[zone["zone"]] >= int(zone["desired_assignments"]) and resource_type != "security_teams":
                continue

            incident_key = str(zone["incident_key"])
            effectiveness = RESOURCE_EFFECTIVENESS[resource_type][incident_key]
            units_assigned = min(
                available_count,
                int(pool["max_parallel_assignments"]),
                2 if int(zone["priority_score"]) >= 84 else 1,
            )
            base_eta = max(2, 8 - round(float(pool["travel_speed"]) * 3))
            eta_minutes = max(2, min(12, base_eta + int(zone["eta_adjustment"])))
            impact_score = max(
                45,
                min(
                    98,
                    round(
                        (int(zone["priority_score"]) * 0.52)
                        + (effectiveness * 30)
                        + (8 if resource_type == "drones" and "incoming fire spread" in zone["drivers"] else 0)
                        - (eta_minutes * 1.8)
                    ),
                ),
            )
            reserve_after = available_count - units_assigned
            opportunity_cost = (
                f"{reserve_after} {resource_type.replace('_', ' ')} remain in reserve"
                if reserve_after > 0
                else f"Consumes final available {resource_type.replace('_', ' ')}"
            )
            rationale = (
                f"{zone['zone']} priority {zone['priority_score']} with {incident_key.replace('_', ' ')} pressure; "
                f"{zone['route_hint'].lower()} preserves response flow"
            )

            allocations.append(
                {
                    "zone": zone["zone"],
                    "resource_type": resource_type,
                    "units_assigned": units_assigned,
                    "eta_minutes": eta_minutes,
                    "impact_score": impact_score,
                    "route_hint": zone["route_hint"],
                    "opportunity_cost": opportunity_cost,
                    "rationale": rationale,
                }
            )
            pool["available_count"] = reserve_after
            assignments_per_zone[zone["zone"]] += 1
            total_impact += impact_score
            total_cost += (units_assigned * 10) + eta_minutes

            if resource_type == "security_teams" and zone["workflow_dependency"]:
                tradeoffs.append(f"Security surge at {zone['zone']} may slow paused workflow reactivation")

            if assignments_per_zone[zone["zone"]] >= int(zone["desired_assignments"]):
                break

        if assignments_per_zone[zone["zone"]] == 0:
            unserved.append(f"{zone['zone']} remains uncovered under current resource limits")
        elif assignments_per_zone[zone["zone"]] < int(zone["desired_assignments"]):
            unserved.append(f"{zone['zone']} only received partial tactical coverage")

    remaining_total = sum(int(pool["available_count"]) for pool in pools.values())
    reserve_readiness = max(
        8,
        min(100, round((remaining_total / sum(RESOURCE_TOTALS.values())) * 100)),
    )
    global_efficiency_score = max(
        18,
        min(
            100,
            round(
                (total_impact / max(len(allocations), 1)) * 0.72
                + (reserve_readiness * 0.28)
                - (len(unserved) * 4)
            ),
        ),
    )
    estimated_containment_minutes = max(
        12,
        min(
            180,
            round(
                28
                + (len(unserved) * 12)
                + max(0, 3 - len([item for item in allocations if item["resource_type"] == "fire_teams"])) * 9
                - (global_efficiency_score * 0.22)
            ),
        ),
    )
    estimated_evacuation_support = max(
        25,
        min(
            100,
            round(
                42
                + len([item for item in allocations if item["resource_type"] in {"security_teams", "medical_teams", "ambulances"}]) * 8
                - len(unserved) * 5
            ),
        ),
    )
    cost_index = max(15, min(100, round(total_cost / max(len(allocations), 1) + len(allocations) * 4)))

    if scenario == "resource_shortage":
        tradeoffs.append("Reserve posture preserved by accepting slower secondary-zone response")
    elif scenario == "dual_incident":
        tradeoffs.append("Split response lowers single-zone surge intensity but improves two-zone coverage")
    elif scenario == "citywide_pressure":
        tradeoffs.append("Citywide balancing preserves reserves at the cost of slower localized reinforcement")

    recommended_followups = list(resources["recommendations"][:2])
    if unserved:
        recommended_followups.append("Escalate mutual aid or redeploy stable-zone units")
    if reserve_readiness < 35:
        recommended_followups.append("Protect reserve capacity for secondary incident escalation")
    if any(provider["status"] == "offline" for provider in resilience["providers"]):
        recommended_followups.append("Route field coordination through healthy integration channels")
    if not recommended_followups:
        recommended_followups.append("Hold reserve assets for secondary-zone escalation")

    top_zone = allocations[0]["zone"] if allocations else (zone_demands[0]["zone"] if zone_demands else "Command Grid")
    summary = (
        f"Allocation solver prioritizes {top_zone} with {len(allocations)} tactical assignments, "
        f"reserve readiness at {reserve_readiness}% and containment ETA near {estimated_containment_minutes} minutes."
    )

    return {
        "global_efficiency_score": global_efficiency_score,
        "reserve_readiness": reserve_readiness,
        "estimated_containment_minutes": estimated_containment_minutes,
        "estimated_evacuation_support": estimated_evacuation_support,
        "cost_index": cost_index,
        "allocations": allocations[:8],
        "unserved_demands": unserved[:4],
        "tradeoffs": tradeoffs[:4],
        "recommended_followups": recommended_followups[:4],
        "summary": summary,
    }
