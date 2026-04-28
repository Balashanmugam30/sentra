from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any


_STATE_FILE = Path(__file__).with_name("runtime_state.json")


def _default_state() -> dict[str, Any]:
    return {
        "mode": "online",
        "internet_status": "up",
        "backend_status": "healthy",
        "cached_assets_ready": False,
        "last_snapshot_at": None,
        "cache": {
            "zones": [],
            "building_map_metadata": {},
            "latest_fusion_truth": {},
            "active_workflows": [],
            "open_field_tasks": [],
            "registered_responders": [],
            "device_registry": [],
            "alert_templates": [],
            "last_known_priorities": [],
        },
        "offline_queue": [],
        "mode_history": [],
    }


def _serialize(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [_serialize(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _serialize(item) for key, item in value.items()}
    if hasattr(value, "model_dump"):
        return _serialize(value.model_dump())
    if hasattr(value, "__dict__") and not isinstance(value, (str, int, float, bool, type(None))):
        return _serialize(vars(value))
    return value


def load_offline_state() -> dict[str, Any]:
    if not _STATE_FILE.exists():
        state = _default_state()
        save_offline_state(state)
        return state

    try:
        content = json.loads(_STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        content = _default_state()
        save_offline_state(content)
        return content

    state = _default_state()
    state.update(content)
    state["cache"] = {**_default_state()["cache"], **content.get("cache", {})}
    if not isinstance(state.get("offline_queue"), list):
        state["offline_queue"] = []
    if not isinstance(state.get("mode_history"), list):
        state["mode_history"] = []
    return state


def save_offline_state(state: dict[str, Any]) -> None:
    _STATE_FILE.write_text(json.dumps(_serialize(state), indent=2), encoding="utf-8")

