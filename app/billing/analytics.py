from __future__ import annotations

from app.billing.service import churn_snapshot, failed_payments_snapshot, revenue_snapshot


def build_revenue_analytics() -> dict[str, object]:
    return revenue_snapshot()


def build_churn_intelligence() -> dict[str, object]:
    return churn_snapshot()


def build_failed_payment_recovery() -> dict[str, object]:
    return failed_payments_snapshot()
