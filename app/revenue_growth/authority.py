from __future__ import annotations

from app.revenue_growth.models import AUTHORITY_SIGNALS


def build_authority_signals(tenant_id: str) -> list[dict[str, object]]:
    return [
        {
            "signal_id": signal_id,
            "tenant_id": tenant_id,
            "label": label,
            "value": value,
            "impact": impact,
        }
        for signal_id, label, value, impact in AUTHORITY_SIGNALS
    ]


def trust_score(signals: list[dict[str, object]]) -> int:
    score = 72
    score += min(9, int(next(item["value"] for item in signals if item["signal_id"] == "case_studies") / 2))
    score += min(6, int(next(item["value"] for item in signals if item["signal_id"] == "government_tenants")))
    score += min(8, int(next(item["value"] for item in signals if item["signal_id"] == "enterprise_tenants") / 7))
    return min(100, score)
