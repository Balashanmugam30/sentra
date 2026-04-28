from __future__ import annotations

from app.analytics.scenario_lab import _apply_option, _base_metrics, _preset_map
from app.models.incident import Incident


def _winner(score_a: int, score_b: int) -> str:
    if abs(score_a - score_b) <= 3:
        return "tie"
    return "option_a" if score_a > score_b else "option_b"


def _reasoning(
    option_a: dict[str, object],
    option_b: dict[str, object],
    winner: str,
) -> list[str]:
    reasons: list[str] = []

    lower_casualty = "option_a" if option_a["casualty_risk"] < option_b["casualty_risk"] else "option_b"
    higher_containment = (
        "option_a"
        if option_a["containment_probability"] > option_b["containment_probability"]
        else "option_b"
    )
    faster_recovery = (
        "option_a"
        if option_a["recovery_eta_minutes"] < option_b["recovery_eta_minutes"]
        else "option_b"
    )

    reasons.append(
        f"{'Option A' if lower_casualty == 'option_a' else 'Option B'} lowers casualty risk more effectively"
    )
    reasons.append(
        f"{'Option A' if higher_containment == 'option_a' else 'Option B'} improves containment probability"
    )
    reasons.append(
        f"{'Option A' if faster_recovery == 'option_a' else 'Option B'} restores operations faster"
    )

    if winner == "tie":
        reasons.append("Both options remain materially comparable at the current threat level")
    else:
        reasons.append(
            f"{'Option A' if winner == 'option_a' else 'Option B'} delivers the stronger overall executive tradeoff"
        )

    return reasons[:4]


def _summary(
    baseline: dict[str, int | str],
    option_a: dict[str, object],
    option_b: dict[str, object],
    winner: str,
) -> list[str]:
    summary = [
        f"Current decision environment is {baseline['current_state']}",
        f"Best option score is {max(int(option_a['overall_score']), int(option_b['overall_score']))}",
        f"Baseline readiness is {baseline['readiness']} with {baseline['critical_zones']} critical zones",
    ]

    if winner == "tie":
        summary.append("Leadership can choose either path with limited score separation")
    else:
        selected = option_a if winner == "option_a" else option_b
        summary.append(
            f"{selected['title']} is preferred with {selected['recovery_eta_minutes']} minute recovery outlook"
        )

    return summary[:4]


def generate_scenario_lab_comparison(
    incidents: list[Incident],
    option_a_id: str,
    option_b_id: str,
) -> dict[str, object]:
    presets = _preset_map()
    if option_a_id not in presets:
        option_a_id = "evacuate_now"
    if option_b_id not in presets:
        option_b_id = "delay_10"
    if option_a_id == option_b_id:
        option_b_id = "delay_10" if option_a_id != "delay_10" else "evacuate_now"

    baseline = _base_metrics(incidents)
    option_a = _apply_option(option_a_id, baseline)
    option_b = _apply_option(option_b_id, baseline)
    winner = _winner(int(option_a["overall_score"]), int(option_b["overall_score"]))

    recommended_choice = (
        "Maintain both options on standby"
        if winner == "tie"
        else str(option_a["title"])
        if winner == "option_a"
        else str(option_b["title"])
    )

    return {
        "current_state": baseline["current_state"],
        "comparison": {
            "option_a": option_a,
            "option_b": option_b,
        },
        "winner": winner,
        "recommended_choice": recommended_choice,
        "decision_reasoning": _reasoning(option_a, option_b, winner),
        "executive_summary": _summary(baseline, option_a, option_b, winner),
    }
