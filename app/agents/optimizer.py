from __future__ import annotations

from datetime import datetime, timezone

from app.agents.allocation import allocate_resource_plan
from app.agents.council import apply_optimization_scenario, generate_council_focus_weights
from app.agents.debate import get_live_debate_snapshot, run_debate_scenario
from app.agents.learning import get_learning_adjustments
from app.models.incident import Incident
from app.operations.engine import get_live_operations_snapshot
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments
from app.public_safety.engine import get_public_safety_eta_penalties
from app.resilience.recovery import get_resilience_live_snapshot
from app.governance.engine import get_governance_live_snapshot
from app.simulation.twin import generate_live_twin_state
from app.simulation.timeline import generate_timeline_forecast

_plan_counter = 100
_active_plan: dict[str, object] | None = None
_plan_history: list[dict[str, object]] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_plan_id() -> str:
    global _plan_counter
    _plan_counter += 1
    return f"OPT-{_plan_counter}"


def _scenario_for_debate(scenario: str) -> str:
    if scenario in {
        "critical_fire",
        "gas_leak",
        "mass_panic",
        "resource_shortage",
        "comms_breakdown",
    }:
        return scenario
    if scenario == "dual_incident":
        return "dual_incident"
    return "resource_shortage"


def _history_title(plan: dict[str, object], scenario: str | None) -> str:
    top_zones = [item["zone"] for item in plan["allocations"][:2]]
    if scenario == "dual_incident" and len(top_zones) >= 2:
        return "dual-zone split response"
    if scenario == "resource_shortage":
        return "reserve-preserving rebalance"
    if top_zones:
        return f"{top_zones[0]} surge allocation"
    return "command grid optimization"


def _persist_plan(plan: dict[str, object], scenario: str | None) -> dict[str, object]:
    global _active_plan
    _active_plan = plan
    _plan_history.insert(
        0,
        {
            "plan_id": plan["plan_id"],
            "generated_at": plan["generated_at"],
            "title": _history_title(plan, scenario),
            "efficiency_score": plan["global_efficiency_score"],
            "reserve_readiness": plan["reserve_readiness"],
            "summary": plan["summary"],
        },
    )
    del _plan_history[12:]
    return plan


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _apply_learning_optimizer_bias(plan: dict[str, object], scenario: str | None) -> dict[str, object]:
    learning = get_learning_adjustments()
    weights = learning["strategy_weights"]

    if weights.get("reserve_preserve", 50) >= 60 and plan["reserve_readiness"] < 72 and len(plan["allocations"]) > 4:
        deferred = plan["allocations"].pop()
        plan["unserved_demands"] = [
            f"{deferred['zone']} deferred to preserve strategic reserve",
            *plan["unserved_demands"],
        ][:4]
        plan["tradeoffs"] = [
            "Learning memory kept one allocation in reserve to protect follow-on response capacity",
            *plan["tradeoffs"],
        ][:4]
        plan["reserve_readiness"] = _clamp(int(plan["reserve_readiness"]) + 8, 0, 100)
        plan["cost_index"] = _clamp(int(plan["cost_index"]) - 4, 0, 100)
        plan["global_efficiency_score"] = _clamp(int(plan["global_efficiency_score"]) + 2, 0, 100)

    if weights.get("mutual_aid_early", 50) >= 60:
        plan["recommended_followups"] = [
            "Escalate mutual aid before reserve capacity drops below safe threshold",
            *plan["recommended_followups"],
        ]

    if scenario == "dual_incident" and weights.get("split_response", 50) <= 48:
        plan["tradeoffs"] = [
            "Learning memory warns that split response weakens containment under dual critical pressure",
            *plan["tradeoffs"],
        ][:4]

    plan["recommended_followups"] = list(dict.fromkeys(plan["recommended_followups"]))[:4]
    top_zone = plan["allocations"][0]["zone"] if plan["allocations"] else "Command Grid"
    plan["summary"] = (
        f"Allocation solver prioritizes {top_zone} with {len(plan['allocations'])} tactical assignments, "
        f"reserve readiness at {plan['reserve_readiness']}% and containment ETA near {plan['estimated_containment_minutes']} minutes."
    )
    return plan


def _apply_public_safety_bias(plan: dict[str, object], incidents: list[Incident]) -> dict[str, object]:
    eta_penalties = get_public_safety_eta_penalties(incidents)
    delayed_allocations = 0

    for allocation in plan["allocations"]:
        penalty = int(eta_penalties.get(str(allocation["zone"]), 0))
        if penalty <= 0:
            continue
        delayed_allocations += 1
        allocation["eta_minutes"] = min(22, int(allocation["eta_minutes"]) + penalty)
        allocation["impact_score"] = max(35, int(allocation["impact_score"]) - penalty * 2)
        allocation["rationale"] = (
            f"{allocation['rationale']}; civic traffic adds {penalty}m corridor penalty"
        )

    if delayed_allocations:
        plan["tradeoffs"] = [
            f"Traffic intelligence added route penalties across {delayed_allocations} tactical assignments",
            *plan["tradeoffs"],
        ][:4]
        plan["estimated_containment_minutes"] = min(
            240,
            int(plan["estimated_containment_minutes"]) + delayed_allocations * 2,
        )
        plan["global_efficiency_score"] = _clamp(
            int(plan["global_efficiency_score"]) - delayed_allocations * 2,
            0,
            100,
        )

    return plan


def _build_plan(incidents: list[Incident], scenario: str | None, *, persist: bool) -> dict[str, object]:
    apply_optimization_scenario(incidents, scenario)
    council_focus = generate_council_focus_weights(incidents)
    debate = (
        run_debate_scenario(incidents, _scenario_for_debate(scenario))
        if scenario is not None
        else get_live_debate_snapshot(incidents)
    )
    fusion = generate_fusion_snapshot(incidents)
    twin = generate_live_twin_state(incidents)
    timeline = generate_timeline_forecast(incidents)
    resources = generate_resource_deployments(incidents)
    operations = get_live_operations_snapshot(incidents)
    governance = get_governance_live_snapshot(incidents)
    resilience = get_resilience_live_snapshot(incidents)

    plan = allocate_resource_plan(
        incidents,
        fusion,
        twin,
        timeline,
        resources,
        operations,
        governance,
        resilience,
        debate,
        council_focus,
        scenario,
    )
    plan = _apply_public_safety_bias(plan, incidents)
    plan = _apply_learning_optimizer_bias(plan, scenario)
    payload = {
        "plan_id": _next_plan_id(),
        "generated_at": _now(),
        **plan,
    }
    return _persist_plan(payload, scenario) if persist else payload


def get_live_optimization_snapshot(incidents: list[Incident]) -> dict[str, object]:
    if _active_plan is not None:
        return _active_plan
    return _build_plan(incidents, None, persist=True)


def get_optimization_history_snapshot() -> dict[str, object]:
    return {"plans": list(_plan_history)}


def run_optimization_scenario(incidents: list[Incident], scenario: str) -> dict[str, object]:
    return _build_plan(incidents, scenario, persist=True)


def reset_optimization_state() -> dict[str, object]:
    global _active_plan
    cleared = len(_plan_history) + (1 if _active_plan is not None else 0)
    _active_plan = None
    _plan_history.clear()
    return {"status": "reset", "plans_cleared": cleared}
