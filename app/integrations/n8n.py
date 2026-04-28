from __future__ import annotations

import asyncio
import json
import os
import time
from datetime import datetime, timezone
from urllib import error, request

from app.communications.delivery_queue import add_recent_event

_runtime_webhook_url: str | None = None


def _env_flag(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _api_key() -> str | None:
    value = os.getenv("N8N_API_KEY", "").strip()
    return value or None


def _timeout_seconds() -> int:
    try:
        return max(1, int(os.getenv("N8N_TIMEOUT_SECONDS", "5")))
    except ValueError:
        return 5


def set_runtime_webhook_url(url: str | None) -> None:
    global _runtime_webhook_url
    cleaned = (url or "").strip()
    _runtime_webhook_url = cleaned or None


def _webhook_url() -> str | None:
    if _runtime_webhook_url:
        return _runtime_webhook_url

    url = os.getenv("N8N_WEBHOOK_URL", "").strip()
    return url or None


def n8n_enabled() -> bool:
    return _env_flag("N8N_ENABLED") or _webhook_url() is not None


def webhook_configured() -> bool:
    return _webhook_url() is not None


def get_n8n_status() -> str:
    if webhook_configured() and n8n_enabled():
        return "connected"
    if not n8n_enabled() and not webhook_configured():
        return "ready"
    return "ready"


def _request_headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    api_key = _api_key()
    if api_key:
        headers["X-N8N-API-KEY"] = api_key
    return headers


def _post_payload(url: str, payload: dict[str, object]) -> tuple[bool, str, int]:
    started = time.perf_counter()
    try:
        body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            url,
            data=body,
            headers=_request_headers(),
            method="POST",
        )
        with request.urlopen(req, timeout=_timeout_seconds()) as response:
            latency_ms = round((time.perf_counter() - started) * 1000)
            return True, f"{response.status} {response.reason}", latency_ms
    except error.HTTPError as exc:
        latency_ms = round((time.perf_counter() - started) * 1000)
        return False, f"{exc.code} {exc.reason}", latency_ms
    except Exception as exc:
        latency_ms = round((time.perf_counter() - started) * 1000)
        return False, str(exc), latency_ms


def build_standard_payload(
    *,
    event_name: str,
    provider: str,
    correlation_id: str,
    severity: str,
    data: dict[str, object],
) -> dict[str, object]:
    return {
        "event_name": event_name,
        "source": "sentra",
        "severity": severity,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "correlation_id": correlation_id,
        "provider": provider,
        "data": data,
    }


def post_standard_event_sync(
    *,
    event_name: str,
    provider: str,
    correlation_id: str,
    severity: str,
    data: dict[str, object],
) -> tuple[bool, str, int, dict[str, object]]:
    payload = build_standard_payload(
        event_name=event_name,
        provider=provider,
        correlation_id=correlation_id,
        severity=severity,
        data=data,
    )
    add_recent_event(event_name)

    if not n8n_enabled() or not webhook_configured():
        return False, "Webhook not configured", 0, payload

    success, response_text, latency_ms = _post_payload(_webhook_url() or "", payload)
    return success, response_text, latency_ms, payload


def post_webhook_sync(event: str, payload: dict[str, object]) -> tuple[bool, str]:
    add_recent_event(event)
    if not webhook_configured():
        return False, "Webhook not configured"

    success, response_text, _latency_ms = _post_payload(
        _webhook_url() or "",
        {
            "event": event,
            **payload,
        },
    )
    return success, response_text


async def emit_n8n_event(event: str, payload: dict[str, object]) -> bool:
    webhook_url = _webhook_url()
    add_recent_event(event)
    if webhook_url is None or not n8n_enabled():
        return False

    asyncio.create_task(
        asyncio.to_thread(
            _post_payload,
            webhook_url,
            {
                "event": event,
                **payload,
            },
        )
    )
    return True


async def emit_n8n_events(events: list[tuple[str, dict[str, object]]]) -> bool:
    triggered = False
    for event_name, payload in events:
        if await emit_n8n_event(event_name, payload):
            triggered = True
    return triggered
