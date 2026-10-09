# app/operations/persistence.py
"""
Durable ACID Relational Persistence Layer for Sentra Operations (Phase 7).
Enforces tenant-scoped storage, unique idempotency constraints, and tamper-evident
audit log hash chaining using SQLite with Write-Ahead Logging (WAL).
"""

from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import logging
import os
from pathlib import Path
import sqlite3
import threading
from typing import Any, Dict, List, Optional, Tuple

from app.operations.domain import (
    ActionProposalRecord,
    ActionType,
    AdapterOutcome,
    AutonomyMode,
    AutonomyState,
    OperationLifecycleStatus,
    ResponsePlanRecord,
    TimelineEventRecord,
)

logger = logging.getLogger(__name__)

GENESIS_HASH = "0" * 64


class OperationsPersistence:
    """Thread-safe, ACID-compliant relational persistence repository for Operations state."""

    _instance: Optional["OperationsPersistence"] = None
    _lock = threading.RLock()

    def __init__(self, db_path: Optional[str] = None) -> None:
        raw_path = (
            db_path
            or os.getenv("SENTRA_OPERATIONS_DB_PATH")
            or str(Path(__file__).resolve().parents[2] / "data" / "operations" / "operations.db")
        )
        self.db_path = Path(raw_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        self._init_schema()

    @classmethod
    def get_instance(cls, db_path: Optional[str] = None) -> "OperationsPersistence":
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls(db_path=db_path)
            return cls._instance

    def _get_connection(self) -> sqlite3.Connection:
        """Returns a thread-local SQLite connection with WAL mode enabled."""
        if not hasattr(self._local, "conn") or self._local.conn is None:
            conn = sqlite3.connect(str(self.db_path), timeout=10.0)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.execute("PRAGMA foreign_keys = ON;")
            conn.execute("PRAGMA busy_timeout = 5000;")
            self._local.conn = conn
        return self._local.conn

    def _init_schema(self) -> None:
        """Executes idempotent schema migrations."""
        with self._lock:
            conn = self._get_connection()
            with conn:
                conn.executescript(
                    """
                    CREATE TABLE IF NOT EXISTS operations_schema_meta (
                        version INTEGER PRIMARY KEY,
                        applied_at TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS operations_autonomy_state (
                        id INTEGER PRIMARY KEY CHECK (id = 1),
                        mode TEXT NOT NULL,
                        kill_switch_engaged INTEGER NOT NULL,
                        kill_switch_tripped_at TEXT,
                        kill_switch_tripped_by TEXT,
                        kill_switch_reason TEXT,
                        last_updated_at TEXT NOT NULL,
                        updated_by TEXT NOT NULL,
                        reason TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS operations_incident_states (
                        incident_id TEXT PRIMARY KEY,
                        tenant_id TEXT NOT NULL,
                        status TEXT NOT NULL,
                        updated_at TEXT NOT NULL,
                        updated_by TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS operations_plans (
                        plan_id TEXT PRIMARY KEY,
                        incident_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        playbook_id TEXT NOT NULL,
                        playbook_version TEXT NOT NULL,
                        title TEXT NOT NULL,
                        status TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL,
                        rationale TEXT NOT NULL,
                        plan_data_json TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS operations_proposals (
                        id TEXT PRIMARY KEY,
                        plan_id TEXT,
                        incident_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        action_type TEXT NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        target_zone TEXT NOT NULL,
                        risk_level TEXT NOT NULL,
                        proposer_id TEXT NOT NULL,
                        status TEXT NOT NULL,
                        approval_hash TEXT,
                        approved_by TEXT,
                        approved_at TEXT,
                        rejection_reason TEXT,
                        execution_idempotency_key TEXT,
                        execution_outcome TEXT,
                        proposal_data_json TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS operations_idempotency_ledger (
                        idempotency_key TEXT PRIMARY KEY,
                        tenant_id TEXT NOT NULL,
                        proposal_id TEXT NOT NULL,
                        action_type TEXT NOT NULL,
                        payload_hash TEXT NOT NULL,
                        outcome TEXT NOT NULL,
                        receipt_json TEXT NOT NULL,
                        dispatched_at TEXT NOT NULL,
                        completed_at TEXT
                    );

                    CREATE TABLE IF NOT EXISTS operations_timeline_events (
                        event_id TEXT PRIMARY KEY,
                        incident_id TEXT NOT NULL,
                        tenant_id TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        event_type TEXT NOT NULL,
                        source TEXT NOT NULL,
                        actor_id TEXT NOT NULL,
                        actor_role TEXT NOT NULL,
                        summary TEXT NOT NULL,
                        details_json TEXT NOT NULL,
                        prev_hash TEXT NOT NULL,
                        event_hash TEXT NOT NULL,
                        is_simulation INTEGER NOT NULL
                    );

                    CREATE INDEX IF NOT EXISTS idx_proposals_tenant_incident
                        ON operations_proposals (tenant_id, incident_id);
                    CREATE INDEX IF NOT EXISTS idx_proposals_status
                        ON operations_proposals (tenant_id, status);
                    CREATE INDEX IF NOT EXISTS idx_plans_tenant_incident
                        ON operations_plans (tenant_id, incident_id);
                    CREATE INDEX IF NOT EXISTS idx_timeline_tenant_incident
                        ON operations_timeline_events (tenant_id, incident_id, timestamp);
                    CREATE INDEX IF NOT EXISTS idx_timeline_event_hash
                        ON operations_timeline_events (event_hash);
                    """
                )

                # Initialize singleton autonomy state if not exists
                cursor = conn.execute("SELECT id FROM operations_autonomy_state WHERE id = 1")
                if cursor.fetchone() is None:
                    now = datetime.now(timezone.utc).isoformat()
                    conn.execute(
                        """
                        INSERT INTO operations_autonomy_state (
                            id, mode, kill_switch_engaged, kill_switch_tripped_at,
                            kill_switch_tripped_by, kill_switch_reason, last_updated_at,
                            updated_by, reason
                        ) VALUES (1, ?, 0, NULL, NULL, NULL, ?, 'system_init', 'Durable store initialized')
                        """,
                        (AutonomyMode.MODE_1_RECOMMEND.value, now),
                    )

    # --------------------------------------------------------------------------
    # Autonomy & Kill Switch Operations
    # --------------------------------------------------------------------------

    def get_autonomy_state(self) -> AutonomyState:
        with self._lock:
            conn = self._get_connection()
            row = conn.execute(
                """
                SELECT mode, kill_switch_engaged, kill_switch_tripped_at,
                       kill_switch_tripped_by, kill_switch_reason, last_updated_at,
                       updated_by, reason
                FROM operations_autonomy_state WHERE id = 1
                """
            ).fetchone()
            if not row:
                return AutonomyState(
                    mode=AutonomyMode.MODE_1_RECOMMEND,
                    kill_switch_engaged=False,
                    last_updated_at=datetime.now(timezone.utc),
                    updated_by="system",
                    reason="Default state",
                )

            return AutonomyState(
                mode=AutonomyMode(row["mode"]),
                kill_switch_engaged=bool(row["kill_switch_engaged"]),
                kill_switch_tripped_at=datetime.fromisoformat(row["kill_switch_tripped_at"])
                if row["kill_switch_tripped_at"]
                else None,
                kill_switch_tripped_by=row["kill_switch_tripped_by"],
                kill_switch_reason=row["kill_switch_reason"],
                last_updated_at=datetime.fromisoformat(row["last_updated_at"]),
                updated_by=row["updated_by"],
                reason=row["reason"],
            )

    def set_autonomy_mode(self, mode: AutonomyMode, updated_by: str, reason: str) -> AutonomyState:
        with self._lock:
            conn = self._get_connection()
            now = datetime.now(timezone.utc).isoformat()
            with conn:
                conn.execute(
                    """
                    UPDATE operations_autonomy_state
                    SET mode = ?, updated_by = ?, reason = ?, last_updated_at = ?
                    WHERE id = 1
                    """,
                    (mode.value, updated_by, reason, now),
                )
            return self.get_autonomy_state()

    def set_kill_switch(self, engaged: bool, actor_id: str, reason: str) -> AutonomyState:
        with self._lock:
            conn = self._get_connection()
            now = datetime.now(timezone.utc).isoformat()
            with conn:
                if engaged:
                    conn.execute(
                        """
                        UPDATE operations_autonomy_state
                        SET kill_switch_engaged = 1,
                            kill_switch_tripped_at = ?,
                            kill_switch_tripped_by = ?,
                            kill_switch_reason = ?,
                            last_updated_at = ?
                        WHERE id = 1
                        """,
                        (now, actor_id, reason, now),
                    )
                else:
                    conn.execute(
                        """
                        UPDATE operations_autonomy_state
                        SET kill_switch_engaged = 0,
                            kill_switch_tripped_at = NULL,
                            kill_switch_tripped_by = NULL,
                            kill_switch_reason = NULL,
                            last_updated_at = ?
                        WHERE id = 1
                        """,
                        (now,),
                    )
            return self.get_autonomy_state()

    # --------------------------------------------------------------------------
    # Incident State Operations
    # --------------------------------------------------------------------------

    def get_incident_state(self, incident_id: str, tenant_id: Optional[str] = None) -> OperationLifecycleStatus:
        with self._lock:
            conn = self._get_connection()
            if tenant_id:
                row = conn.execute(
                    "SELECT status FROM operations_incident_states WHERE incident_id = ? AND tenant_id = ?",
                    (incident_id, tenant_id),
                ).fetchone()
            else:
                row = conn.execute(
                    "SELECT status FROM operations_incident_states WHERE incident_id = ?",
                    (incident_id,),
                ).fetchone()

            if row:
                return OperationLifecycleStatus(row["status"])
            return OperationLifecycleStatus.OPEN

    def set_incident_state(
        self,
        incident_id: str,
        tenant_id: str,
        status: OperationLifecycleStatus,
        updated_by: str,
    ) -> None:
        with self._lock:
            conn = self._get_connection()
            now = datetime.now(timezone.utc).isoformat()
            with conn:
                conn.execute(
                    """
                    INSERT INTO operations_incident_states (incident_id, tenant_id, status, updated_at, updated_by)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(incident_id) DO UPDATE SET
                        status = excluded.status,
                        updated_at = excluded.updated_at,
                        updated_by = excluded.updated_by
                    """,
                    (incident_id, tenant_id, status.value, now, updated_by),
                )

    # --------------------------------------------------------------------------
    # Plans & Proposals Operations
    # --------------------------------------------------------------------------

    def save_plan(self, plan: ResponsePlanRecord) -> None:
        with self._lock:
            conn = self._get_connection()
            plan_json = plan.model_dump_json()
            with conn:
                conn.execute(
                    """
                    INSERT INTO operations_plans (
                        plan_id, incident_id, tenant_id, playbook_id, playbook_version,
                        title, status, created_at, updated_at, rationale, plan_data_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(plan_id) DO UPDATE SET
                        status = excluded.status,
                        updated_at = excluded.updated_at,
                        plan_data_json = excluded.plan_data_json
                    """,
                    (
                        plan.plan_id,
                        plan.incident_id,
                        plan.tenant_id,
                        plan.playbook_id,
                        plan.playbook_version,
                        plan.title,
                        plan.status.value,
                        plan.created_at.isoformat(),
                        plan.updated_at.isoformat(),
                        plan.rationale,
                        plan_json,
                    ),
                )
                for prop in plan.proposals:
                    self._save_proposal_row(conn, prop)

    def _save_proposal_row(self, conn: sqlite3.Connection, prop: ActionProposalRecord) -> None:
        prop_json = prop.model_dump_json()
        now = datetime.now(timezone.utc).isoformat()
        plan_id = getattr(prop, "plan_id", None)
        conn.execute(
            """
            INSERT INTO operations_proposals (
                id, plan_id, incident_id, tenant_id, action_type, title, description,
                target_zone, risk_level, proposer_id, status, approval_hash,
                approved_by, approved_at, rejection_reason, execution_idempotency_key,
                execution_outcome, proposal_data_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                approval_hash = excluded.approval_hash,
                approved_by = excluded.approved_by,
                approved_at = excluded.approved_at,
                rejection_reason = excluded.rejection_reason,
                execution_idempotency_key = excluded.execution_idempotency_key,
                execution_outcome = excluded.execution_outcome,
                proposal_data_json = excluded.proposal_data_json,
                updated_at = excluded.updated_at
            """,
            (
                prop.id,
                plan_id,
                prop.incident_id,
                prop.tenant_id,
                prop.action_type.value,
                prop.title,
                prop.description,
                prop.target_zone,
                prop.risk_level.value,
                prop.proposer_id,
                prop.status.value,
                prop.approval_hash,
                prop.approved_by,
                prop.approved_at.isoformat() if prop.approved_at else None,
                prop.rejection_reason,
                prop.execution_idempotency_key,
                prop.execution_outcome.value if prop.execution_outcome else None,
                prop_json,
                prop.created_at.isoformat(),
                now,
            ),
        )

    def get_plan(self, plan_id: str, tenant_id: Optional[str] = None) -> Optional[ResponsePlanRecord]:
        with self._lock:
            conn = self._get_connection()
            if tenant_id:
                row = conn.execute(
                    "SELECT plan_data_json FROM operations_plans WHERE plan_id = ? AND tenant_id = ?",
                    (plan_id, tenant_id),
                ).fetchone()
            else:
                row = conn.execute(
                    "SELECT plan_data_json FROM operations_plans WHERE plan_id = ?",
                    (plan_id,),
                ).fetchone()

            if row:
                return ResponsePlanRecord.model_validate_json(row["plan_data_json"])
            return None

    def get_latest_plan_for_incident(
        self, incident_id: str, tenant_id: Optional[str] = None
    ) -> Optional[ResponsePlanRecord]:
        with self._lock:
            conn = self._get_connection()
            if tenant_id:
                row = conn.execute(
                    """
                    SELECT plan_data_json FROM operations_plans
                    WHERE incident_id = ? AND tenant_id = ?
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (incident_id, tenant_id),
                ).fetchone()
            else:
                row = conn.execute(
                    """
                    SELECT plan_data_json FROM operations_plans
                    WHERE incident_id = ?
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (incident_id,),
                ).fetchone()

            if row:
                return ResponsePlanRecord.model_validate_json(row["plan_data_json"])
            return None

    def get_proposal(self, proposal_id: str, tenant_id: Optional[str] = None) -> Optional[ActionProposalRecord]:
        with self._lock:
            conn = self._get_connection()
            if tenant_id:
                row = conn.execute(
                    "SELECT proposal_data_json FROM operations_proposals WHERE id = ? AND tenant_id = ?",
                    (proposal_id, tenant_id),
                ).fetchone()
            else:
                row = conn.execute(
                    "SELECT proposal_data_json FROM operations_proposals WHERE id = ?",
                    (proposal_id,),
                ).fetchone()

            if row:
                return ActionProposalRecord.model_validate_json(row["proposal_data_json"])
            return None

    def list_proposals(
        self,
        tenant_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        status: Optional[OperationLifecycleStatus] = None,
        limit: Optional[int] = None,
    ) -> List[ActionProposalRecord]:
        with self._lock:
            conn = self._get_connection()
            query = "SELECT proposal_data_json FROM operations_proposals WHERE 1=1"
            params: List[Any] = []

            if tenant_id:
                query += " AND tenant_id = ?"
                params.append(tenant_id)
            if incident_id:
                query += " AND incident_id = ?"
                params.append(incident_id)
            if status:
                query += " AND status = ?"
                params.append(status.value)

            query += " ORDER BY created_at DESC"
            if limit and limit > 0:
                query += f" LIMIT {int(limit)}"
            rows = conn.execute(query, tuple(params)).fetchall()
            return [ActionProposalRecord.model_validate_json(r["proposal_data_json"]) for r in rows]

    def update_proposal(self, proposal: ActionProposalRecord) -> None:
        with self._lock:
            conn = self._get_connection()
            with conn:
                self._save_proposal_row(conn, proposal)
                plan_id = getattr(proposal, "plan_id", None)
                if plan_id:
                    plan_row = conn.execute(
                        "SELECT plan_data_json FROM operations_plans WHERE plan_id = ?",
                        (plan_id,),
                    ).fetchone()
                    if plan_row:
                        plan = ResponsePlanRecord.model_validate_json(plan_row["plan_data_json"])
                        for i, p in enumerate(plan.proposals):
                            if p.id == proposal.id:
                                plan.proposals[i] = proposal
                                break
                        conn.execute(
                            "UPDATE operations_plans SET plan_data_json = ? WHERE plan_id = ?",
                            (plan.model_dump_json(), plan.plan_id),
                        )

    def get_in_flight_proposals(self) -> List[ActionProposalRecord]:
        """Returns all proposals currently marked as EXECUTING or EXECUTION_REQUESTED."""
        with self._lock:
            conn = self._get_connection()
            rows = conn.execute(
                """
                SELECT proposal_data_json FROM operations_proposals
                WHERE status IN (?, ?)
                """,
                (OperationLifecycleStatus.EXECUTING.value, OperationLifecycleStatus.EXECUTION_REQUESTED.value),
            ).fetchall()
            return [ActionProposalRecord.model_validate_json(r["proposal_data_json"]) for r in rows]

    # --------------------------------------------------------------------------
    # Idempotency Ledger Operations
    # --------------------------------------------------------------------------

    def get_idempotency_record(self, idempotency_key: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            conn = self._get_connection()
            row = conn.execute(
                "SELECT receipt_json, payload_hash, tenant_id FROM operations_idempotency_ledger WHERE idempotency_key = ?",
                (idempotency_key,),
            ).fetchone()
            if row:
                return {
                    "receipt": json.loads(row["receipt_json"]),
                    "payload_hash": row["payload_hash"],
                    "tenant_id": row["tenant_id"],
                }
            return None

    def save_idempotency_record(
        self,
        idempotency_key: str,
        tenant_id: str,
        proposal_id: str,
        action_type: str,
        payload_hash: str,
        outcome: str,
        receipt_json: str,
        dispatched_at: str,
        completed_at: Optional[str] = None,
    ) -> bool:
        """Atomically registers an idempotency record. Returns False if already exists."""
        with self._lock:
            conn = self._get_connection()
            try:
                with conn:
                    conn.execute(
                        """
                        INSERT INTO operations_idempotency_ledger (
                            idempotency_key, tenant_id, proposal_id, action_type,
                            payload_hash, outcome, receipt_json, dispatched_at, completed_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            idempotency_key,
                            tenant_id,
                            proposal_id,
                            action_type,
                            payload_hash,
                            outcome,
                            receipt_json,
                            dispatched_at,
                            completed_at,
                        ),
                    )
                return True
            except sqlite3.IntegrityError:
                return False

    # --------------------------------------------------------------------------
    # Tamper-Evident Forensic Timeline Operations
    # --------------------------------------------------------------------------

    def get_last_timeline_hash(self) -> str:
        """Retrieves the cryptographic hash of the latest timeline event for chain continuation."""
        with self._lock:
            conn = self._get_connection()
            row = conn.execute(
                "SELECT event_hash FROM operations_timeline_events ORDER BY rowid DESC LIMIT 1"
            ).fetchone()
            if row and row["event_hash"]:
                return row["event_hash"]
            return GENESIS_HASH

    def append_timeline_event(
        self,
        event: TimelineEventRecord,
        details_json: str,
    ) -> Tuple[TimelineEventRecord, str]:
        """Atomically appends a timeline event with chained cryptographic SHA-256 hash."""
        with self._lock:
            conn = self._get_connection()
            prev_hash = self.get_last_timeline_hash()
            iso_time = event.timestamp.isoformat()

            # Deterministic canonical string for SHA-256
            hash_payload = (
                f"{prev_hash}|{event.event_id}|{event.tenant_id}|{event.incident_id}|"
                f"{iso_time}|{event.event_type}|{event.summary}|{details_json}"
            )
            event_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

            with conn:
                conn.execute(
                    """
                    INSERT INTO operations_timeline_events (
                        event_id, incident_id, tenant_id, timestamp, event_type,
                        source, actor_id, actor_role, summary, details_json,
                        prev_hash, event_hash, is_simulation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        event.event_id,
                        event.incident_id,
                        event.tenant_id,
                        iso_time,
                        event.event_type,
                        event.source,
                        event.actor_id,
                        event.actor_role,
                        event.summary,
                        details_json,
                        prev_hash,
                        event_hash,
                        1 if event.is_simulation else 0,
                    ),
                )
            return event, event_hash

    def list_timeline_events(
        self,
        tenant_id: Optional[str] = None,
        incident_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        with self._lock:
            conn = self._get_connection()
            query = "SELECT * FROM operations_timeline_events WHERE 1=1"
            params: List[Any] = []

            if tenant_id:
                query += " AND tenant_id = ?"
                params.append(tenant_id)
            if incident_id:
                query += " AND incident_id = ?"
                params.append(incident_id)

            query += " ORDER BY rowid DESC LIMIT ?"
            params.append(limit)

            rows = conn.execute(query, tuple(params)).fetchall()
            results = []
            for r in rows:
                results.append(
                    {
                        "event_id": r["event_id"],
                        "incident_id": r["incident_id"],
                        "tenant_id": r["tenant_id"],
                        "timestamp": r["timestamp"],
                        "event_type": r["event_type"],
                        "source": r["source"],
                        "actor_id": r["actor_id"],
                        "actor_role": r["actor_role"],
                        "summary": r["summary"],
                        "details": json.loads(r["details_json"]),
                        "prev_hash": r["prev_hash"],
                        "event_hash": r["event_hash"],
                        "is_simulation": bool(r["is_simulation"]),
                    }
                )
            return results

    def verify_timeline_integrity(self) -> Tuple[bool, int, Optional[str]]:
        """
        Verifies cryptographic integrity of the entire timeline event chain.
        Returns: (is_valid, total_events_checked, error_message)
        """
        with self._lock:
            conn = self._get_connection()
            rows = conn.execute("SELECT * FROM operations_timeline_events ORDER BY rowid ASC").fetchall()
            expected_prev = GENESIS_HASH
            for idx, r in enumerate(rows):
                if r["prev_hash"] != expected_prev:
                    return False, idx, f"Broken chain at event {r['event_id']}: expected prev_hash {expected_prev}, got {r['prev_hash']}"

                hash_payload = (
                    f"{r['prev_hash']}|{r['event_id']}|{r['tenant_id']}|{r['incident_id']}|"
                    f"{r['timestamp']}|{r['event_type']}|{r['summary']}|{r['details_json']}"
                )
                computed = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()
                if computed != r["event_hash"]:
                    return False, idx, f"Hash mismatch at event {r['event_id']}: expected {computed}, got {r['event_hash']}"

                expected_prev = r["event_hash"]

            return True, len(rows), None

    def get_durability_status(self) -> Dict[str, Any]:
        """
        Honest architectural diagnostic of operations persistence durability.
        Reports whether current storage is ephemeral container disk or durable external RDBMS.
        """
        has_database_url = bool(os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL"))
        is_render_env = bool(os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID"))
        has_persistent_disk = bool(os.getenv("RENDER_DISK_PATH") or os.getenv("PERSISTENT_STORAGE_PATH"))

        if has_database_url:
            storage_type = "managed_rdbms"
            durability_level = "durable_external"
            physical_permitted = False
            advisory = "External database configured. Physical actuator dispatches remain unconfigured/disabled."
        elif is_render_env and not has_persistent_disk:
            storage_type = "ephemeral_container_disk"
            durability_level = "ephemeral_degraded"
            physical_permitted = False
            advisory = (
                "Render Free ephemeral container disk active. SQLite WAL is crash-consistent locally "
                "but does not survive redeployments. Physical actuator dispatches strictly disabled."
            )
        else:
            storage_type = "local_filesystem_wal"
            durability_level = "local_durable"
            physical_permitted = False
            advisory = "Local filesystem SQLite WAL persistence active. Physical actuation disabled."

        return {
            "backend": "sqlite3_wal",
            "db_path": str(self.db_path),
            "storage_type": storage_type,
            "durability_level": durability_level,
            "is_ephemeral": durability_level == "ephemeral_degraded",
            "physical_actuators_permitted": physical_permitted,
            "tamper_evident_audit": True,
            "advisory": advisory,
        }

    def clear_all_for_tests(self) -> None:
        """Clears all operations tables and resets state for automated test runs."""
        with self._lock:
            conn = self._get_connection()
            with conn:
                conn.execute("DELETE FROM operations_timeline_events")
                conn.execute("DELETE FROM operations_idempotency_ledger")
                conn.execute("DELETE FROM operations_proposals")
                conn.execute("DELETE FROM operations_plans")
                conn.execute("DELETE FROM operations_incident_states")
                conn.execute("DELETE FROM operations_autonomy_state")
            self._init_schema()

    def close(self) -> None:
        """Closes thread-local database connection if active."""
        with self._lock:
            conn = getattr(self._local, "conn", None)
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
                self._local.conn = None


persistence = OperationsPersistence.get_instance()
