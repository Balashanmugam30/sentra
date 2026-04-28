from __future__ import annotations

from app.analytics.engine import generate_live_analytics
from app.analytics.executive import generate_executive_snapshot, generate_readiness_scorecards
from app.analytics.forecast import generate_forecast_snapshot
from app.communications.acknowledgements import generate_acknowledgement_snapshot
from app.communications.engine import generate_live_communications
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments


SCENARIO_PRESETS: list[dict[str, str]] = [
    {"id": "evacuate_now", "title": "Immediate Evacuation", "category": "life_safety"},
    {"id": "delay_10", "title": "Delay Evacuation 10 Minutes", "category": "life_safety"},
    {"id": "partial_lockdown", "title": "Partial Lockdown", "category": "operations"},
    {"id": "full_lockdown", "title": "Full Lockdown", "category": "operations"},
    {"id": "mutual_aid_now", "title": "Request Mutual Aid Now", "category": "resources"},
    {"id": "mutual_aid_later", "title": "Delay Mutual Aid Request", "category": "resources"},
    {"id": "prioritize_zone_1", "title": "Prioritize Zone 1 Responders", "category": "resources"},
    {"id": "prioritize_zone_3", "title": "Prioritize Zone 3 Responders", "category": "resources"},
    {"id": "keep_running", "title": "Keep Operations Running", "category": "continuity"},
    {"id": "remote_continuity", "title": "Shift to Remote Continuity", "category": "continuity"},
]


def get_scenario_presets() -> list[dict[str, str]]:
    return SCENARIO_PRESETS


def _financial_level(score: int) -> str:
    if score >= 4:
        return "severe"
    if score == 3:
        return "high"
    if score == 2:
        return "moderate"
    return "low"


def _reputation_level(score: int) -> str:
    if score >= 3:
        return "high"
    if score == 2:
        return "medium"
    return "low"


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _preset_map() -> dict[str, dict[str, str]]:
    return {
        item["id"]: item for item in SCENARIO_PRESETS
    }


def _base_metrics(incidents: list[Incident]) -> dict[str, int | str]:
    live = generate_live_analytics(incidents)
    readiness = generate_readiness_scorecards(incidents)
    forecast = generate_forecast_snapshot(incidents)
    executive = generate_executive_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    fusion = generate_fusion_snapshot(incidents)
    acknowledgements = generate_acknowledgement_snapshot(incidents)
    communications = generate_live_communications(incidents)

    critical_zones = len([zone for zone in fusion["zones"] if zone.fused_score >= 80])
    casualty_risk = _clamp(
        round(
            (critical_zones * 14)
            + (live["summary"].critical_incidents * 10)
            + (acknowledgements["totals"].trapped * 18)
            + (acknowledgements["totals"].need_help * 7)
            + ((100 - readiness["overall_readiness"]) * 0.22)
        ),
        10,
        100,
    )
    downtime_minutes = _clamp(
        round(
            20
            + (live["summary"].active_incidents * 11)
            + (critical_zones * 9)
            + (14 if resources["global_load"] == "overloaded" else 7 if resources["global_load"] == "elevated" else 0)
        ),
        20,
        240,
    )
    return {
        "casualty_risk": casualty_risk,
        "containment_probability": forecast["metrics"]["containment_probability"],
        "recovery_eta_minutes": forecast["recovery_eta_minutes"],
        "downtime_minutes": downtime_minutes,
        "financial_impact": executive["financial_impact_level"],
        "reputation_risk": forecast["reputation_risk"],
        "readiness": readiness["overall_readiness"],
        "current_state": "emergency"
        if resources["global_load"] == "overloaded" and critical_zones >= 4
        else "critical"
        if executive["global_status"] == "critical"
        else "elevated"
        if executive["global_status"] == "elevated"
        else "stable",
        "queued_alerts": communications["delivery_status"].queued,
        "critical_zones": critical_zones,
    }


def _apply_option(option_id: str, baseline: dict[str, int | str]) -> dict[str, int | str]:
    financial_value = {"low": 1, "moderate": 2, "high": 3, "severe": 4}[str(baseline["financial_impact"])]
    reputation_value = {"low": 1, "medium": 2, "high": 3}[str(baseline["reputation_risk"])]

    result = {
        "casualty_risk": int(baseline["casualty_risk"]),
        "containment_probability": int(baseline["containment_probability"]),
        "recovery_eta_minutes": int(baseline["recovery_eta_minutes"]),
        "downtime_minutes": int(baseline["downtime_minutes"]),
        "financial_value": financial_value,
        "reputation_value": reputation_value,
    }

    if option_id == "evacuate_now":
        result["casualty_risk"] -= 18
        result["containment_probability"] += 6
        result["recovery_eta_minutes"] -= 18
        result["downtime_minutes"] += 16
        result["financial_value"] += 1
        result["reputation_value"] -= 1
    elif option_id == "delay_10":
        result["casualty_risk"] += 15
        result["containment_probability"] -= 8
        result["recovery_eta_minutes"] += 26
        result["downtime_minutes"] -= 6
        result["financial_value"] += 1
        result["reputation_value"] += 1
    elif option_id == "partial_lockdown":
        result["casualty_risk"] -= 10
        result["containment_probability"] += 7
        result["recovery_eta_minutes"] -= 10
        result["downtime_minutes"] += 24
        result["financial_value"] += 1
    elif option_id == "full_lockdown":
        result["casualty_risk"] -= 16
        result["containment_probability"] += 11
        result["recovery_eta_minutes"] -= 20
        result["downtime_minutes"] += 38
        result["financial_value"] += 2
        result["reputation_value"] -= 1
    elif option_id == "mutual_aid_now":
        result["casualty_risk"] -= 9
        result["containment_probability"] += 13
        result["recovery_eta_minutes"] -= 24
        result["downtime_minutes"] -= 8
        result["financial_value"] += 1
        result["reputation_value"] -= 1
    elif option_id == "mutual_aid_later":
        result["casualty_risk"] += 8
        result["containment_probability"] -= 9
        result["recovery_eta_minutes"] += 20
        result["downtime_minutes"] += 10
        result["reputation_value"] += 1
    elif option_id == "prioritize_zone_1":
        result["casualty_risk"] -= 4
        result["containment_probability"] += 5
        result["recovery_eta_minutes"] -= 8
        result["downtime_minutes"] += 5
    elif option_id == "prioritize_zone_3":
        result["casualty_risk"] -= 5
        result["containment_probability"] += 6
        result["recovery_eta_minutes"] -= 9
        result["downtime_minutes"] += 4
    elif option_id == "keep_running":
        result["casualty_risk"] += 10
        result["containment_probability"] -= 6
        result["recovery_eta_minutes"] += 16
        result["downtime_minutes"] -= 12
        result["reputation_value"] += 1
    elif option_id == "remote_continuity":
        result["casualty_risk"] -= 7
        result["containment_probability"] += 4
        result["recovery_eta_minutes"] -= 6
        result["downtime_minutes"] += 8
        result["financial_value"] -= 1

    result["casualty_risk"] = _clamp(int(result["casualty_risk"]), 5, 100)
    result["containment_probability"] = _clamp(int(result["containment_probability"]), 5, 95)
    result["recovery_eta_minutes"] = _clamp(int(result["recovery_eta_minutes"]), 15, 300)
    result["downtime_minutes"] = _clamp(int(result["downtime_minutes"]), 10, 360)
    result["financial_value"] = _clamp(int(result["financial_value"]), 1, 4)
    result["reputation_value"] = _clamp(int(result["reputation_value"]), 1, 3)

    overall_score = _clamp(
        round(
            100
            - (result["casualty_risk"] * 0.34)
            + (result["containment_probability"] * 0.33)
            - (result["downtime_minutes"] * 0.08)
            - (result["financial_value"] * 7)
            - (result["reputation_value"] * 6)
        ),
        0,
        100,
    )

    preset = _preset_map().get(option_id, _preset_map()["evacuate_now"])

    return {
        "title": preset["title"],
        "casualty_risk": result["casualty_risk"],
        "containment_probability": result["containment_probability"],
        "recovery_eta_minutes": result["recovery_eta_minutes"],
        "downtime_minutes": result["downtime_minutes"],
        "financial_impact": _financial_level(int(result["financial_value"])),
        "reputation_risk": _reputation_level(int(result["reputation_value"])),
        "overall_score": overall_score,
    }
