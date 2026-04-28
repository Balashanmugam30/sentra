from __future__ import annotations

import asyncio
import json
import os
from typing import Any

try:
    import paho.mqtt.client as mqtt  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    mqtt = None

_client: Any | None = None
_connected = False


def mqtt_enabled() -> bool:
    return os.getenv("SENTRA_MQTT_ENABLED", "").lower() in {"1", "true", "yes"}


def _broker_host() -> str:
    return os.getenv("SENTRA_MQTT_BROKER", "127.0.0.1")


def _broker_port() -> int:
    try:
        return int(os.getenv("SENTRA_MQTT_PORT", "1883"))
    except ValueError:
        return 1883


def _topic_prefix() -> str:
    return os.getenv("SENTRA_MQTT_TOPIC_PREFIX", "sentra/devices")


def _on_connect(client: Any, userdata: Any, flags: Any, rc: int) -> None:
    global _connected
    _connected = rc == 0
    if _connected:
        client.subscribe(f"{_topic_prefix()}/+/telemetry")
        client.subscribe(f"{_topic_prefix()}/+/status")


def _on_message(client: Any, userdata: Any, message: Any) -> None:
    try:
        payload = json.loads(message.payload.decode("utf-8"))
    except Exception:
        return

    from app.hardware.ingest import ingest_mqtt_payload

    asyncio.run(ingest_mqtt_payload(message.topic, payload))


def start_mqtt_listener() -> None:
    global _client
    if not mqtt_enabled() or mqtt is None or _client is not None:
        return

    client = mqtt.Client()
    username = os.getenv("SENTRA_MQTT_USERNAME")
    password = os.getenv("SENTRA_MQTT_PASSWORD")
    if username:
        client.username_pw_set(username, password=password)
    client.on_connect = _on_connect
    client.on_message = _on_message
    try:
        client.connect(_broker_host(), _broker_port(), keepalive=30)
        client.loop_start()
        _client = client
    except Exception:
        _client = None


def stop_mqtt_listener() -> None:
    global _client, _connected
    if _client is None:
        return
    try:
        _client.loop_stop()
        _client.disconnect()
    except Exception:
        pass
    _client = None
    _connected = False


def publish_device_command(device_id: str, payload: dict[str, object]) -> bool:
    if _client is None or not _connected:
        return False
    try:
        _client.publish(f"{_topic_prefix()}/{device_id}/command", json.dumps(payload))
        return True
    except Exception:
        return False
