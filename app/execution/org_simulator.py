from __future__ import annotations

from typing import Any


SCENARIOS: tuple[dict[str, Any], ...] = (
    {"scenario": "Hire 50 employees", "revenue_impact": 18, "runway_impact": -9, "morale_impact": 7, "execution_strain": 82, "valuation_effect": 12},
    {"scenario": "Fire 10%", "revenue_impact": -5, "runway_impact": 8, "morale_impact": -18, "execution_strain": 49, "valuation_effect": -4},
    {"scenario": "Expand to 3 countries", "revenue_impact": 28, "runway_impact": -6, "morale_impact": 4, "execution_strain": 76, "valuation_effect": 19},
    {"scenario": "Raise $20M", "revenue_impact": 11, "runway_impact": 46, "morale_impact": 9, "execution_strain": 58, "valuation_effect": 16},
    {"scenario": "Recession scenario", "revenue_impact": -16, "runway_impact": -3, "morale_impact": -12, "execution_strain": 71, "valuation_effect": -22},
    {"scenario": "Churn spike", "revenue_impact": -21, "runway_impact": -5, "morale_impact": -9, "execution_strain": 68, "valuation_effect": -18},
    {"scenario": "Competitor enters market", "revenue_impact": -8, "runway_impact": -2, "morale_impact": -4, "execution_strain": 62, "valuation_effect": -7},
)


def build_org_simulator(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "baseline": {
            "employees": int(metrics["employees"]),
            "countries": int(metrics["countries"]),
            "runway_months": int(metrics["runway_months"]),
            "ARR": int(metrics["ARR"]),
        },
        "scenarios": list(SCENARIOS),
        "recommended_simulation": "Expand to 3 countries with partner-led hiring guardrails",
    }


def run_org_simulation(metrics: dict[str, Any], scenario: str | None = None) -> dict[str, Any]:
    selected = scenario or "Expand to 3 countries"
    match = next((item for item in SCENARIOS if item["scenario"].lower() == selected.lower()), SCENARIOS[2])
    return {
        "scenario": selected,
        "result": match,
        "board_interpretation": "Approve only if CFO runway guardrail stays above 30 months.",
        "baseline_runway": int(metrics["runway_months"]),
    }
