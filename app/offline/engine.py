from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.models.incident import Incident
from app.offline.cache import load_offline_state, save_offline_state
from app.offline.schemas import OfflineOutageScenario

_state = load_offline_state()
_event_counter = max(
    [
        int(str(item.get("event_id", "OFF-0")).split("-")[-1])
        for item in _state.get("offline_queue", [])
        if str(item.get("event_id", "")).startswith("OFF-")
    ]
    or [0]
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now().isoformat()


def _next_event_id() -> str:
    global _event_counter
    _event_counter += 1
    return f"OFF-{_event_counter:04d}"


def _persist() -> None:
    save_offline_state(_state)


def _append_mode_history(reason: str) -> None:
    _state["mode_history"].append(
        {
            "timestamp": _now_iso(),
            "mode": _state["mode"],
            "reason": reason,
        }
    )
    del _state["mode_history"][:-30]


def _cache_payload(incidents: list[Incident]) -> dict[str, object]:
    from app.communications.engine import generate_live_communications
    from app.field.responders import build_responders_snapshot
    from app.field.tasks import build_tasks_snapshot
    from app.hardware.devices import build_devices_snapshot
    from app.operations.engine import get_live_operations_snapshot
    from app.perception.fusion import generate_fusion_snapshot

    fusion = generate_fusion_snapshot(incidents)
    operations = get_live_operations_snapshot(incidents)
    tasks = build_tasks_snapshot(incidents)
    responders = build_responders_snapshot()
    devices = build_devices_snapshot()
    communications = generate_live_communications(incidents)
    return {
        "zones": [zone.zone for zone in fusion["zones"]],
        "building_map_metadata": {
            "map_id": "sentra-hq-core",
            "zone_count": len(fusion["zones"]),
            "cached": True,
        },
        "latest_fusion_truth": {
            "global_status": fusion["global_status"],
            "top_zones": [
                {
                    "zone": zone.zone,
                    "fused_score": zone.fused_score,
                    "state": zone.state,
                }
                for zone in fusion["zones"][:5]
            ],
        },
        "active_workflows": operations["workflows"],
        "open_field_tasks": tasks,
        "registered_responders": responders,
        "device_registry": devices,
        "alert_templates": communications["templates_used"],
        "last_known_priorities": [
            f"{zone.zone}:{zone.fused_score}"
            for zone in fusion["zones"][:5]
        ],
    }


def freeze_cached_snapshots(incidents: list[Incident]) -> None:
    _state["cache"] = _cache_payload(incidents)
    _state["cached_assets_ready"] = True
    _state["last_snapshot_at"] = _now_iso()
    _persist()


def get_offline_mode() -> str:
    return str(_state.get("mode", "online"))


def is_local_control_mode() -> bool:
    return get_offline_mode() in {"degraded", "offline_local", "recovery_sync"}


def queue_event_if_needed(
    *,
    source: str,
    event_type: str,
    payload: dict[str, object],
    applied_locally: bool = True,
) -> dict[str, object] | None:
    if not is_local_control_mode():
        return None
    return store_offline_event(
        source=source,
        event_type=event_type,
        payload=payload,
        applied_locally=applied_locally,
    )


def store_offline_event(
    *,
    source: str,
    event_type: str,
    payload: dict[str, object],
    applied_locally: bool = False,
) -> dict[str, object]:
    event = {
        "event_id": _next_event_id(),
        "source": source,
        "type": event_type,
        "payload": payload,
        "created_at": _now_iso(),
        "sync_state": "queued",
        "last_error": None,
        "applied_locally": applied_locally,
    }
    _state["offline_queue"].append(event)
    del _state["offline_queue"][:-200]
    _persist()
    return event


def _local_alert_channels() -> list[str]:
    return ["sms_local", "wifi_lan", "device_siren"]


def _autonomy_minutes() -> int:
    mode = get_offline_mode()
    if mode == "offline_local":
        return 180 if _state.get("cached_assets_ready") else 75
    if mode == "degraded":
        return 120
    if mode == "recovery_sync":
        return 90
    return 240


def _recommended_actions() -> list[str]:
    queue = _state.get("offline_queue", [])
    pending = [item for item in queue if item.get("sync_state") != "synced"]
    actions: list[str] = []
    mode = get_offline_mode()

    if mode == "offline_local":
        actions.append("Keep responders on local Wi-Fi and continue queue-first updates")
        actions.append("Use device siren and LAN alert channels for urgent notifications")
    elif mode == "degraded":
        actions.append("Reduce cloud-dependent actions and preserve local command autonomy")
    elif mode == "recovery_sync":
        actions.append("Replay queued events before resuming full online orchestration")

    if pending:
        actions.append("Run sync now after connectivity stabilizes")
    if not _state.get("cached_assets_ready"):
        actions.append("Refresh and freeze local cache snapshots for offline survival")
    if not actions:
        actions.append("Offline resilience healthy; cached operations ready if WAN loss occurs")

    deduped: list[str] = []
    for action in actions:
        if action not in deduped:
            deduped.append(action)
    return deduped[:4]


def get_offline_live_snapshot(incidents: list[Incident]) -> dict[str, object]:
    if not _state.get("cached_assets_ready"):
        freeze_cached_snapshots(incidents)

    queue = _state.get("offline_queue", [])
    pending = [item for item in queue if item.get("sync_state") != "synced"]
    summary = (
        f"Mode {get_offline_mode()} with {len(pending)} pending offline events, "
        f"cache {'ready' if _state.get('cached_assets_ready') else 'warming'}, "
        f"and local alert channels standing by."
    )
    return {
        "mode": get_offline_mode(),
        "internet_status": _state.get("internet_status", "up"),
        "backend_status": _state.get("backend_status", "healthy"),
        "cached_assets_ready": bool(_state.get("cached_assets_ready", False)),
        "offline_queue_count": len(queue),
        "pending_sync_count": len(pending),
        "local_alert_channels": _local_alert_channels(),
        "estimated_autonomy_minutes": _autonomy_minutes(),
        "recommended_actions": _recommended_actions(),
        "summary": summary,
    }


def get_offline_cache_status_snapshot(incidents: list[Incident]) -> dict[str, object]:
    if not _state.get("cached_assets_ready"):
        freeze_cached_snapshots(incidents)

    cache = _state.get("cache", {})
    queue = _state.get("offline_queue", [])
    assets = {
        "maps_cached": bool(cache.get("building_map_metadata")),
        "zones_cached": bool(cache.get("zones")),
        "tasks_cached": bool(cache.get("open_field_tasks")),
        "devices_cached": bool(cache.get("device_registry")),
    }
    score = 40
    score += 15 if assets["maps_cached"] else 0
    score += 15 if assets["zones_cached"] else 0
    score += 15 if assets["tasks_cached"] else 0
    score += 15 if assets["devices_cached"] else 0

    return {
        **assets,
        "last_snapshot_at": _state.get("last_snapshot_at"),
        "cache_health_score": min(100, score),
        "queued_events": queue[-20:][::-1],
    }


def activate_offline_mode(incidents: list[Incident]) -> dict[str, object]:
    freeze_cached_snapshots(incidents)
    _state["mode"] = "offline_local"
    _state["internet_status"] = "down"
    _state["backend_status"] = "healthy"
    _append_mode_history("manual_activate")
    _persist()
    return {"status": "activated", "mode": _state["mode"]}


def deactivate_offline_mode(incidents: list[Incident]) -> dict[str, object]:
    freeze_cached_snapshots(incidents)
    _state["mode"] = "online"
    _state["internet_status"] = "up"
    _state["backend_status"] = "healthy"
    _append_mode_history("manual_deactivate")
    _persist()
    return {"status": "deactivated", "mode": _state["mode"]}


def set_recovery_mode() -> None:
    _state["mode"] = "recovery_sync"
    _state["internet_status"] = "up"
    _state["backend_status"] = "healthy"
    _append_mode_history("sync_recovery")
    _persist()


def finalize_sync_mode() -> None:
    pending = [item for item in _state.get("offline_queue", []) if item.get("sync_state") != "synced"]
    if pending:
        _state["mode"] = "degraded" if _state.get("internet_status") == "up" else "offline_local"
    else:
        _state["mode"] = "online" if _state.get("internet_status") == "up" else "offline_local"
        if _state["mode"] == "online":
            _state["backend_status"] = "healthy"
    _append_mode_history("sync_finalize")
    _persist()


def test_outage_mode(scenario: OfflineOutageScenario, incidents: list[Incident]) -> dict[str, object]:
    freeze_cached_snapshots(incidents)

    if scenario == "internet_loss":
        _state["mode"] = "offline_local"
        _state["internet_status"] = "down"
        _state["backend_status"] = "healthy"
    elif scenario == "cloud_loss":
        _state["mode"] = "degraded"
        _state["internet_status"] = "up"
        _state["backend_status"] = "degraded"
    elif scenario == "backend_partial":
        _state["mode"] = "degraded"
        _state["internet_status"] = "up"
        _state["backend_status"] = "degraded"
    elif scenario == "mobile_network_loss":
        _state["mode"] = "offline_local"
        _state["internet_status"] = "down"
        _state["backend_status"] = "healthy"
        store_offline_event(
            source="field",
            event_type="mobile_network_loss",
            payload={"message": "Responder mobile clients shifted to queued sync mode"},
            applied_locally=True,
        )
    elif scenario == "power_failure_gateway":
        _state["mode"] = "degraded"
        _state["internet_status"] = "up"
        _state["backend_status"] = "degraded"
        store_offline_event(
            source="hardware",
            event_type="power_failure_gateway",
            payload={"message": "Gateway power instability detected; local cache preserved"},
            applied_locally=True,
        )

    _append_mode_history(f"test:{scenario}")
    _persist()
    return {"status": "completed", "scenario": scenario, "mode": _state["mode"]}


def queued_events() -> list[dict[str, object]]:
    return list(_state.get("offline_queue", []))


def mark_event_synced(event_id: str) -> None:
    for event in _state.get("offline_queue", []):
        if event.get("event_id") == event_id:
            event["sync_state"] = "synced"
            event["last_error"] = None
            break
    _persist()


def mark_event_failed(event_id: str, error: str) -> None:
    for event in _state.get("offline_queue", []):
        if event.get("event_id") == event_id:
            event["sync_state"] = "failed"
            event["last_error"] = error
            break
    _persist()


def mode_note() -> str | None:
    mode = get_offline_mode()
    if mode == "online":
        return None
    return f"Offline resilience mode active: {mode.replace('_', ' ')}"
