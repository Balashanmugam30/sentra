from __future__ import annotations


def webhook_health(tenant_id: str) -> dict[str, object]:
    deliveries = 860_000
    failures = 4_980
    return {
        "tenant_id": tenant_id,
        "deliveries": deliveries,
        "retries": 12_600,
        "failures": failures,
        "dead_letters": 42,
        "success_rate": round(((deliveries - failures) / deliveries) * 100, 2),
        "top_event_types": [
            "incident.created",
            "ai.recommendation_created",
            "billing.subscription_updated",
            "success.churn_risk_high",
            "crm.deal_won",
        ],
    }
