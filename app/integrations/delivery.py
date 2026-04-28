from __future__ import annotations

import hashlib

from app.communications.delivery_queue import (
    get_delivery_records_snapshot,
    get_queue_snapshot,
    get_recent_events,
    mark_retry_success,
    pending_or_failed_records,
    record_failure,
    record_sent,
    update_failure,
)
from app.integrations.connectors import build_provider_snapshots
from app.integrations.n8n import (
    n8n_enabled,
    post_standard_event_sync,
    set_runtime_webhook_url,
    webhook_configured,
)
from app.resilience.recovery import (
    can_send_provider,
    provider_fallback_chain,
    record_fallback_use,
    record_provider_failure,
    record_provider_success,
    record_retry_attempt,
    should_force_provider_failure,
)


def _receipt_id(provider: str, event_name: str, correlation_id: str, message: str) -> str:
    digest = hashlib.sha1(
        f"{provider}|{event_name}|{correlation_id}|{message}".encode("utf-8")
    ).hexdigest()[:10]
    return f"INT-{digest.upper()}"


def _mock_latency(provider: str, event_name: str) -> int:
    return 35 + (sum(ord(character) for character in f"{provider}|{event_name}") % 55)


def _payload_message(data: dict[str, object]) -> str:
    return str(data.get("message") or data.get("title") or data.get("status") or "sentra-event")


def _dispatch_payload(
    *,
    provider: str,
    event_name: str,
    correlation_id: str,
    severity: str,
    data: dict[str, object],
) -> dict[str, object]:
    message = _payload_message(data)
    candidates = [provider, *provider_fallback_chain(provider)]
    last_response_text = "Delivery failed"
    last_latency_ms = _mock_latency(provider, event_name)
    last_payload = data

    for index, candidate in enumerate(candidates):
        if not can_send_provider(candidate):
            if index + 1 < len(candidates):
                record_fallback_use(candidate, candidates[index + 1], "circuit open")
            continue

        receipt_id = _receipt_id(candidate, event_name, correlation_id, message)

        for attempt in range(1, 4):
            if attempt > 1:
                record_retry_attempt(candidate, attempt)

            if should_force_provider_failure(candidate):
                success = False
                response_text = "Forced failure"
                latency_ms = _mock_latency(candidate, event_name)
                payload = data
            elif not n8n_enabled() or not webhook_configured():
                record_sent(
                    receipt_id=receipt_id,
                    event=event_name,
                    channel=candidate,
                    payload=data,
                    provider=candidate,
                    response="MOCK 200 OK",
                )
                record_provider_success(candidate)
                if candidate != provider:
                    record_fallback_use(provider, candidate, "primary unavailable")
                return {
                    "status": "success",
                    "provider": candidate,
                    "mode": "mock",
                    "receipt_id": receipt_id,
                    "latency_ms": _mock_latency(candidate, event_name),
                    "n8n_triggered": False,
                }
            else:
                success, response_text, latency_ms, payload = post_standard_event_sync(
                    event_name=event_name,
                    provider=candidate,
                    correlation_id=correlation_id,
                    severity=severity,
                    data=data,
                )

            last_response_text = response_text
            last_latency_ms = latency_ms
            last_payload = payload

            if success:
                record_sent(
                    receipt_id=receipt_id,
                    event=event_name,
                    channel=candidate,
                    payload=payload,
                    provider=candidate,
                    response=response_text,
                )
                record_provider_success(candidate)
                if candidate != provider:
                    record_fallback_use(provider, candidate, "primary unavailable")
                return {
                    "status": "success",
                    "provider": candidate,
                    "mode": "live",
                    "receipt_id": receipt_id,
                    "latency_ms": latency_ms,
                    "n8n_triggered": True,
                }

            record_provider_failure(candidate, response_text)

        record_failure(
            receipt_id=receipt_id,
            event=event_name,
            channel=candidate,
            payload=last_payload,
            provider=candidate,
            attempts=3,
            response=last_response_text,
        )
        if index + 1 < len(candidates):
            record_fallback_use(candidate, candidates[index + 1], "max retries exceeded")

    receipt_id = _receipt_id(provider, event_name, correlation_id, message)
    record_failure(
        receipt_id=receipt_id,
        event=event_name,
        channel=provider,
        payload=last_payload,
        provider=provider,
        attempts=3,
        response=last_response_text,
    )
    return {
        "status": "failed",
        "provider": provider,
        "mode": "live" if n8n_enabled() and webhook_configured() else "mock",
        "receipt_id": receipt_id,
        "latency_ms": last_latency_ms,
        "n8n_triggered": n8n_enabled() and webhook_configured(),
    }


def _operation_providers(workflow_kind: str) -> list[str]:
    mapping = {
        "CRISIS_LOCKDOWN": ["slack", "whatsapp", "email", "google_sheets"],
        "MASS_PANIC_RESPONSE": ["whatsapp", "voice", "teams"],
        "GAS_LEAK_RESPONSE": ["facility_webhook", "sms", "email"],
        "COMMS_RECOVERY": ["slack", "email", "google_sheets"],
        "MUTUAL_AID": ["slack", "email", "teams", "google_sheets"],
        "RAPID_RESPONSE": ["slack", "whatsapp", "google_sheets"],
    }
    return mapping.get(workflow_kind, ["slack", "google_sheets"])


def dispatch_operation_event(event_name: str, payload: dict[str, object]) -> list[dict[str, object]]:
    workflow_kind = str(payload.get("workflow_kind", ""))
    workflow_id = str(payload.get("workflow_id", "OP-LOCAL"))
    priority = str(payload.get("priority", "high"))

    if event_name not in {"workflow.created", "workflow.completed", "workflow.cancelled"}:
        return []

    event_alias = (
        "workflow.triggered"
        if event_name == "workflow.created"
        else "workflow.completed"
        if event_name == "workflow.completed"
        else "workflow.cancelled"
    )

    results: list[dict[str, object]] = []
    for provider in _operation_providers(workflow_kind):
        results.append(
            _dispatch_payload(
                provider=provider,
                event_name=event_alias,
                correlation_id=workflow_id,
                severity=priority,
                data=payload,
            )
        )
    return results


def get_integrations_live_snapshot() -> dict[str, object]:
    records = get_delivery_records_snapshot()
    providers = build_provider_snapshots(
        records=records,
        n8n_enabled=n8n_enabled(),
        webhook_configured=webhook_configured(),
    )

    if any(item["status"] == "offline" for item in providers):
        global_status = "critical"
    elif any(item["status"] == "degraded" for item in providers):
        global_status = "degraded"
    else:
        global_status = "healthy"

    return {
        "n8n_enabled": n8n_enabled(),
        "webhook_configured": webhook_configured(),
        "global_status": global_status,
        "providers": providers,
        "queue_metrics": get_queue_snapshot(),
        "recent_events": get_recent_events()[:8],
    }


def send_integration_test(provider: str, message: str) -> dict[str, object]:
    return _dispatch_payload(
        provider=provider,
        event_name="integration.test",
        correlation_id=f"TEST-{provider.upper()}",
        severity="normal",
        data={
            "message": message,
            "provider": provider,
        },
    )


def retry_failed_integrations() -> dict[str, object]:
    retried_count = 0

    for record in pending_or_failed_records():
        retried_count += 1

        if not n8n_enabled() or not webhook_configured():
            mark_retry_success(record, "MOCK 200 OK")
            continue

        success, response_text, _latency_ms, payload = post_standard_event_sync(
            event_name=record.event,
            provider=record.provider,
            correlation_id=record.receipt_id,
            severity=str(record.payload.get("severity", "normal")),
            data=record.payload if isinstance(record.payload, dict) else {},
        )

        if success:
            mark_retry_success(record, response_text)
        else:
            update_failure(record, response_text)

    queue = get_queue_snapshot()
    return {
        "retried_count": retried_count,
        "remaining_failed": queue["failed"],
        "status": "completed",
    }


def configure_runtime_webhook(url: str) -> dict[str, object]:
    set_runtime_webhook_url(url)
    snapshot = get_integrations_live_snapshot()
    return {
        "status": "configured" if snapshot["webhook_configured"] else "cleared",
        "webhook_configured": snapshot["webhook_configured"],
        "n8n_enabled": snapshot["n8n_enabled"],
    }
