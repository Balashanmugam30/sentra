from __future__ import annotations

from typing import Any


def data_value(signals: list[dict[str, Any]], products: list[dict[str, Any]]) -> dict[str, object]:
    total_product_arr = sum(int(product["annual_revenue"]) for product in products)
    decision_value = sum(int(signal["decision_impact"]) * int(signal["volume_day"]) for signal in signals) // 1_000_000
    return {
        "data_product_arr": total_product_arr,
        "decision_value_index": decision_value,
        "monetizable_signal_count": len([signal for signal in signals if int(signal["monetization_value"]) >= 84]),
        "benchmark_report_value": 820_000,
        "risk_signal_api_value": 640_000,
        "government_watch_value": 110_000,
        "future_product_pipeline": 1_120_000,
    }
