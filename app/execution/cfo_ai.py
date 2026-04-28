from __future__ import annotations

from typing import Any


def build_cfo_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    cash = int(metrics["cash_balance"])
    burn = int(metrics["monthly_burn"])
    return {
        "cash_balance": cash,
        "burn_multiple": round((burn * 12) / max(1, int(metrics["net_new_ARR"])), 2),
        "gross_margin_percent": int(metrics["gross_margin_percent"]),
        "department_spend": {
            "engineering": 420_000,
            "revenue": 310_000,
            "success": 155_000,
            "security": 140_000,
            "people": 96_000,
            "general_admin": 120_000,
        },
        "runway_months": int(metrics["runway_months"]),
        "raise_timing_recommendation": "Raise after UAE anchor or if strategic investor offers $120M+ pre-money.",
        "budget_leaks": ["Tool sprawl", "Duplicate agency spend", "Low-yield conference budget"],
        "scenario_forecasting": [
            {"scenario": "Freeze hiring", "runway_months": 43, "valuation_effect": "+4%"},
            {"scenario": "Cut costs 10%", "runway_months": 40, "valuation_effect": "+2%"},
            {"scenario": "Allocate growth budget", "runway_months": 31, "valuation_effect": "+12% if UAE closes"},
            {"scenario": "Extend runway mode", "runway_months": 48, "valuation_effect": "-3% growth drag"},
        ],
    }
