# 📖 Sentra Release Runbook & Operations Guide

> **Document Type:** Operator Runbook & Technical Procedures Guide  
> **Release Target:** Sentra v2.5.0 (Phase 9 Release)  
> **Target Audience:** DevOps Engineers, Site Reliability Engineers, Incident Commanders, Operations Leads  
> **Canonical Production URLs:**  
> - Frontend: `https://sentra-01.vercel.app/`  
> - Backend: `https://sentra-li7c.onrender.com/`  
> - Render Service ID: `srv-d7og1jreo5us73e6un70`  

---

## 1. System Architecture Quick Reference

Sentra operates as a distributed hybrid cloud system:
- **Client Tier:** Next.js 16 (App Router + React 19) hosted globally on Vercel Edge (`sentra-01.vercel.app`).
- **Backend API & Orchestration Core:** FastAPI Python 3.12 service running in a Linux container on Render (`sentra-li7c.onrender.com`).
- **Persistence Layer:** SQLite 3 with Write-Ahead Logging (`WAL`), ACID transactional safety, and cryptographic SHA-256 Merkle chain timeline logging.
- **Multimodal AI Core:** Google GenAI Python SDK (`gemini-2.5-flash` / `gemini-2.5-pro`) with deterministic rule-based degradation fallbacks.

---

## 2. Local Environment Setup & Execution

### 2.1 Backend Local Execution
Ensure Python 3.11+ is installed.
```powershell
# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
Copy-Item .env.example .env
# Set valid JWT_SECRET and SECRET_KEY (minimum 32 characters)

# 4. Start the FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be available at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/docs`.

### 2.2 Frontend Local Execution
Ensure Node.js 20+ and npm 10+ are installed.
```powershell
# 1. Install dependencies
npm install

# 2. Set environment variables
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"

# 3. Start development server with Turbopack
npm run dev
```
The frontend application will be accessible at `http://localhost:3000`.

---

## 3. Automated Verification Suites

Prior to any deployment or release certification, execute the full suite of verification checks:

### 3.1 Backend Test Suite (Pytest)
Runs all 69 unit, integration, and security tests across the test pyramid:
```powershell
python -m pytest tests -v
```
Expected output: `69 passed in ~25s`.

### 3.2 Code Quality & Static Analysis
```powershell
# Bytecode compilation verification
python -m compileall app tests

# Linting & code hygiene
python -m ruff check app tests

# Typecheck backend
python -m mypy app/core app/operations app/models
```

### 3.3 Frontend Verification (Typecheck, Lint, Build)
```powershell
# TypeScript typecheck
npm run typecheck

# Next.js ESLint
npm run lint

# Production compilation (Turbopack)
npm run build
```
Expected output: `✓ Generating static pages (163/163)` and zero compilation warnings.

---

## 4. Health, Liveness, and Readiness Diagnostics

Sentra employs strict separation between public liveness probes and secured deep readiness telemetry:

### 4.1 Public Liveness Probe
Used by cloud orchestrators (Render, Kubernetes) to verify basic HTTP process responsiveness:
```powershell
curl.exe -i -s https://sentra-li7c.onrender.com/operations/liveness
```
**Expected Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "service": "sentra-operations",
  "timestamp": "2026-10-09T14:27:26.419Z"
}
```

### 4.2 Protected Operational Readiness Probe
Provides deep forensic telemetry. Requires authenticated operator token with `operations.manage` or `system.admin` authority:
```powershell
curl.exe -i -s `
  -H "Authorization: Bearer <OPERATOR_JWT_TOKEN>" `
  https://sentra-li7c.onrender.com/operations/readiness
```
**Expected Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ready": true,
  "service": "sentra-operations",
  "autonomy_mode": "HUMAN_APPROVED",
  "kill_switch_active": false,
  "timeline_chain_valid": true,
  "storage": {
    "substrate": "sqlite3_wal",
    "storage_type": "ephemeral_container_disk",
    "is_ephemeral": true,
    "physical_actuators_permitted": false
  },
  "adapters": {
    "simulation": "CONNECTED",
    "notification": "CONNECTED",
    "iot_actuator": "UNCONFIGURED",
    "tactical_coordination": "UNCONFIGURED"
  }
}
```
*Note: Unauthenticated requests to `/operations/readiness` will strictly return HTTP 401 Unauthorized or HTTP 403 Forbidden.*

---

## 5. Operating the Deterministic Demo Scenarios

Sentra includes 5 deterministic crisis scenarios for evaluation, testing, and operator training:

### 5.1 Scenario Catalog
| Scenario ID | Name | Focus | Key Behavior |
| :--- | :--- | :--- | :--- |
| `fire_escalation` | Conflagration & Smoke Surge | Evacuation Routing | Rapid thermal expansion, dynamic path rerouting around smoke corridors. |
| `sensor_disagreement` | Multi-Sensor Divergence | Uncertainty Dampening | 820°C IR vs baseline optical triggers conflict edge; confidence dampened (<0.70); auto-dispatch blocked. |
| `sensor_outage` | Heartbeat Loss & Telemetry Aging | Degraded Fallback | Telemetry age exceeds 120s threshold; triggers conservative fallback and safety gate lock. |
| `adapter_unconfigured` | Unattached Industrial Actuator | Hardware Honesty | Operator authorizes HVAC override; returns honest `UNCONFIGURED` receipt with zero phantom actuation. |
| `what_if_comparison` | Sandboxed Digital-Twin Sweep | Predictive Simulation | Parameter stress test (+25°C, 2 routes blocked) calculating containment probability deltas. |

### 5.2 Running via Command Center UI
1. Navigate to `https://sentra-01.vercel.app/app`.
2. Select the **Deterministic Demo Suite** tab in the Command Center.
3. Select any scenario from the catalog.
4. Click **Run Scenario**.
5. Observe the live execution report card displaying the SHA-256 Merkle chain verification badge, simulation receipt tags, and safety gate policy enforcement.

### 5.3 Running via REST API
```powershell
curl.exe -X POST "https://sentra-li7c.onrender.com/operations/demo/run?scenario_id=fire_escalation" `
  -H "Authorization: Bearer <TOKEN>" `
  -H "Content-Type: application/json"
```

---

## 6. Autonomy Modes & Safety Governance

### 6.1 Autonomy Modes
Sentra supports 4 strictly governed autonomy modes:
1. `OBSERVE`: Passive telemetry ingestion, sensor fusion, and situational awareness display only.
2. `RECOMMEND`: Generates tactical action proposals and advisory playbooks; requires explicit human authorization.
3. `HUMAN_APPROVED`: Default operational mode. Actions require dual-operator authorization (Two-Person Integrity) prior to physical/logical dispatch.
4. `BOUNDED_AUTOMATION`: High-velocity tactical responses permitted for pre-approved low-risk mitigations (e.g., automated alert broadcasts) within strict safety bounds.

### 6.2 Emergency Kill Switch Protocol
- **Tripping the Kill Switch:** Any operational responder can immediately trip the kill switch via the UI banner or by calling `POST /operations/kill-switch/trip`. When tripped, all pending dispatches and in-flight actions are halted immediately with HTTP 403 Forbidden.
- **Resetting the Kill Switch:** Due to privileged separation of duties, the kill switch **cannot** be reset by general operators. Only users possessing `admin`, `super_admin`, or `system.admin` authority can execute `POST /operations/kill-switch/reset`.

---

## 7. Incident Escalation & Response Matrix

| Severity Level | Response Time Objective | Authorized Roles | Automated Actions |
| :--- | :--- | :--- | :--- |
| **Low / Advisory** | < 15 minutes | Operator, Analyst | Incident timeline logging, trend analysis |
| **Moderate / Warning** | < 5 minutes | Safety Officer, Commander | Tactical playbook recommendation, stakeholder notification proposal |
| **Critical / Emergency** | < 60 seconds | Incident Commander, System Admin | Dynamic evacuation routing proposal, emergency responder paging, zone isolation recommendation |
