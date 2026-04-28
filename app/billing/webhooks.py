from __future__ import annotations

import json
from typing import Any

from fastapi import HTTPException, Request, status

from app.billing.service import billing_store
from app.core.config import settings


async def parse_stripe_webhook(request: Request) -> dict[str, Any]:
    body = await request.body()
    signature = request.headers.get("stripe-signature", "")

    if not settings.stripe_webhook_secret:
        try:
            return json.loads(body.decode("utf-8") or "{}")
        except json.JSONDecodeError as error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook JSON") from error

    try:
        import stripe  # type: ignore[import-not-found]

        return stripe.Webhook.construct_event(body, signature, settings.stripe_webhook_secret)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Stripe signature") from error


def sync_webhook_event(event: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    event_type = str(event.get("type") or event.get("event_type") or "unknown")
    data_object = event.get("data", {}).get("object", {}) if isinstance(event.get("data"), dict) else {}
    metadata = data_object.get("metadata", {}) if isinstance(data_object, dict) else {}
    tenant_id = str(metadata.get("tenant_id") or event.get("tenant_id") or "TEN-BALA-UNI")
    subscription = billing_store.record_webhook(event_type, tenant_id)
    return event_type, subscription
