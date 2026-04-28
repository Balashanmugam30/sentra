from __future__ import annotations

from typing import Any


def score_signals(sources: list[dict[str, Any]]) -> list[dict[str, object]]:
    signals: list[dict[str, object]] = []
    for index, source in enumerate(sources):
        importance = 72 + (index * 5) % 24
        rarity = 64 + (index * 7) % 31
        prediction = 76 + (index * 3) % 21
        monetization = 70 + (index * 6) % 25
        trust = int(source.get("quality_score", 92))
        decision = round((importance + prediction + trust) / 3)
        signals.append(
            {
                "signal_id": f"SIG-{source['source_id']}",
                "tenant_id": source["tenant_id"],
                "source": source["name"],
                "category": source["category"],
                "importance_score": importance,
                "rarity_score": rarity,
                "prediction_value": prediction,
                "monetization_value": monetization,
                "trust_score": trust,
                "decision_impact": decision,
                "volume_day": source["signals_day"],
            }
        )
    return sorted(signals, key=lambda item: int(item["decision_impact"]), reverse=True)


def signal_value_summary(signals: list[dict[str, object]]) -> dict[str, object]:
    return {
        "avg_importance": round(sum(int(item["importance_score"]) for item in signals) / max(1, len(signals)), 1),
        "avg_prediction_value": round(sum(int(item["prediction_value"]) for item in signals) / max(1, len(signals)), 1),
        "avg_monetization_value": round(sum(int(item["monetization_value"]) for item in signals) / max(1, len(signals)), 1),
        "high_value_signals": len([item for item in signals if int(item["decision_impact"]) >= 88]),
    }
