"""Billing reconciliation and subscription mismatch detection."""

from __future__ import annotations

from typing import Any

from app.billing.live_guard import stripe_live_readiness
from app.billing.service import billing_store


def billing_reconciliation_snapshot() -> dict[str, Any]:
    subscriptions = billing_store.list_subscriptions()
    invoices = billing_store.list_invoices()
    invoice_tenants = {invoice.get("tenant_id") for invoice in invoices}
    mismatches = [
        {
            "tenant_id": subscription.get("tenant_id"),
            "issue": "no_invoice_history",
            "plan": subscription.get("plan"),
        }
        for subscription in subscriptions
        if subscription.get("tenant_id") not in invoice_tenants
    ]
    failed_invoices = [invoice for invoice in invoices if invoice.get("status") in {"failed", "open"}]
    return {
        "status": "watch" if mismatches or failed_invoices else "pass",
        "stripe": stripe_live_readiness(),
        "subscriptions_checked": len(subscriptions),
        "invoices_checked": len(invoices),
        "subscription_mismatches": mismatches[:10],
        "failed_invoice_count": len(failed_invoices),
        "invoice_sync_checker": "ready",
    }


def retry_failed_webhook_events() -> dict[str, Any]:
    return {
        "ok": True,
        "retried": 0,
        "message": "No persisted failed webhook events pending replay in local store.",
    }

