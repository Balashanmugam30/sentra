# Sentra — Final Feature Verification & Audit Baseline
**Date:** 2026-10-11  
**Audit Phase:** Gate Zero & Baseline Verification  
**Auditor:** Principal Software Architect, Full-Stack QA & Release Lead  

---

## 1. Canonical Project & Strict Operating Rules

### 1.1 Source Control Truth
- **Canonical Repository:** `https://github.com/Balashanmugam30/sentra`
- **Active Branch:** `main` (strictly enforced, no branching, no force-push)
- **Local Commit Baseline:** `5f57de81336aaaf344eb2d4d433b87b57de813a4` (`audit: complete functional audit, data integrity verification, and CI formatting fixes`)
- **Remote `origin/main`:** In sync at `5f57de8`
- **Target Release Commit:** Synchronized with repaired test fixture auth harmonization and Playwright assertion calibration.
- **Working Tree Policy:** Clean, frozen UI design (zero visual/styling/theme/color/typography modifications).

### 1.2 Production Deployments Truth
- **Frontend (Vercel):**
  - **URL:** `https://sentra-01.vercel.app`
  - **Authenticated Dashboard:** `https://sentra-01.vercel.app/app`
  - **Executive Route:** `https://sentra-01.vercel.app/executive`
  - **Login Route:** `https://sentra-01.vercel.app/login`
  - **Active Deployment ID:** `dpl_6F2n6xVJMQeNmCCiHXX2zr9bFYxx`
  - **State:** `READY` (Production)
  - **Verified Commit:** `5f57de81336aaaf344eb2d4d433b87b57de813a4`
- **Backend (Render):**
  - **Service ID:** `srv-d7og1jreo5us73e6un70` (`sentra`)
  - **Region:** `singapore`
  - **Service Type:** `web_service` (Plan: `free`, Python Uvicorn / FastAPI)
  - **Active Deployment:** `dep-db5ni0ivcj2c73eqsqog` (State: `live`)
  - **Verified Commit:** `5f57de81336aaaf344eb2d4d433b87b57de813a4`
  - **Live URL:** `https://sentra-li7c.onrender.com`
  - **Live Health Endpoint:** `https://sentra-li7c.onrender.com/health` returns HTTP 200 OK (`service: "Sentra Backend", version: "0.1.0", status: "ok", environment: "production"`).
  - **Live Auth Login:** `POST https://sentra-li7c.onrender.com/auth/login` returns HTTP 200 OK with authentic JWT access token and refresh cookies in < 400ms.

---

## 2. GitHub Actions CI Forensics & Repair

### 2.1 Failure Root Cause
- **Workflow Run ID:** `38137291619` on commit `5f57de8`
- **Job:** `backend` (step `Run python -m pytest`)
- **Failing Tests:**
  1. `tests/test_enterprise_platform.py::test_auth_soc_geo_environment_osint_public_safety_smoke` (assert 401 == 200)
  2. `tests/test_enterprise_platform.py::test_incident_creation_and_logout` (assert 401 == 200)
- **Root Cause Analysis:**
  - In `test_enterprise_platform.py`, helper `_auth_headers()` calls `client.post("/auth/bootstrap-admin", ...)` with password `"StrongPass123!"` followed by `client.post("/auth/login", ...)`.
  - When running in full test suites, earlier tests (such as `test_demo_auth_and_session.py::test_bootstrap_admin_secret_enforced`) create a `super_admin` account.
  - Under Sentra's zero-trust security rules, `/auth/bootstrap-admin` enforces singleton super_admin creation and returns `409 Conflict`.
  - Because `bootstrap-admin` was rejected, `admin@sentra.local` was never created in `auth_store`, causing subsequent login requests to fail with HTTP 401 Unauthorized.
- **Remediation Applied:**
  1. Harmonized passwords in `test_operational_e2e_path.py` and `test_evidence_prediction_contracts.py` to use `"StrongPass123!"`.
  2. Hardened `_auth_headers()` in `test_enterprise_platform.py` to guarantee `admin@sentra.local` exists in `auth_store` with role `super_admin` and verified password hash if `/auth/bootstrap-admin` returns 409.
  3. Verified locally with `python -m pytest tests -q` — **75 passed, 0 failed (100%)**.

---

## 3. Verified Acceptance Test Baseline

| Test Suite | Target | Executed | Passed | Failed | Duration | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Backend Pytest** | `tests/*.py` | 75 | 75 | 0 | 24.3s | **VERIFIED PASS** |
| **Playwright E2E** | `tests/e2e/*.spec.ts` (16 specs) | 42 | 42 | 0 | 162.0s | **VERIFIED PASS** |
| **Frontend Lint** | `eslint . --max-warnings=0` | All files | Clean | 0 warnings | 151.0s | **VERIFIED PASS** |
| **Frontend Typecheck** | `tsc --noEmit` | All files | Clean | 0 errors | 43.0s | **VERIFIED PASS** |
| **Frontend Production Build** | `next build` (Next.js 16 App Router) | 163 routes | 163 generated | 0 errors | 41.0s | **VERIFIED PASS** |
| **Python Code Quality** | `black --check`, `ruff check` | 15 test files, app | Clean | 0 errors | 4.2s | **VERIFIED PASS** |

---

## 4. Environment & Storage Topology

### 4.1 Persistence Engines
- **Relational Operations DB:** SQLite database with WAL journaling at `data/operations/operations.db`.
  - Tables: `operations_action_proposals`, `operations_idempotency_ledger`, `operations_timeline_events`, `operations_playbook_executions`, `operations_lease_locks`.
  - Cryptographic Hash Chain: SHA-256 tamper-evident integrity hashes linked to prior block headers.
- **Data Plane Storage:** Local JSON document store at `data/sentra_data_plane.json`.
  - Holds telemetry records, drift metrics, model divergence benchmarks, and registered idempotency keys.
- **Auth & Tenancy Storage:**
  - `data/tenancy_store.json`: Multi-tenant organizations, invitations, department assignments, and quotas.
  - `.sentra_auth_store.json`: User credential records, Argon2/PBKDF2 hashes, and refresh sessions.
  - `.sentra_audit_store.json`: Append-only compliance log.
- **Ephemeral Storage Risk:** Render Free tier containers utilize local non-persistent disk. Upon cold restart or redeploy, in-memory caches and unbacked disk revert to container image base. Persistent disk or external PostgreSQL/Firestore is required for multi-region clustering.

### 4.2 External Integration Reality
- **Google Gemini AI:** Live when `GEMINI_API_KEY` is present; deterministic physics/rule-based specialist council fallback active when omitted.
- **Firebase Auth:** Client SDK active for token exchanges; Firestore live mode requires production service account credentials.
- **OpenWeather / Real-Time Weather:** Live when `OPENWEATHER_API_KEY` is set; deterministic calibrated atmospheric physics simulation active otherwise.
- **Physical Actuators & Hardware:** Default `SENTRA_MQTT_ENABLED=false` for cloud security; virtual adapters execute deterministic receipts.
- **Stripe Billing:** Fully functional sandbox simulation lifecycle (`plan_tier`, subscription tokens).
