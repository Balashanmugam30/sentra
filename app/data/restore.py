"""Safe restore helpers for backup snapshots."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any


def validate_snapshot(snapshot_dir: str) -> dict[str, Any]:
    root = Path(snapshot_dir)
    manifest = root / "manifest.json"
    if not root.exists() or not manifest.exists():
        return {"valid": False, "reason": "snapshot manifest not found", "snapshot_dir": snapshot_dir}
    try:
        payload = json.loads(manifest.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"valid": False, "reason": "manifest is not valid JSON", "snapshot_dir": snapshot_dir}
    files = payload.get("files", [])
    return {"valid": True, "snapshot_dir": snapshot_dir, "file_count": len(files), "manifest": payload}


def restore_snapshot(snapshot_dir: str, *, dry_run: bool = True) -> dict[str, Any]:
    validation = validate_snapshot(snapshot_dir)
    if not validation["valid"]:
        return validation
    restored: list[dict[str, Any]] = []
    for item in validation["manifest"].get("files", []):
        if item.get("status") != "copied":
            continue
        source = Path(str(item["target"]))
        destination = Path(str(item["path"]))
        restored.append({"source": str(source), "destination": str(destination), "dry_run": dry_run})
        if not dry_run:
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
    return {"valid": True, "dry_run": dry_run, "restored": restored}

