# Sentra — Gate Zero Functional Audit Baseline
**Date:** 2026-10-11  
**Audit Phase:** Gate Zero — Baseline State Establishment  
**Auditor:** Principal Software Architect, Full-Stack QA & Release Lead  

---

## 1. Repository & Deployment Truth

### 1.1 Git Source Control
- **Canonical Repository:** `https://github.com/Balashanmugam30/sentra`
- **Active Branch:** `main` (strictly enforced, no branching or force-push)
- **Local HEAD:** `029544226eb06ec63d07a05825cd1ef8d4ee38f7` (`docs: add final visual audit and verification matrix for release 8b1d787`)
- **Remote `origin/main`:** In sync at `0295442`
- **Working Tree Status:** Clean (with zero unstaged/untracked modifications prior to test formatting)

### 1.2 GitHub Actions CI Pipeline
- **Latest Push Workflow Run:** ID `38131403096`
- **Status:** Evaluated and Root-Caused.
  - Failure occurred in `backend` job at step `black --check ... tests` due to formatting variance in `tests/test_demo_auth_and_session.py`.
  - Remediated locally via `python -m black tests/test_demo_auth_and_session.py`. All 15 files now pass `black --check`.
  - `ruff check app tests` passes (All checks passed!).
  - `mypy` passes (Success: no issues found in 4 source files).

### 1.3 Active Production Deployments
- **Frontend (Vercel):**
  - **URL:** `https://sentra-01.vercel.app`
  - **Deployment ID:** `dpl_61MPbBnysVS4cTs2mZQAn1hjKga3`
  - **State:** `READY` (Production target)
  - **Deployed Commit:** `029544226eb06ec63d07a05825cd1ef8d4ee38f7`
- **Backend (Render):**
  - **Service ID:** `srv-d7og1jreo5us73e6un70` (`sentra`)
  - **Region:** `singapore`
  - **Service Type:** `web_service` (Plan: `free`, Python Uvicorn)
  - **Active Deployment:** `dep-db5m49brjlhs73at5qtg` (State: `live`)
  - **Deployed Commit:** `029544226eb06ec63d07a05825cd1ef8d4ee38f7`
  - **Live URL:** `https://sentra-li7c.onrender.com`
  - **Live Health Endpoint:** `https://sentra-li7c.onrender.com/health` returns HTTP 200 OK (`service: "Sentra Backend", version: "0.1.0", status: "ok", environment: "production"`).

---

## 2. Configuration & Persistence Architecture

### 2.1 Persistence Topology
- **Primary Database Engine:** SQLite / JSON Document Stores (Render single-node runtime with optional WAL mode).
- **Persistent Data Stores:**
  - `data/sentra_data_plane.json` (Sensor readings, model registry, shadow divergence logs, drift reports)
  - `data/tenancy_store.json` (Tenants, users, RBAC role assignments, invitations)
  - `data/operations_state.json` / `lib/operations/operations-service.ts` (Autonomy modes, kill-switch status, action proposals, playbooks, execution adapters, simulation events)
  - `data/billing_store.json`, `data/crm_store.json`, `data/marketplace_store.json`, `data/iot_store.json`, `data/investor_store.json`
  - Local SQLite / File persistence for `.sentra_auth_store.json` and `.sentra_audit_store.json`
- **Off-Host Persistence Status:** Unconfigured on Render Free tier. Ephemeral storage risk: data written to local container disk resets on deployment restart unless backed up or mounted to persistent disk.

### 2.2 Integration Configuration Presence
- **Gemini AI:** `GEMINI_API_KEY` configured in production backend; local fallback heuristic mode supported.
- **Firebase Auth:** Firebase client keys in frontend (`NEXT_PUBLIC_FIREBASE_*`).
- **External Providers:** Weather, Traffic, Transit, Utility, and OSINT currently default to `demo` provider modules in `.env.example`.
- **Payment / Billing:** `STRIPE_SECRET_KEY` unconfigured (Stripe in mock/demo mode).
- **Physical Actuators / Hardware:** `SENTRA_MQTT_ENABLED=false` (Fails safe closed; simulation-only physical adapters).

---

## 3. Existing Test Suites & Quality Infrastructure

1. **Frontend Typecheck:** `npm run typecheck` (`tsc --noEmit`) — Passing (0 errors).
2. **Frontend Linter:** `npm run lint` (`eslint . --max-warnings=0`) — Passing (0 errors, 0 warnings).
3. **Frontend Production Build:** `npm run build` — Passing (163 routes static & dynamic).
4. **Backend Unit/Integration Tests:** `python -m pytest tests -q` — 75 passed (100%).
5. **Backend Code Quality:** `ruff check app tests` (passing), `mypy` (passing), `black --check` (passing after test file format).
6. **E2E Browser Automation:** Playwright headless suite with authenticated session automation (`scripts/verify-executive-release.mjs`).

---

## 4. Immediate Audit Scope

With the baseline confirmed and production verified reachable:
1. Discover and catalog every unique user-facing feature across the 163 Next.js routes and FastAPI routers.
2. Formulate the comprehensive Feature Inventory with stable IDs (`AUTH-*`, `DASH-*`, `INC-*`, `AI-*`, `PRED-*`, `OPS-*`, `FIELD-*`, `TWIN-*`, `SOC-*`, `ADMIN-*`, etc.).
3. Conduct data lineage audit, duplicate detection, and source-of-truth verification.
4. Execute tests for all features and generate evidence-backed results.
