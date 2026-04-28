from __future__ import annotations

import re

from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.perception.schemas import OverrideDecisionItem
from app.prediction.communications import generate_communications_intelligence
from app.prediction.evacuation import generate_evacuation_recommendations
from app.prediction.resources import generate_resource_deployments
from app.prediction.commander import generate_commander_decisions
from app.simulation.twin import generate_live_twin_state
from app.simulation.warroom import generate_warroom_state

ZONE_PATTERN = re.compile(r"Zone \d")


def _find_zone(text: str) -> str | None:
    match = ZONE_PATTERN.search(text)
    return match.group(0) if match else None


def _zone_map(fusion: dict[str, object]) -> dict[str, object]:
    return {zone.zone: zone for zone in fusion["zones"]}


def _best_alternative_zone(
    unsafe_zone: str,
    fusion_zones: list[object],
    blocked_zone_names: set[str],
) -> str | None:
    for zone in fusion_zones:
        if zone.zone == unsafe_zone:
            continue
        if zone.zone in blocked_zone_names:
            continue
        if zone.state in {"stable", "watch"}:
            return zone.zone

    for zone in fusion_zones:
        if zone.zone != unsafe_zone:
            return zone.zone

    return None


def _deployment_summary(deployment: object | None) -> str:
    if deployment is None:
        return "monitor only"

    parts: list[str] = []
    if deployment.fire_teams > 0:
        parts.append(f"{deployment.fire_teams} fire team" + ("s" if deployment.fire_teams > 1 else ""))
    if deployment.medical_teams > 0:
        parts.append(
            f"{deployment.medical_teams} medical team" + ("s" if deployment.medical_teams > 1 else "")
        )
    if deployment.security_teams > 0:
        parts.append(
            f"{deployment.security_teams} security team" + ("s" if deployment.security_teams > 1 else "")
        )
    if deployment.drone_support:
        parts.append("drone")

    return " + ".join(parts) if parts else "monitor only"


def _priority_rank(priority: str) -> int:
    return {"normal": 0, "elevated": 1, "critical": 2}.get(priority, 0)


def _state_rank(state: str) -> int:
    return {"stable": 0, "watch": 1, "elevated": 2, "critical": 3}.get(state, 0)


def _alert_phrase(state: str) -> str:
    if state == "watch":
        return "evacuate prep"
    if state == "elevated":
        return "immediate evacuation"
    return "lockdown / urgent move"


def _global_mode(override_count: int) -> str:
    if override_count == 0:
        return "aligned"
    if override_count <= 2:
        return "adaptive-control"
    return "emergency-correction"


def generate_override_intelligence(incidents: list[Incident]) -> dict[str, object]:
    fusion = generate_fusion_snapshot(incidents)
    evacuation = generate_evacuation_recommendations(incidents)
    resources = generate_resource_deployments(incidents)
    communications = generate_communications_intelligence(incidents)
    commander = generate_commander_decisions(incidents)
    twin = generate_live_twin_state(incidents)
    warroom = generate_warroom_state(incidents)

    fusion_zones = fusion["zones"]
    zone_scores = _zone_map(fusion)
    blocked_zone_names = {item.zone for item in evacuation["blocked_zones"]}
    incoming_fire_targets = {
        zone.zone
        for zone in fusion_zones
        if "incoming fire spread" in zone.drivers
    }
    overrides: list[OverrideDecisionItem] = []
    approved_decisions: list[str] = []
    recommended_focus = list(fusion["recommended_focus"])

    for safe_zone in evacuation["recommended_safe_zones"]:
        fused_zone = zone_scores.get(safe_zone.zone)
        if fused_zone is None:
            continue

        if fused_zone.fused_score >= 55:
            alternative = _best_alternative_zone(safe_zone.zone, fusion_zones, blocked_zone_names)
            new_value = (
                f"unsafe - reroute to {alternative}"
                if alternative is not None
                else "unsafe - no stable fallback available"
            )
            overrides.append(
                OverrideDecisionItem(
                    type="safe_zone_override",
                    zone=safe_zone.zone,
                    old_value="recommended safe zone",
                    new_value=new_value,
                    reason=f"fusion score rising to {fused_zone.fused_score}",
                )
            )
            if alternative is not None:
                recommended_focus.append(f"Re-route civilians from {safe_zone.zone} to {alternative}")
        else:
            approved_decisions.append(f"Maintain evacuation toward {safe_zone.zone}")

    for route in evacuation["routes"]:
        destination_state = zone_scores.get(route.to_zone)
        if (
            destination_state is not None
            and (destination_state.state in {"elevated", "critical"} or route.to_zone in incoming_fire_targets)
        ):
            alternative = _best_alternative_zone(route.to_zone, fusion_zones, blocked_zone_names)
            if alternative is not None and alternative != route.to_zone:
                overrides.append(
                    OverrideDecisionItem(
                        type="route_override",
                        zone=route.from_zone,
                        old_value=f"{route.from_zone} -> {route.to_zone}",
                        new_value=f"{route.from_zone} -> {alternative}",
                        reason=(
                            f"destination {route.to_zone} is {destination_state.state}"
                            if destination_state is not None
                            else "destination risk rising"
                        ),
                    )
                )
                recommended_focus.append(f"Re-route civilians from {route.from_zone}")
        else:
            approved_decisions.append(f"Preserve route from {route.from_zone} to {route.to_zone}")

    top_fused_zone = fusion_zones[0] if fusion_zones else None
    deployment_map = {deployment.zone: deployment for deployment in resources["deployments"]}
    if top_fused_zone is not None and top_fused_zone.fused_score >= 80:
        deployment = deployment_map.get(top_fused_zone.zone)
        is_under_resourced = (
            deployment is None
            or deployment.priority in {"low", "medium"}
            or deployment.fire_teams < 2
            or not deployment.drone_support
        )

        if is_under_resourced:
            twin_zone = next((zone for zone in twin["zones"] if zone.zone == top_fused_zone.zone), None)
            high_occupancy = twin_zone is not None and twin_zone.occupancy >= 70
            new_parts = ["2 fire teams"]
            if high_occupancy:
                new_parts.append("1 medical")
            if resources["available_units"].drones > 0:
                new_parts.append("drone")

            overrides.append(
                OverrideDecisionItem(
                    type="resource_override",
                    zone=top_fused_zone.zone,
                    old_value=_deployment_summary(deployment),
                    new_value=" + ".join(new_parts),
                    reason="critical fused priority",
                )
            )
            recommended_focus.append(f"Escalate response at {top_fused_zone.zone}")
        else:
            approved_decisions.append(f"Maintain resource surge at {top_fused_zone.zone}")

    for alert in communications["occupant_alerts"]:
        fused_zone = zone_scores.get(alert.zone)
        if fused_zone is None or fused_zone.state == "stable":
            continue

        desired_rank = min(2, _state_rank(fused_zone.state))
        current_rank = _priority_rank(alert.priority)

        if desired_rank > current_rank:
            overrides.append(
                OverrideDecisionItem(
                    type="alert_override",
                    zone=alert.zone,
                    old_value=alert.message,
                    new_value=_alert_phrase(fused_zone.state),
                    reason=f"fused state escalated to {fused_zone.state}",
                )
            )
        else:
            approved_decisions.append(f"Keep occupant alert posture for {alert.zone}")

    commander_zone = _find_zone(commander["top_actions"][0].title) if commander["top_actions"] else None
    if top_fused_zone is not None:
        commander_score = zone_scores.get(commander_zone).fused_score if commander_zone in zone_scores else 0
        if commander_zone != top_fused_zone.zone and (top_fused_zone.fused_score - commander_score) > 20:
            overrides.append(
                OverrideDecisionItem(
                    type="commander_override",
                    zone=top_fused_zone.zone,
                    old_value=commander["top_actions"][0].title if commander["top_actions"] else "no commander target",
                    new_value=f"Switch top action priority to {top_fused_zone.zone}",
                    reason=f"highest fused zone exceeds current target by {top_fused_zone.fused_score - commander_score}",
                )
            )
            recommended_focus.append(f"Shift command priority to {top_fused_zone.zone}")
        elif commander_zone is not None:
            approved_decisions.append(f"Commander focus remains aligned on {commander_zone}")

    if warroom["consensus_plan"]:
        highest_consensus_zone = _find_zone(warroom["consensus_plan"][0])
        if highest_consensus_zone == (top_fused_zone.zone if top_fused_zone else None):
            approved_decisions.append(f"War room consensus supports {highest_consensus_zone}")

    deduped_approved: list[str] = []
    for item in approved_decisions:
        if item not in deduped_approved:
            deduped_approved.append(item)

    deduped_focus: list[str] = []
    for item in recommended_focus:
        if item not in deduped_focus:
            deduped_focus.append(item)

    return {
        "global_mode": _global_mode(len(overrides)),
        "override_count": len(overrides),
        "zones_reviewed": len(fusion_zones),
        "overrides": overrides,
        "approved_decisions": deduped_approved[:6],
        "recommended_focus": deduped_focus[:5],
    }
