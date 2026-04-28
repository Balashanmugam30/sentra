from __future__ import annotations

from app.analytics.engine import generate_live_analytics
from app.analytics.executive import generate_readiness_scorecards
from app.communications.acknowledgements import generate_acknowledgement_snapshot
from app.communications.engine import generate_live_communications
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments
from app.prediction.service import generate_predictions


def _continuity_label(score: int) -> str:
    if score >= 80:
        return "stable"
    if score >= 60:
        return "strained"
    if score >= 40:
        return "degraded"
    return "critical"


def _expected_disruption(score: int) -> str:
    if score >= 82:
        return "localized disruption pressure"
    if score >= 65:
        return "partial business slowdown likely"
    if score >= 45:
        return "multi-zone continuity degradation"
    return "major operational interruption risk"


def _forecast_risk_points(
    base_risk: int,
    critical_zone_count: int,
    readiness: int,
    resource_load: str,
    pending_acks: int,
) -> list[dict[str, object]]:
    load_penalty = 9 if resource_load == "overloaded" else 4 if resource_load == "elevated" else 0
    windows: list[dict[str, object]] = []

    for minute, multiplier in ((15, 1.0), (30, 1.18), (60, 1.34)):
        projected = round(
            base_risk
            + (critical_zone_count * 4 * multiplier)
            + (pending_acks * 1.6)
            + load_penalty
            - ((readiness - 50) * 0.18)
        )
        risk_score = max(0, min(100, projected))
        windows.append(
            {
                "minute": minute,
                "risk_score": risk_score,
                "continuity": _continuity_label(100 - risk_score),
                "expected_disruption": _expected_disruption(risk_score),
            }
        )

    return windows


def _financial_exposure(
    peak_risk: int,
    active_incidents: int,
    resource_utilization: int,
) -> str:
    pressure = peak_risk + (active_incidents * 4) + round(resource_utilization * 0.2)
    if pressure >= 105:
        return "severe"
    if pressure >= 82:
        return "high"
    if pressure >= 58:
        return "moderate"
    return "low"


def _reputation_risk(
    queued_alerts: int,
    pending_acks: int,
    critical_zone_count: int,
) -> str:
    score = (queued_alerts * 8) + (pending_acks * 5) + (critical_zone_count * 7)
    if score >= 45:
        return "high"
    if score >= 20:
        return "medium"
    return "low"


def generate_forecast_snapshot(incidents: list[Incident]) -> dict[str, object]:
    live = generate_live_analytics(incidents)
    readiness = generate_readiness_scorecards(incidents)
    fusion = generate_fusion_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    communications = generate_live_communications(incidents)
    acknowledgements = generate_acknowledgement_snapshot(incidents)
    predictions = generate_predictions(incidents)

    critical_zone_count = len([zone for zone in fusion["zones"] if zone.fused_score >= 80])
    high_risk_predictions = len([item for item in predictions if item.risk_score >= 75])
    active_incidents = live["summary"].active_incidents
    base_risk = round(
        (live["summary"].critical_incidents * 11)
        + (critical_zone_count * 8)
        + (high_risk_predictions * 4)
        + (live["kpis"].resource_utilization * 0.35)
        + (100 - readiness["overall_readiness"]) * 0.25
    )
    base_risk = max(0, min(100, base_risk))

    time_windows = _forecast_risk_points(
        base_risk,
        critical_zone_count,
        readiness["overall_readiness"],
        resources["global_load"],
        acknowledgements["totals"].pending,
    )

    containment_probability = max(
        8,
        min(
            95,
            round(
                live["kpis"].containment_success_rate
                - (critical_zone_count * 5)
                - (10 if resources["global_load"] == "overloaded" else 0)
                + (readiness["overall_readiness"] - 50) * 0.15
            ),
        ),
    )
    escalation_probability = max(
        10,
        min(
            95,
            round(
                base_risk
                + (critical_zone_count * 5)
                + (12 if resources["global_load"] == "overloaded" else 4 if resources["global_load"] == "elevated" else 0)
                + (communications["delivery_status"].queued * 3)
            ),
        ),
    )
    evac_completion_probability = max(
        5,
        min(
            95,
            round(
                live["kpis"].evacuation_success_rate
                + (20 if readiness["overall_readiness"] >= 70 else 0)
                - (acknowledgements["totals"].pending * 4)
                - (acknowledgements["totals"].need_help * 5)
                - (acknowledgements["totals"].trapped * 9)
            ),
        ),
    )
    resource_recovery_probability = max(
        5,
        min(
            95,
            round(
                readiness["overall_readiness"]
                - (resources["global_load"] == "overloaded") * 28
                - (resources["global_load"] == "elevated") * 12
                + (resources["available_units"].fire_teams * 4)
                + (resources["available_units"].medical_teams * 5)
            ),
        ),
    )

    recovery_eta_minutes = max(
        20,
        min(
            240,
            round(
                25
                + (critical_zone_count * 14)
                + (acknowledgements["totals"].trapped * 22)
                + (100 - containment_probability) * 1.1
                + (100 - resource_recovery_probability) * 0.45
            ),
        ),
    )

    peak_risk = max(window["risk_score"] for window in time_windows)

    executive_summary = [
        f"Risk peaks at {peak_risk} within the next 60 minutes",
        f"Containment probability tracking at {containment_probability}%",
        f"Recovery window estimated at {recovery_eta_minutes} minutes",
    ]

    if escalation_probability >= 70:
        executive_summary.append("Escalation pressure remains materially elevated")
    elif resource_recovery_probability >= 65:
        executive_summary.append("Resource posture shows improving recovery potential")
    else:
        executive_summary.append("Leadership intervention can materially reduce downtime exposure")

    return {
        "time_windows": time_windows,
        "metrics": {
            "containment_probability": containment_probability,
            "escalation_probability": escalation_probability,
            "evac_completion_probability": evac_completion_probability,
            "resource_recovery_probability": resource_recovery_probability,
        },
        "financial_exposure": _financial_exposure(
            peak_risk,
            active_incidents,
            live["kpis"].resource_utilization,
        ),
        "reputation_risk": _reputation_risk(
            communications["delivery_status"].queued,
            acknowledgements["totals"].pending,
            critical_zone_count,
        ),
        "recovery_eta_minutes": recovery_eta_minutes,
        "executive_summary": executive_summary[:4],
    }

