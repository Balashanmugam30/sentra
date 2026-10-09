# 🔄 Sentra Rollback and Disaster Recovery Runbook

> **Document Type:** Rollback Procedures & Disaster Recovery Runbook  
> **Release Target:** Sentra v2.5.0 (Phase 9 Release)  
> **Target Audience:** Site Reliability Engineers, DevOps Engineers, Infrastructure Architects  
> **Canonical Production URLs:**  
> - Frontend: `https://sentra-01.vercel.app/`  
> - Backend: `https://sentra-li7c.onrender.com/`  
> - Render Service ID: `srv-d7og1jreo5us73e6un70`  

---

## 1. Recovery Objectives (RPO & RTO)

| Metric | Target | Current Realized State | Notes |
| :--- | :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | < 15 minutes | < 5 minutes (local WAL snapshot) | Dependent on local SQLite WAL flush frequency; off-host sync currently unconfigured. |
| **Recovery Time Objective (RTO)** | < 30 minutes | < 5 minutes | Container restart takes ~45-60 seconds on Render; Vercel edge rollback is near-instantaneous (<15s). |

---

## 2. Frontend Rollback Procedures (Vercel)

Vercel provides atomic, immutable deployment artifacts. A bad release can be rolled back without rebuilds or code changes.

### 2.1 Instant Rollback via Vercel Dashboard
1. Log into the Vercel Dashboard and navigate to the project `sentra-01` (`prj_RUJCzKUPXrC5GYVU2GMp6YlGVA8M`).
2. Go to the **Deployments** tab.
3. Locate the last known healthy deployment (e.g., `dpl_2CM9m91UW5kAbdmJrYi25Qg7GBrE` from Phase 8).
4. Click the three dots (`...`) menu and select **Instant Rollback / Promote to Production**.
5. Traffic is shifted to the target deployment across the global edge network within seconds.

### 2.2 Rollback via Vercel CLI / MCP
```powershell
# Rollback using Vercel CLI
vercel rollback <DEPLOYMENT_ID_OR_URL> --scope <TEAM_SCOPE> --yes
```

---

## 3. Backend Rollback Procedures (Render)

Render supports manual deployment triggering and git-commit redeployments.

### 3.1 Pinned Commit Redeploy via Git
Because Sentra strictly adheres to the single-branch workflow on `main`:
1. Identify the last known stable commit hash (e.g., Phase 8 commit `b9ab74e32fbdf20fc677f72770f90d7887ddcf48`).
2. Revert or hard-reset the commit on `main`:
   ```powershell
   git revert HEAD --no-edit
   git push origin main
   ```
3. Render will automatically detect the push and trigger a build and container restart.

### 3.2 Rollback via Render Dashboard / MCP API
1. Navigate to the Render Dashboard -> Web Services -> `sentra` (`srv-d7og1jreo5us73e6un70`).
2. Go to the **Deploys** tab.
3. Locate the target deployment and click **Rollback to this deploy**.
4. Monitor the deployment logs to confirm successful uvicorn startup and health probe response.

---

## 4. SQLite WAL Relational Persistence Recovery

Sentra stores operational state in an ACID-compliant SQLite relational database using Write-Ahead Logging (`WAL`).

### 4.1 Automatic Crash Recovery
SQLite WAL handles process crashes, SIGKILL, and container restarts automatically:
- Upon application restart, `OperationsPersistence` initializes a connection pool with `PRAGMA journal_mode=WAL` and `PRAGMA busy_timeout=5000`.
- The SQLite engine automatically recovers uncheckpointed WAL frames from `sentra_operations.db-wal` into the primary database file `sentra_operations.db`.
- Unfinished in-flight proposals in `PENDING` or `DISPATCHING` status are reconciled to prevent stuck locks.

### 4.2 Restoring from Crash-Consistent Snapshot
Sentra provides online, non-blocking snapshot backup functionality via `app/operations/backup.py`.

```powershell
# Execute programmatic backup creation
python -c "from app.operations.backup import OperationsBackupService; import asyncio; asyncio.run(OperationsBackupService().create_backup())"
```

To restore from a backup snapshot:
1. Stop the application server to prevent concurrent writes.
2. Locate the latest verified snapshot in `backups/operations/` (e.g., `sentra_ops_backup_20261009_140000.db`).
3. Verify the checksum against the accompanying `.meta.json` file:
   ```powershell
   Get-FileHash -Algorithm SHA256 .\backups\operations\sentra_ops_backup_*.db
   ```
4. Copy the snapshot over the primary database:
   ```powershell
   Copy-Item .\backups\operations\sentra_ops_backup_20261009_140000.db .\data\sentra_operations.db -Force
   Remove-Item .\data\sentra_operations.db-wal -ErrorAction SilentlyContinue
   Remove-Item .\data\sentra_operations.db-shm -ErrorAction SilentlyContinue
   ```
5. Restart the server and run timeline integrity verification.

---

## 5. Corrupted Backup Detection & Isolation Runbook

Phase 9 introduced defensive hardening in `app/operations/backup.py` to prevent unhandled process crashes when inspecting malformed or truncated backup snapshots.

### 5.1 Failure Handling Behavior
When `verify_backup_integrity()` encounters a corrupted SQLite file:
- It safely catches `sqlite3.DatabaseError` and `sqlite3.OperationalError`.
- It logs an `ERROR` event with the forensic details without terminating the calling thread.
- It returns `(False, {"error": "SQLite integrity check failed", "details": ...})`.

### 5.2 Isolation Procedure
If a backup fails verification during rehearsal:
1. Quarantine the corrupted backup file immediately:
   ```powershell
   Move-Item .\backups\operations\<CORRUPTED_BACKUP>.db .\backups\quarantine\
   Move-Item .\backups\operations\<CORRUPTED_BACKUP>.meta.json .\backups\quarantine\
   ```
2. Trigger an immediate fresh online backup from the live database:
   ```powershell
   python -c "from app.operations.backup import OperationsBackupService; import asyncio; s = OperationsBackupService(); res = asyncio.run(s.create_backup()); print(res)"
   ```
3. Run `verify_timeline_integrity()` on the live database to ensure runtime state is uncompromised.

---

## 6. Cold Restart & Ephemeral Disk Limits

> [!WARNING]
> **Ephemeral Disk Disclosure:** The Render Free tier provisions ephemeral container disks. When the container sleeps, restarts, or redeploys, non-persistent disk state is reset.

### Disaster Recovery Scenarios & Mitigations:
1. **Container Cold Sleep / Restart:**
   - The application automatically initializes default schema tables and reconciles state upon boot.
   - Production demo-seeding is suppressed in production-like environments (`SENTRA_ENABLE_DEMO_SEED: "false"`).
2. **Permanent Container Eviction:**
   - To achieve Tier C (`PRODUCTION_READY`), database persistence must be migrated to a managed external database (Amazon RDS / Supabase) with persistent multi-AZ storage.
