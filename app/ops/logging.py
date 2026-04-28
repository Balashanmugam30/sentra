"""Ops logging helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from app.core.config import settings


def log_sink_status() -> dict[str, Any]:
    path = Path(settings.log_file_path)
    return {
        "status": "configured" if settings.log_file_path else "missing",
        "path": str(path),
        "exists": path.exists(),
        "bytes": path.stat().st_size if path.exists() else 0,
        "rotation_bytes": settings.log_rotation_bytes,
        "rotation_backups": settings.log_rotation_backups,
    }

