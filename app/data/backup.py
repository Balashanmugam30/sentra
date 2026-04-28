"""JSON-store backup snapshots for local-production parity."""

from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings


def _store_paths() -> list[Path]:
    names = [
        "sentra_billing_store_path",
        "sentra_crm_store_path",
        "sentra_customer_success_store_path",
        "sentra_marketplace_store_path",
        "sentra_partners_store_path",
        "sentra_developer_store_path",
        "sentra_growth_store_path",
        "sentra_investor_store_path",
        "sentra_execution_store_path",
        "sentra_government_store_path",
        "sentra_autonomy_store_path",
        "sentra_world_store_path",
        "auth_store_path",
        "audit_store_path",
    ]
    return [Path(str(getattr(settings, name))) for name in names]


def create_backup_snapshot(label: str = "manual") -> dict[str, Any]:
    backup_root = Path(settings.backup_dir)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    snapshot_dir = backup_root / f"{timestamp}-{label.replace(' ', '-').lower()}"
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    copied: list[dict[str, Any]] = []
    for path in _store_paths():
        if not path.exists() or not path.is_file():
            copied.append({"path": str(path), "status": "missing"})
            continue
        target = snapshot_dir / path.name
        shutil.copy2(path, target)
        copied.append({"path": str(path), "target": str(target), "status": "copied", "bytes": target.stat().st_size})
    manifest = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "label": label,
        "snapshot_dir": str(snapshot_dir),
        "files": copied,
    }
    (snapshot_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def list_backup_snapshots() -> list[dict[str, Any]]:
    root = Path(settings.backup_dir)
    if not root.exists():
        return []
    snapshots = []
    for path in sorted(root.iterdir(), reverse=True):
        manifest = path / "manifest.json"
        if manifest.exists():
            try:
                snapshots.append(json.loads(manifest.read_text(encoding="utf-8")))
            except json.JSONDecodeError:
                snapshots.append({"snapshot_dir": str(path), "status": "invalid_manifest"})
    return snapshots

