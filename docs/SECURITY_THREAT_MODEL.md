# 🛡️ Sentra Security Threat Model & Asset Inventory — Phase 7
## Zero-Trust Architecture, Trust Boundaries, Threat Families & Risk Matrix

---

## 1. Executive Summary & Methodology
This threat model defines the security posture, asset boundaries, attack surfaces, and mitigation controls for **Sentra (AI Crisis Intelligence & Continuous Tactical Operations OS)** under Phase 7 (Security + Reliability + Enterprise Hardening).
The framework aligns with **OWASP Top 10 (2021)**, **OWASP API Security Top 10 (2023)**, **OWASP Top 10 for Large Language Models (2025)**, and **NIST SP 800-207 Zero Trust Architecture**.

---

## 2. Asset Inventory & Classification

| Asset ID | Asset Description | Sensitivity | Integrity Criticality | Confidentiality | Storage Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AST-01** | Signing Secrets & JWT Keys (`JWT_SECRET`, `SECRET_KEY`) | **CRITICAL** | High | Extreme | Host Environment / Secure KMS |
| **AST-02** | User Sessions & Refresh Tokens | **HIGH** | High | High | HttpOnly Cookie / In-Memory Auth Store |
| **AST-03** | Multi-Tenant Incident Telemetry & Evidence Graph | **HIGH** | High | High | SQLite WAL / PostgreSQL / Data Plane |
| **AST-04** | Tactical Action Proposals & Execution Payloads | **CRITICAL** | Extreme | High | Operations Durable Relational Store |
| **AST-05** | Cryptographic Approval Hashes (SHA-256) | **CRITICAL** | Extreme | High | Operations Durable Relational Store |
| **AST-06** | Continuous Forensic Timeline & Chained Audit Logs | **CRITICAL** | Extreme (Tamper-Evident) | Medium | Operations Timeline Store (`timeline_events`) |
| **AST-07** | Autonomy Operating Mode & Emergency Kill Switch | **CRITICAL** | Extreme | Medium | Durable Relational Store (`autonomy_state`) |
| **AST-08** | Cloud Credentials (`RENDER_API_KEY`, Vercel, Supabase) | **CRITICAL** | High | Extreme | Local User Environment / Host Secrets |
| **AST-09** | AI Model Ingestion & RAG SOP Knowledge Base | **MEDIUM** | High | Medium | Vector Index / Ingestion Pipeline |
| **AST-10** | External Actuator & Notification Adapters | **HIGH** | Extreme | High | Adapter Registry / Network Egress |

---

## 3. Trust Boundaries & Architecture Flow

```
[ UNTRUSTED PUBLIC INTERNET ]
            │ (TLS 1.3 / HTTPS)
            ▼
┌────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 1: Browser / Public Ingress            │
│  - Cloudflare / Vercel Edge Proxy                      │
│  - Strict CSP, HSTS, frame-ancestors 'none'            │
│  - Public endpoints: /health, /operations/liveness     │
└────────────────────────────────────┬───────────────────┘
                                     │ (Sanitized Requests / Cookie Auth)
                                     ▼
┌────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 2: Fast-API Application Gateway        │
│  - JWT Signature Validation (HS256)                    │
│  - Tenant Scoping Middleware (derive from session)     │
│  - Strict RBAC Guard (Permission checking)             │
│  - Rate Limiting & SSRF Validation                     │
└──────────────────┬───────────────────┬─────────────────┘
                   │                   │
        (Internal Service)   (Internal Service)
                   ▼                   ▼
┌──────────────────────────────┐  ┌───────────────────────────────────┐
│ TRUST BOUNDARY 3: State      │  │ TRUST BOUNDARY 4: AI & Adapters   │
│ - SQLite WAL (data/operations│  │ - Gemini 2.5 API (Outbound TLS)   │
│ - Chained Hash Timeline      │  │ - Physical IoT (Disabled/Unconf)  │
│ - Atomic compare-and-set     │  │ - Simulation (Isolated Namespace) │
│ - Distributed Idempotency    │  │ - Two-Person Approval Hash Gate   │
└──────────────────────────────┘  └───────────────────────────────────┘
```

---

## 4. Threat Families & Mitigations Matrix

| Threat ID | Threat Family | Potential Impact | Severity | Exploited Mechanism | Phase 7 Mandatory Mitigation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THR-01** | **BOLA / IDOR (Cross-Tenant Leakage)** | An operator from Tenant A accesses, approves, or executes crisis proposals of Tenant B. | **CRITICAL** | Parameter manipulation (`/proposals/{id}`) without tenant scoping. | **Enforced Session-Derived Tenant:** Query filters include `tenant_id = identity.tenant_id`. Proposal lookup fails with 404/403 on mismatch. |
| **THR-02** | **Action Replay Attack** | Malicious re-transmission of authorized high-risk actuator payload. | **HIGH** | Missing or process-local idempotency ledger. | **Durable Idempotency Ledger:** Persistent unique constraint on `idempotency_key`, payload hash validation, and cached outcome replay. |
| **THR-03** | **Parameter Tampering Post-Approval** | Operator approves benign parameters; payload mutated before execution. | **CRITICAL** | In-flight mutation of proposal fields. | **SHA-256 Hash Binding:** Approval records exact SHA-256 hash of payload. Re-evaluated immediately prior to adapter dispatch; mismatch halts execution. |
| **THR-04** | **Self-Approval Bypass (One-Person Rule)** | Compromised AI or rogue operator initiates and self-authorizes lethal or high-impact actions. | **CRITICAL** | Missing Two-Person Integrity enforcement. | **Two-Person Integrity:** Proposer (`proposer_id`) is strictly prohibited from approving own proposal for high/critical risks (`403 Forbidden`). |
| **THR-05** | **Zombie Execution After Crash** | Server crashes while action is `EXECUTING`; restarts into indeterminate state. | **HIGH** | In-flight state in process memory. | **Startup Recovery Manager:** On boot, scans in-flight proposals in durable store and reconciles them to `EXECUTION_OUTCOME_UNKNOWN`. |
| **THR-06** | **Silent Kill Switch Reset** | Server reboot resets kill switch to disengaged, allowing automation to resume. | **CRITICAL** | Process-local kill switch storage. | **Durable Relational Kill Switch:** Persisted in SQLite/Postgres. Boot preserves tripped state. Reset requires `operations.admin` role. |
| **THR-07** | **False Hardware Execution Receipts** | UI or audit claims physical actuation occurred when no physical controller was engaged. | **HIGH** | Synthetic PLC receipt generation. | **Hardware Honesty Rule:** Without validated hardware transport, return `UNCONFIGURED`. Never construct simulated success for physical hardware. |
| **THR-08** | **Server-Side Request Forgery (SSRF)** | Attacker submits camera snapshot URL targeting internal metadata (`169.254.169.254`) or localhost. | **HIGH** | Unvalidated external media fetch. | **Network Security Guard (`security_network.py`):** Blocks private IPv4/IPv6 CIDRs, validates scheme and host, resolves DNS before connection. |
| **THR-09** | **Audit Log Tampering** | Malicious actor modifies incident history to erase operational negligence or unauthorized commands. | **HIGH** | Mutable timeline records. | **Chained Tamper-Evident Hashing:** Each timeline event contains `prev_hash` and cryptographic hash of its payload. Any mutation breaks the chain. |
| **THR-10** | **Operational Telemetry Leakage** | Public `/operations/readiness` leaks kill switch state, mode, and playbook volume to unauthenticated scrapers. | **MEDIUM** | Missing authentication dependency on readiness route. | **Liveness vs Readiness Separation:** Minimal public `/operations/liveness` returns `{status: "ok"}`. Detailed readiness requires authenticated session. |
| **THR-11** | **Prompt Injection into Tactical SOPs** | Adversary injects adversarial text into incident description to manipulate AI recommendations. | **HIGH** | LLM output directly triggers action. | **Deterministic Action Safety Gate:** LLMs only propose; deterministic Python safety gates enforce rules. Human operator approval is mandatory. |
| **THR-12** | **Credential Exposure in Version Control** | Accidental commit of `RENDER_API_KEY` or JWT secrets to GitHub. | **CRITICAL** | Source code or git commit leakage. | **Local Host Credential Injection:** Credentials resolved via Windows registry or environment; zero secrets committed; `.gitignore` enforced. |

---

## 5. Security Verification Gates
1. **Automated Regression Suite (`tests/test_security_hardening.py`):** 40+ unit/integration security tests verifying cross-tenant isolation, hash verification, idempotency replay, SSRF rejection, and tamper detection.
2. **Deterministic Fail-Closed Policy:** If evidence confidence is missing, adapter is unconfigured, or kill switch is engaged, all actions fail closed (`SafetyDecision.DENY`).
3. **No Unverified Claims:** High-risk actions remain disabled until live physical integrations are demonstrably authenticated and operational.
