from __future__ import annotations

from typing import Any


def build_investor_metrics(base: dict[str, Any]) -> dict[str, Any]:
    arr = int(base["ARR"])
    mrr = int(base["MRR"])
    cac = int(base["CAC"])
    ltv = int(base["LTV"])
    net_burn = int(base["net_burn"])
    net_new_arr = int(base["net_new_ARR"])
    yoy_growth = int(base["YoY_growth_percent"])
    gross_margin = int(base["gross_margin_percent"])
    ebitda_margin = int(base["EBITDA_margin_percent"])
    ltv_cac = round(ltv / max(1, cac), 1)
    burn_multiple = round((net_burn * 12) / max(1, net_new_arr), 2)
    rule_of_40 = yoy_growth + ebitda_margin
    revenue_efficiency = min(100, round(gross_margin * 0.45 + int(base["net_revenue_retention"]) * 0.35 + max(0, 40 - int(base["CAC_payback_months"])) * 0.5))
    cash_efficiency = min(100, round(max(0, 4 - burn_multiple) * 22 + int(base["gross_margin_percent"]) * 0.25))
    return {
        **base,
        "ARR": arr,
        "MRR": mrr,
        "LTV_CAC": ltv_cac,
        "burn_multiple": burn_multiple,
        "rule_of_40": rule_of_40,
        "revenue_efficiency_score": revenue_efficiency,
        "cash_efficiency_score": cash_efficiency,
        "net_new_mrr": round(net_new_arr / 12),
        "gross_profit": round(arr * gross_margin / 100),
        "investor_summary": "Sentra combines triple-digit growth, elite NRR, strong gross margin, and long runway with a deep AI/GovTech moat.",
    }

