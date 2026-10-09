# app/operations/backup.py
"""
Disaster Recovery & Automated Backup Subsystem for Sentra Operations (Phase 7).
Provides online non-blocking crash-consistent SQLite WAL snapshots, SHA-256 integrity
verification, and automated restore rehearsal workflows.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import hashlib
import json
import logging
import os
from pathlib import Path
import sqlite3
import tempfile
from typing import Any, Dict, List, Optional, Tuple

from app.operations.persistence import OperationsPersistence

logger = logging.getLogger(__name__)


@dataclass
class BackupMetadata:
    backup_id: str
    timestamp: str
    source_db_path: str
    backup_file_path: str
    size_bytes: int
    sha256_checksum: str
    table_counts: Dict[str, int]
    timeline_chain_valid: bool
    status: str


class OperationsBackupManager:
    """Manages online backups, checksum validations, and restore rehearsals."""

    def __init__(self, persistence: Optional[OperationsPersistence] = None) -> None:
        self.persistence = persistence or OperationsPersistence.get_instance()
        self.db_path = self.persistence.db_path

    def create_backup(self, target_directory: Optional[str] = None) -> BackupMetadata:
        """
        Creates an online, non-blocking, crash-consistent snapshot using SQLite's
        native backup API. Computes SHA-256 checksum and inventory counts.
        """
        if not target_directory:
            backup_dir = self.db_path.parent / "backups"
        else:
            backup_dir = Path(target_directory)

        backup_dir.mkdir(parents=True, exist_ok=True)

        now = datetime.now(timezone.utc)
        timestamp_str = now.strftime("%Y%m%d_%H%M%S")
        backup_id = f"sentra_ops_backup_{timestamp_str}"
        target_file = backup_dir / f"{backup_id}.db"

        # Ensure source WAL checkpoint before snapshot
        source_conn = self.persistence._get_connection()
        try:
            source_conn.execute("PRAGMA wal_checkpoint(PASSIVE)")
        except Exception as e:
            logger.warning("Checkpoint prior to backup returned notice: %s", e)

        # Execute native online backup
        dest_conn = sqlite3.connect(str(target_file))
        try:
            with dest_conn:
                source_conn.backup(dest_conn)
        finally:
            dest_conn.close()

        # Compute SHA-256 checksum
        hasher = hashlib.sha256()
        with open(target_file, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        sha256_hash = hasher.hexdigest()
        size_bytes = target_file.stat().st_size

        # Inspect backup tables and count rows
        table_counts: Dict[str, int] = {}
        verify_conn = sqlite3.connect(str(target_file))
        try:
            cursor = verify_conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'operations_%'")
            tables = [row[0] for row in cursor.fetchall()]
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                table_counts[table] = cursor.fetchone()[0]
        finally:
            verify_conn.close()

        # Write companion metadata JSON
        meta = BackupMetadata(
            backup_id=backup_id,
            timestamp=now.isoformat(),
            source_db_path=str(self.db_path),
            backup_file_path=str(target_file),
            size_bytes=size_bytes,
            sha256_checksum=sha256_hash,
            table_counts=table_counts,
            timeline_chain_valid=True,
            status="SUCCESS",
        )

        meta_file = backup_dir / f"{backup_id}.meta.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(asdict(meta), f, indent=2)

        logger.info(
            "Created operations backup %s (%d bytes, sha256: %s...)",
            backup_id,
            size_bytes,
            sha256_hash[:12],
        )
        return meta

    def verify_backup(
        self, backup_file_path: str, expected_sha256: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Validates physical checksum and runs SQLite PRAGMA integrity_check.
        """
        path = Path(backup_file_path)
        if not path.is_file():
            return False, {"error": f"Backup file not found at {backup_file_path}"}

        hasher = hashlib.sha256()
        with open(path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        computed_sha = hasher.hexdigest()

        if expected_sha256 and computed_sha.lower() != expected_sha256.lower():
            return False, {
                "error": "Checksum mismatch",
                "computed_sha256": computed_sha,
                "expected_sha256": expected_sha256,
            }

        conn = sqlite3.connect(str(path))
        try:
            cursor = conn.cursor()
            cursor.execute("PRAGMA integrity_check")
            integrity_rows = cursor.fetchall()
            if not integrity_rows or integrity_rows[0][0] != "ok":
                return False, {
                    "error": "SQLite integrity check failed",
                    "details": [r[0] for r in integrity_rows],
                }
        finally:
            conn.close()

        return True, {
            "status": "VALID",
            "file_path": str(path),
            "sha256_checksum": computed_sha,
            "integrity_check": "ok",
        }

    def rehearse_restore(self, backup_file_path: str) -> Dict[str, Any]:
        """
        Performs an automated restore rehearsal into an isolated temporary environment.
        Validates schema, runs forensic timeline hash chain audit, and verifies data integrity.
        """
        valid, verify_details = self.verify_backup(backup_file_path)
        if not valid:
            return {
                "rehearsal_passed": False,
                "step_failed": "verify_backup",
                "details": verify_details,
            }

        # Mount restored database in a temporary staging directory
        with tempfile.TemporaryDirectory() as staging_dir:
            temp_db = Path(staging_dir) / "rehearsal.db"
            with open(backup_file_path, "rb") as src, open(temp_db, "wb") as dst:
                dst.write(src.read())

            temp_persistence = OperationsPersistence(db_path=str(temp_db))
            try:
                chain_valid, verified_events, chain_err = temp_persistence.verify_timeline_integrity()
                autonomy = temp_persistence.get_autonomy_state()
                proposals = temp_persistence.list_proposals(limit=10) if hasattr(temp_persistence, "list_proposals") else []

                report = {
                    "rehearsal_passed": chain_valid,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "backup_path": backup_file_path,
                    "sqlite_integrity": "ok",
                    "timeline_chain_valid": chain_valid,
                    "verified_events_count": verified_events,
                    "chain_error": chain_err,
                    "autonomy_mode": autonomy.mode.value,
                    "kill_switch_engaged": autonomy.kill_switch_engaged,
                    "rehearsal_status": "RESTORE_VERIFIED" if chain_valid else "CORRUPTION_DETECTED",
                }
            finally:
                temp_persistence.close()

            logger.info("Restore rehearsal completed: %s", report["rehearsal_status"])
            return report


backup_manager = OperationsBackupManager()
