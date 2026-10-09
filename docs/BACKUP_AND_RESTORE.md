# SENTRA OPERATIONS — DISASTER RECOVERY & BACKUP RUNBOOK
## High-Reliability Operations State, Automated Snapshots, and Rehearsal Verification

---

## 1. Executive Summary & Recovery Objectives

Sentra's Crisis Intelligence & Continuous Tactical Operations OS maintains mission-critical operational state (incident lifecycles, tactical response plans, authorized action proposals, idempotency ledgers, and tamper-evident audit timelines) with high durability and enterprise reliability.

### Target Service Level Objectives (SLOs)
| Metric | Target | Realization Strategy |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | **< 1 minute** | SQLite Write-Ahead Logging (`WAL` mode) with synchronous writes (`PRAGMA synchronous = NORMAL`) and automated checkpoints. |
| **RTO (Recovery Time Objective)** | **< 5 minutes** | Atomic file-level replacement of database snapshots, fast in-memory boot checks, and automated startup reconciliation. |
| **Data Integrity Guarantee** | **100% Cryptographically Verified** | SHA-256 snapshot checksumming + SHA-256 chained hash verification across all forensic timeline events. |

---

## 2. Persistence Architecture

### 2.1 Storage Subsystem
- **Engine:** ACID-Compliant Embedded Relational Database (`sqlite3` with Write-Ahead Logging).
- **Default Database Location:** `data/operations/operations.db` (configurable via `SENTRA_OPERATIONS_DB_PATH`).
- **Journal Mode:** `PRAGMA journal_mode = WAL`.
- **Busy Timeout:** `5000 ms` to handle high-frequency concurrent worker transitions.
- **Foreign Key Constraints:** `PRAGMA foreign_keys = ON` strictly enforced.

### 2.2 Relational Tables Inventory
1. `operations_autonomy_state`: Global autonomy mode, emergency kill-switch status, and attributions.
2. `operations_incident_states`: Per-incident lifecycle state machine tracking (`OPEN` -> `ASSESSING` -> `PLAN_READY` -> `RESOLVED`).
3. `operations_plans`: Full tactical response plans with structured step DAGs and uncertainty notes.
4. `operations_proposals`: Action proposals, two-person integrity approvals, and execution receipts.
5. `operations_idempotency_ledger`: Cryptographic SHA-256 payload hashes and execution outcomes preventing double-dispatch.
6. `operations_timeline_events`: Tamper-evident cryptographic hash chain rooted at Genesis Hash (`0000...0000`).

---

## 3. Automated Backup Subsystem

Sentra provides native online non-blocking crash-consistent snapshots via `app.operations.backup.OperationsBackupManager`.

### 3.1 Backup Generation Workflow
```bash
python -c "from app.operations.backup import backup_manager; meta = backup_manager.create_backup(); print(meta)"
```
1. **Checkpoint:** Performs passive WAL checkpoint (`PRAGMA wal_checkpoint(PASSIVE)`).
2. **Online Snapshot:** Utilizes SQLite's native online backup API (`source_conn.backup(dest_conn)`) to stream consistent pages without locking active writers.
3. **Checksumming:** Computes SHA-256 digest across the created snapshot.
4. **Metadata Manifest:** Generates companion JSON manifest (`.meta.json`) recording:
   - `backup_id` (e.g., `sentra_ops_backup_20261009_163000`)
   - `timestamp` (UTC ISO 8601)
   - `sha256_checksum`
   - `size_bytes`
   - `table_counts` for all `operations_*` tables.

---

## 4. Disaster Recovery & Restore Runbook

### Step 1: Emergency Operational Isolation
If corrupt data or physical node failure is suspected:
1. Trip the Emergency Kill Switch:
   ```bash
   curl -X POST https://sentra-li7c.onrender.com/api/v1/operations/kill-switch \
     -H "Authorization: Bearer $OPERATOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"engaged": true, "reason": "Disaster recovery rehearsal / database restoration in progress"}'
   ```

### Step 2: Select & Verify Backup Snapshot
1. Identify the most recent healthy backup snapshot in `data/operations/backups/`.
2. Verify physical checksum and SQLite internal page integrity:
   ```python
   from app.operations.backup import backup_manager

   valid, details = backup_manager.verify_backup("data/operations/backups/sentra_ops_backup_20261009_163000.db")
   assert valid, f"Backup validation failed: {details}"
   ```

### Step 3: Automated Restore Rehearsal
Prior to replacing production databases, rehearse the restoration in an ephemeral staging container:
```python
from app.operations.backup import backup_manager

report = backup_manager.rehearse_restore("data/operations/backups/sentra_ops_backup_20261009_163000.db")
print("Rehearsal Status:", report["rehearsal_status"])
assert report["rehearsal_passed"] is True
assert report["timeline_chain_valid"] is True
```

### Step 4: Production Restoration & Service Restart
1. Stop Sentra API worker processes.
2. Archive the existing degraded database:
   ```bash
   mv data/operations/operations.db data/operations/operations.db.corrupt.$(date +%s)
   rm -f data/operations/operations.db-wal data/operations/operations.db-shm
   ```
3. Copy verified backup to active path:
   ```bash
   cp data/operations/backups/sentra_ops_backup_20261009_163000.db data/operations/operations.db
   ```
4. Start Sentra API worker processes.
5. On boot, `OperationsPersistence` automatically:
   - Re-applies WAL configuration and schema migrations.
   - Executes `reconcile_startup_state()` to find and reconcile any in-flight actions that were interrupted by the crash.
   - Re-establishes forensic timeline continuity.

### Step 5: Verification & System Unfreeze
1. Run liveness and readiness probes:
   ```bash
   curl -s https://sentra-li7c.onrender.com/api/v1/operations/liveness
   curl -s https://sentra-li7c.onrender.com/api/v1/operations/readiness -H "Authorization: Bearer $OPERATOR_TOKEN"
   ```
2. Verify cryptographic timeline chain:
   ```bash
   curl -s https://sentra-li7c.onrender.com/api/v1/operations/timeline/verify -H "Authorization: Bearer $OPERATOR_TOKEN"
   ```
3. Once validated, reset the operational kill switch with administrative credentials.
