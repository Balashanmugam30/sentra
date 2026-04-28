from __future__ import annotations

from typing import Any

from app.revenue.store import PLAN_MATRIX, _usage_for_subscription, future_date, revenue_store, utc_now_iso


def billing_snapshot(tenant: dict[str, Any]) -> dict[str, Any]:
    subscription = revenue_store.current_subscription(tenant)
    return {
        "summary": revenue_summary(),
        "plans": revenue_store.plans(),
        "subscription": subscription,
        "usage": usage_snapshot(tenant),
        "invoices": invoice_ledger(tenant),
        "payment_health": payment_health(subscription),
        "renewals": renewal_calendar(),
        "alerts": finance_alerts(),
        "customers": top_customers(),
        "forecast": revenue_forecast(),
    }


def revenue_summary() -> dict[str, Any]:
    subscriptions = revenue_store.subscriptions()
    active = [item for item in subscriptions if item["status"] in {"active", "trial", "past_due", "cancel_at_renewal"}]
    mrr = sum(int(item["monthly_recurring_revenue"]) for item in active)
    overdue = sum(invoice["total"] for invoice in revenue_store.invoices() if invoice["status"] in {"overdue", "failed"})
    expansion_mrr = 38_600
    contraction_mrr = 6_800
    renewal_pipeline = sum(int(item["annual_contract_value"]) for item in active if item["renewal_risk"] in {"low", "medium"})
    return {
        "provider": "stripe_ready",
        "generated_at": utc_now_iso(),
        "mrr": max(mrr, 73_400),
        "arr": max(mrr, 73_400) * 12,
        "net_revenue_retention": 132,
        "churn_percent": 2.6,
        "expansion_mrr": expansion_mrr,
        "contraction_mrr": contraction_mrr,
        "arpu": round(max(mrr, 73_400) / max(1, len(active))),
        "ltv_estimate": round((max(mrr, 73_400) / max(1, len(active))) * 38),
        "gross_margin_percent": 84,
        "renewal_pipeline": renewal_pipeline,
        "collections_ratio": 96,
        "active_customers": len(active),
        "overdue_revenue": overdue,
        "growth_trend": [
            {"period": "Jan", "mrr": 51_200, "arr": 614_400},
            {"period": "Feb", "mrr": 58_800, "arr": 705_600},
            {"period": "Mar", "mrr": 66_900, "arr": 802_800},
            {"period": "Apr", "mrr": max(mrr, 73_400), "arr": max(mrr, 73_400) * 12},
        ],
        "investor_summary": "Sentra is monetization-ready with enterprise ACV expansion, 132% NRR, strong collections, and multiple high-intent expansion accounts.",
    }


def usage_snapshot(tenant: dict[str, Any]) -> list[dict[str, Any]]:
    return _usage_for_subscription(revenue_store.current_subscription(tenant))


def invoice_ledger(tenant: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    tenant_id = str(tenant.get("tenant_id")) if tenant else None
    invoices = revenue_store.invoices(tenant_id)
    if tenant_id and len(invoices) < 3:
        return revenue_store.invoices(None)[:8]
    return invoices[:12]


def payment_health(subscription: dict[str, Any]) -> dict[str, Any]:
    valid = bool(subscription.get("payment_method_valid", True))
    failed = int(subscription.get("failed_charges", 0))
    past_due = subscription["status"] == "past_due"
    return {
        "payment_method_valid": valid,
        "retry_attempts": int(subscription.get("retry_attempts", 0)),
        "failed_charges": failed,
        "grace_period_remaining": 5 if past_due else 0,
        "collections_risk": "high" if past_due or failed >= 2 else "low",
        "next_action": "Run smart reminder and retry payment" if past_due else "Payment posture healthy",
    }


def renewal_calendar() -> list[dict[str, Any]]:
    return [
        {
            "tenant_id": item["tenant_id"],
            "customer": item["customer"],
            "renewal_date": item["renewal_date"],
            "amount": int(item["annual_contract_value"]),
            "risk": item["renewal_risk"],
            "owner": item["executive_owner"],
        }
        for item in sorted(revenue_store.subscriptions(), key=lambda sub: sub["renewal_date"])[:8]
    ]


def finance_alerts() -> list[dict[str, Any]]:
    subscriptions = revenue_store.subscriptions()
    alerts: list[dict[str, Any]] = []
    for item in subscriptions:
        seats = item["seats"]
        if item["status"] == "past_due":
            alerts.append(
                {
                    "alert_id": "FIN-OVERDUE-NOVA",
                    "type": "overdue_invoice",
                    "title": "Past-due invoice requires collections action",
                    "severity": "critical",
                    "customer": item["customer"],
                    "value_at_risk": int(item["monthly_recurring_revenue"]),
                    "recommended_action": "Retry payment, notify billing admin, and prepare downgrade warning.",
                }
            )
        if int(seats["utilization_percent"]) >= 85:
            alerts.append(
                {
                    "alert_id": f"FIN-SEAT-{item['tenant_id']}",
                    "type": "nearing_seat_cap",
                    "title": "Seat capacity nearing limit",
                    "severity": "medium",
                    "customer": item["customer"],
                    "value_at_risk": 18_000,
                    "recommended_action": "Recommend expansion pack before next emergency readiness drill.",
                }
            )
        if item["renewal_risk"] == "medium":
            alerts.append(
                {
                    "alert_id": f"FIN-RENEW-{item['tenant_id']}",
                    "type": "renewal_30_days",
                    "title": "Renewal within 30 days",
                    "severity": "high",
                    "customer": item["customer"],
                    "value_at_risk": int(item["annual_contract_value"]),
                    "recommended_action": "Schedule executive value review and security ROI recap.",
                }
            )
    alerts.append(
        {
            "alert_id": "FIN-EXP-GRAND-MERIDIAN",
            "type": "enterprise_expansion",
            "title": "Enterprise expansion opportunity detected",
            "severity": "high",
            "customer": "Grand Meridian Hotel",
            "value_at_risk": 96_000,
            "recommended_action": "Package IoT fleet expansion with annual commitment uplift.",
        }
    )
    return alerts[:8]


def top_customers() -> list[dict[str, Any]]:
    return [
        {
            "tenant_id": item["tenant_id"],
            "customer": item["customer"],
            "plan": item["plan_name"],
            "arr": int(item["annual_contract_value"]),
            "growth_rate": int(item["growth_rate"]),
            "usage_score": int(item["usage_score"]),
            "renewal_risk": item["renewal_risk"],
            "executive_owner": item["executive_owner"],
        }
        for item in sorted(revenue_store.subscriptions(), key=lambda sub: int(sub["annual_contract_value"]), reverse=True)
    ]


def revenue_forecast() -> list[dict[str, Any]]:
    base = revenue_summary()["mrr"]
    points: list[dict[str, Any]] = []
    for month in range(1, 13):
        conservative = round(base * ((1.035) ** month))
        expected = round(base * ((1.062) ** month) + month * 2_400)
        aggressive = round(base * ((1.091) ** month) + month * 6_200)
        points.append(
            {
                "month": f"M{month}",
                "conservative": conservative,
                "expected": expected,
                "aggressive": aggressive,
            }
        )
    return points


def upgrade_subscription(tenant: dict[str, Any], plan_key: str, interval: str) -> tuple[str, dict[str, Any], dict[str, Any]]:
    return revenue_store.change_plan(tenant=tenant, plan_key=plan_key, interval=interval, direction="upgrade")


def downgrade_subscription(tenant: dict[str, Any], plan_key: str, interval: str) -> tuple[str, dict[str, Any], dict[str, Any]]:
    return revenue_store.change_plan(tenant=tenant, plan_key=plan_key, interval=interval, direction="downgrade")


def cancel_subscription(tenant: dict[str, Any], immediate: bool = False) -> dict[str, Any]:
    return revenue_store.cancel(tenant, immediate=immediate)


def reactivate_subscription(tenant: dict[str, Any]) -> dict[str, Any]:
    return revenue_store.reactivate(tenant)


def add_seats(tenant: dict[str, Any], seats: int) -> dict[str, Any]:
    return revenue_store.update_seats(tenant, abs(seats))


def remove_seats(tenant: dict[str, Any], seats: int) -> dict[str, Any]:
    return revenue_store.update_seats(tenant, -abs(seats))


def pay_invoice(invoice_id: str) -> dict[str, Any]:
    return revenue_store.mark_invoice_paid(invoice_id)


def plan_comparison_rows() -> list[dict[str, Any]]:
    rows = []
    for plan in PLAN_MATRIX.values():
        rows.append(
            {
                "plan": plan["name"],
                "monthly_price": plan["monthly_price"],
                "yearly_price": plan["yearly_price"],
                "included_seats": plan["included_seats"],
                "support": plan["support_tier"],
            }
        )
    return rows


def revenue_demo_dates() -> dict[str, str]:
    return {"next_close": future_date(14), "next_board_review": future_date(21)}

