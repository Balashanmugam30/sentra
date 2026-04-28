from __future__ import annotations

from typing import Any


def build_cap_table() -> dict[str, Any]:
    rounds = [
        {"round": "Founder", "post_money": 0, "dilution_percent": 0, "founder_percent": 100.0, "investor_percent": 0.0, "esop_percent": 0.0},
        {"round": "Angel", "post_money": 6_000_000, "dilution_percent": 8, "founder_percent": 92.0, "investor_percent": 8.0, "esop_percent": 0.0},
        {"round": "Seed SAFE", "post_money": 18_000_000, "dilution_percent": 12, "founder_percent": 80.9, "investor_percent": 15.1, "esop_percent": 4.0},
        {"round": "Series A", "post_money": 62_000_000, "dilution_percent": 18, "founder_percent": 66.3, "investor_percent": 25.7, "esop_percent": 8.0},
        {"round": "Series B", "post_money": 180_000_000, "dilution_percent": 16, "founder_percent": 55.7, "investor_percent": 34.3, "esop_percent": 10.0},
    ]
    latest = rounds[-1]
    return {
        "founder_ownership_remaining": latest["founder_percent"],
        "investor_ownership": latest["investor_percent"],
        "ESOP_percent": latest["esop_percent"],
        "post_money_valuation": latest["post_money"],
        "rounds": rounds,
        "dilution_heatmap": [
            {"stakeholder": "Founders", "seed": 80.9, "series_a": 66.3, "series_b": 55.7},
            {"stakeholder": "Investors", "seed": 15.1, "series_a": 25.7, "series_b": 34.3},
            {"stakeholder": "ESOP", "seed": 4.0, "series_a": 8.0, "series_b": 10.0},
        ],
    }

