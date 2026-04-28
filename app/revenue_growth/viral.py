from __future__ import annotations


def build_viral_loop() -> dict[str, object]:
    shares_per_customer = 2.4
    invite_conversion = 0.56
    organic_coefficient = round(shares_per_customer * invite_conversion, 2)
    return {
        "shares_per_customer": shares_per_customer,
        "invite_conversion": round(invite_conversion * 100, 1),
        "organic_coefficient": organic_coefficient,
        "growth_multiplier": round(1 + organic_coefficient * 0.38, 2),
        "loop_cycle_days": 9,
        "top_loop": "executive report export -> board share -> demo request",
    }


def simulate_growth_loop(current_score: int) -> dict[str, object]:
    loop = build_viral_loop()
    return {
        "scenario": "viral_boardroom_loop",
        "new_growth_score": min(100, current_score + 4),
        "organic_coefficient": loop["organic_coefficient"],
        "projected_incremental_arr": 214_000,
        "recommended_loop": loop["top_loop"],
    }
