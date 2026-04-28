from __future__ import annotations

from app.analytics.executive import generate_executive_snapshot, generate_readiness_scorecards
from app.analytics.forecast import generate_forecast_snapshot
from app.analytics.engine import generate_live_analytics
from app.models.incident import Incident
from app.prediction.coordinator import generate_coordination_intelligence
from app.prediction.resources import generate_resource_deployments


def _decision_state(
    critical_incidents: int,
    critical_zones: int,
    resource_load: str,
    readiness: int,
) -> str:
    if resource_load == "overloaded" and critical_zones >= 4:
        return "emergency"
    if critical_incidents >= 3 or critical_zones >= 3 or readiness < 45:
        return "critical"
    if critical_incidents >= 1 or resource_load != "normal":
        return "elevated"
    return "stable"


def _mutual_aid_need(
    resource_utilization: int,
    resource_load: str,
    escalation_probability: int,
) -> str:
    if resource_utilization >= 100 or resource_load == "overloaded":
        return "immediate"
    if escalation_probability >= 75:
        return "recommended"
    if resource_utilization >= 75:
        return "consider"
    return "none"


def _best_business_mode(
    decision_state: str,
    continuity: str,
    escalation_probability: int,
) -> str:
    if decision_state == "emergency" or continuity == "critical":
        return "full lockdown"
    if decision_state == "critical" or escalation_probability >= 70:
        return "partial shutdown"
    if continuity == "degraded":
        return "remote continuity"
    return "normal operations"


def _delay_cost_per_15min(
    financial_exposure: str,
    executive_risk_score: int,
    active_incidents: int,
) -> str:
    base = {
        "low": 2500,
        "moderate": 7500,
        "high": 15000,
        "severe": 30000,
    }[financial_exposure]
    cost = base + (executive_risk_score * 110) + (active_incidents * 900)
    return f"${cost:,}"


def generate_boardroom_snapshot(incidents: list[Incident]) -> dict[str, object]:
    live = generate_live_analytics(incidents)
    forecast = generate_forecast_snapshot(incidents)
    executive = generate_executive_snapshot(incidents)
    readiness = generate_readiness_scorecards(incidents)
    resources = generate_resource_deployments(incidents)
    coordinator = generate_coordination_intelligence(incidents)

    critical_zones = len([window for window in forecast["time_windows"] if window["risk_score"] >= 80])
    decision_state = _decision_state(
        live["summary"].critical_incidents,
        critical_zones,
        resources["global_load"],
        readiness["overall_readiness"],
    )
    mutual_aid_need = _mutual_aid_need(
        live["kpis"].resource_utilization,
        resources["global_load"],
        forecast["metrics"]["escalation_probability"],
    )
    business_modes = [
        "normal operations",
        "partial shutdown",
        "remote continuity",
        "full lockdown",
    ]
    best_mode = _best_business_mode(
        decision_state,
        forecast["time_windows"][-1]["continuity"],
        forecast["metrics"]["escalation_probability"],
    )

    recommended_actions: list[dict[str, object]] = [
        {
            "priority": 1,
            "title": "Authorize executive continuity posture",
            "impact": f"Stabilizes {best_mode} planning across impacted zones",
            "urgency": "immediate" if decision_state in {"critical", "emergency"} else "high",
        }
    ]

    if mutual_aid_need in {"recommended", "immediate"}:
        recommended_actions.append(
            {
                "priority": 2,
                "title": "Activate mutual aid escalation",
                "impact": "Improves responder depth before resource exhaustion",
                "urgency": "immediate" if mutual_aid_need == "immediate" else "high",
            }
        )

    if forecast["metrics"]["containment_probability"] <= 45:
        recommended_actions.append(
            {
                "priority": 3,
                "title": "Approve lockdown expansion contingency",
                "impact": "Reduces cascading disruption while containment remains weak",
                "urgency": "high",
            }
        )

    if readiness["overall_readiness"] < 55:
        recommended_actions.append(
            {
                "priority": len(recommended_actions) + 1,
                "title": "Trigger backup operating model",
                "impact": "Protects business continuity under degraded readiness",
                "urgency": "high",
            }
        )

    if coordinator["recommended_next_phase"]:
        recommended_actions.append(
            {
                "priority": len(recommended_actions) + 1,
                "title": f"Align command toward {coordinator['recommended_next_phase']}",
                "impact": "Keeps executive direction synchronized with command AI",
                "urgency": "elevated",
            }
        )

    top_dependencies = [
        "Medical surge availability",
        "Primary corridor access",
        "Executive communication delivery",
    ]

    if resources["global_load"] == "overloaded":
        top_dependencies[0] = "Mutual aid responder availability"

    board_message = [
        f"Decision state {decision_state} with {executive['executive_risk_score']} risk score",
        f"Best operating mode is {best_mode}",
        f"Delay cost estimated at { _delay_cost_per_15min(executive['financial_impact_level'], executive['executive_risk_score'], live['summary'].active_incidents) } every 15 minutes",
    ]

    if mutual_aid_need == "immediate":
        board_message.append("Immediate external support should be authorized")
    elif forecast["metrics"]["resource_recovery_probability"] >= 65:
        board_message.append("Internal recovery remains feasible with rapid decisions")
    else:
        board_message.append("Leadership timing will materially shape recovery speed")

    return {
        "decision_state": decision_state,
        "recommended_actions": recommended_actions[:5],
        "mutual_aid_need": mutual_aid_need,
        "business_modes": business_modes,
        "best_mode": best_mode,
        "delay_cost_per_15min": _delay_cost_per_15min(
            executive["financial_exposure"] if "financial_exposure" in executive else executive["financial_impact_level"],
            executive["executive_risk_score"],
            live["summary"].active_incidents,
        ),
        "top_dependencies": top_dependencies,
        "board_message": board_message[:4],
    }
