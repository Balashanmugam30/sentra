from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from app.communications.acknowledgements import generate_acknowledgement_snapshot
from app.communications.engine import generate_live_communications
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.memory import generate_memory_snapshot
from app.prediction.resources import generate_resource_deployments


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _round_one_decimal(value: float) -> float:
    return round(value, 1)


def _hour_seed(hour: datetime, modifier: int) -> int:
    return ((hour.hour * 11) + (hour.day * 3) + modifier) % 7


def _response_minutes(incident: Incident) -> float:
    base = {
        1: 4.8,
        2: 3.9,
        3: 3.1,
        4: 2.4,
    }.get(min(max(incident.severity, 1), 4), 3.1)
    adjustment = (sum(ord(character) for character in incident.location) % 5) * 0.2
    return max(1.1, base + adjustment)


def _incident_counts_by_hour(incidents: list[Incident], now: datetime) -> dict[datetime, int]:
    counts: dict[datetime, int] = {}
    for incident in incidents:
        created_at = incident.created_at.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
        if now - created_at > timedelta(hours=24):
            continue
        counts[created_at] = counts.get(created_at, 0) + 1
    return counts


def _avg_response_by_hour(incidents: list[Incident], now: datetime) -> dict[datetime, float]:
    buckets: dict[datetime, list[float]] = {}
    for incident in incidents:
        created_at = incident.created_at.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
        if now - created_at > timedelta(hours=24):
            continue
        buckets.setdefault(created_at, []).append(_response_minutes(incident))

    return {
        bucket: _round_one_decimal(sum(values) / len(values))
        for bucket, values in buckets.items()
    }


def generate_trend_snapshot(incidents: list[Incident]) -> dict[str, object]:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    fusion_snapshot = generate_fusion_snapshot(incidents)
    resource_snapshot = generate_resource_deployments(incidents)
    communications_snapshot = generate_live_communications(incidents)
    ack_snapshot = generate_acknowledgement_snapshot(incidents)

    active_incidents = [incident for incident in incidents if incident.status == "active"]
    incident_counts = _incident_counts_by_hour(incidents, now)
    response_by_hour = _avg_response_by_hour(incidents, now)
    active_count = len(active_incidents)
    alert_total = communications_snapshot["delivery_status"].sent + communications_snapshot["delivery_status"].queued

    total_units = 18
    remaining_units = (
        resource_snapshot["available_units"].fire_teams
        + resource_snapshot["available_units"].medical_teams
        + resource_snapshot["available_units"].security_teams
        + resource_snapshot["available_units"].drones
    )
    resource_utilization = round(((total_units - remaining_units) / total_units) * 100)

    incident_volume: list[dict[str, object]] = []
    response_time: list[dict[str, object]] = []
    alerts_sent: list[dict[str, object]] = []
    resource_load: list[dict[str, object]] = []

    for index in range(24):
        bucket = now - timedelta(hours=23 - index)
        hour_key = bucket.strftime("%H")
        actual_incidents = incident_counts.get(bucket, 0)
        actual_response = response_by_hour.get(bucket)
        seed = _hour_seed(bucket, len(incidents) + active_count)
        recency_boost = 1 if index >= 21 and active_count > 0 else 0
        critical_boost = 1 if index >= 20 and any(zone.state == "critical" for zone in fusion_snapshot["zones"][:2]) else 0

        volume_count = max(
          0,
          actual_incidents
          + max(0, seed - 3)
          + recency_boost
          + critical_boost
        )
        if actual_incidents == 0 and not incidents:
            volume_count = 0

        response_value = actual_response
        if response_value is None:
            base_response = 3.2 + (active_count * 0.18)
            trend_bias = 0.12 * max(0, index - 15)
            response_value = _round_one_decimal(
                max(1.2, base_response + trend_bias + ((seed - 3) * 0.18))
            )

        alerts_count = max(
            0,
            round((alert_total * (0.35 + (seed * 0.05))) / 4) + (1 if index >= 20 and alert_total > 0 else 0),
        )
        if alert_total == 0 and not incidents:
            alerts_count = 0

        resource_percent = _clamp(
            resource_utilization
            + ((seed - 3) * 5)
            + (6 if index >= 19 and resource_snapshot["global_load"] != "normal" else 0),
            18,
            100,
        )

        incident_volume.append({"hour": hour_key, "count": volume_count})
        response_time.append({"hour": hour_key, "minutes": response_value})
        alerts_sent.append({"hour": hour_key, "count": alerts_count})
        resource_load.append({"hour": hour_key, "percent": resource_percent})

    recent_incident_avg = sum(item["count"] for item in incident_volume[-3:]) / 3
    prior_incident_avg = sum(item["count"] for item in incident_volume[:-3]) / max(len(incident_volume[:-3]), 1)
    recent_response_avg = sum(item["minutes"] for item in response_time[-3:]) / 3
    prior_response_avg = sum(item["minutes"] for item in response_time[:-3]) / max(len(response_time[:-3]), 1)
    recent_alert_avg = sum(item["count"] for item in alerts_sent[-3:]) / 3
    prior_alert_avg = sum(item["count"] for item in alerts_sent[:-3]) / max(len(alerts_sent[:-3]), 1)

    trend_flags: list[str] = []
    if recent_incident_avg > (prior_incident_avg * 1.15):
        trend_flags.append("Incident spike detected in last 3 hours")
    if recent_response_avg > (prior_response_avg * 1.15):
        trend_flags.append("Response time rising moderately")
    if max(item["percent"] for item in resource_load) > 80:
        trend_flags.append("Resource pressure elevated")
    if recent_alert_avg > (prior_alert_avg * 1.2):
        trend_flags.append("Alert traffic elevated")

    if not trend_flags:
        trend_flags.append("Operational trend lines currently stable")

    return {
        "window": "24h",
        "incident_volume": incident_volume,
        "response_time": response_time,
        "alerts_sent": alerts_sent,
        "resource_load": resource_load,
        "trend_flags": trend_flags[:4],
        "acknowledgement_pressure": ack_snapshot["totals"].pending,
    }


def generate_hotspot_snapshot(incidents: list[Incident]) -> dict[str, object]:
    fusion_snapshot = generate_fusion_snapshot(incidents)
    memory_snapshot = generate_memory_snapshot(incidents)
    incident_counts = Counter(
        incident.location for incident in incidents if incident.status == "active"
    )
    memory_scores = {
        item.zone: item.score
        for item in memory_snapshot["hotspot_zones"]
    }

    zones: list[dict[str, object]] = []
    recurring_patterns: list[str] = []
    recommended_focus: list[str] = []

    for zone in fusion_snapshot["zones"][:5]:
        prior_score = max(
            0,
            min(
                100,
                zone.fused_score
                - (incident_counts.get(zone.zone, 0) * 4)
                - (memory_scores.get(zone.zone, 25) // 15)
                + ((len(zone.drivers) - 1) * 3),
            ),
        )
        delta = zone.fused_score - prior_score
        movement = "stable"
        if delta >= 8:
            movement = "up"
        elif delta <= -8:
            movement = "down"

        zones.append(
            {
                "zone": zone.zone,
                "risk_score": zone.fused_score,
                "incident_count": incident_counts.get(zone.zone, 0),
                "movement": movement,
            }
        )

        if memory_scores.get(zone.zone, 0) >= 55:
            recurring_patterns.append(
                f"{zone.zone} recurring {('fire cluster' if any(incident.type == 'fire' and incident.location == zone.zone for incident in incidents) else 'risk pattern')}"
            )

        if movement == "up":
            recommended_focus.append(f"Pre-stage responders near {zone.zone}")
        elif any("sensor" in driver for driver in zone.drivers):
            recommended_focus.append(f"Inspect {zone.zone} corridor sensors")
        else:
            recommended_focus.append(f"Increase oversight for {zone.zone}")

    deduped_patterns: list[str] = []
    for pattern in recurring_patterns:
        if pattern not in deduped_patterns:
            deduped_patterns.append(pattern)

    deduped_focus: list[str] = []
    for focus in recommended_focus:
        if focus not in deduped_focus:
            deduped_focus.append(focus)

    return {
        "zones": zones,
        "recurring_patterns": deduped_patterns[:3] or ["No recurring hotspot patterns detected"],
        "recommended_focus": deduped_focus[:3] or ["Maintain baseline hotspot monitoring"],
    }
