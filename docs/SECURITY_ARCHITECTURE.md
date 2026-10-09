# SENTRA — ENTERPRISE ZERO-TRUST SECURITY ARCHITECTURE
## Continuous Tactical Operations, Cryptographic Governance & Hardware Honesty

---

## 1. Security Philosophy & Principles

Sentra operates in life-critical environments (fire suppression, facility evacuations, chemical hazard lockdowns, emergency responder dispatch). A single malicious command, compromised credential, or AI hallucination could cause catastrophic physical harm.

Sentra adheres to five non-negotiable security principles:
1. **Never Trust, Always Verify:** Every internal and external request must authenticate, authorize, and undergo deterministic safety gate validation.
2. **Deterministic Precedence over Probabilistic Output:** AI agents and LLMs can propose actions, but CANNOT execute them without passing through deterministic code-enforced guardrails.
3. **Hardware Honesty:** The system never fabricates success receipts for unattached actuators. If an industrial controller is disconnected, it declares `UNCONFIGURED` and refuses execution.
4. **Two-Person Integrity:** A proposer can never approve their own action proposal. High-consequence decisions require independent verification.
5. **Cryptographic Tamper-Evidence:** All forensic events form an unbroken SHA-256 hash chain, providing verifiable audit trails resistant to retroactive manipulation.

---

## 2. Authentication & Tenancy Model

### 2.1 Identity Tokens & Cryptographic Verification
- **Token Format:** Signed JWT with strict expiration (`exp`), subject (`sub`), tenant (`tenant_id`), role (`role`), and session ID (`sid`).
- **Signature Algorithm:** HMAC-SHA256 / Ed25519 with strong secret entropy enforcement.
- **Revocation:** Centralized session store tracks active session tokens and permits instant revocation.

### 2.2 Role-Based Access Control (RBAC) Matrix
| Role | Autonomy Level | Key Permissions | Permitted Actions |
| :--- | :--- | :--- | :--- |
| `super_admin` | Global System | All permissions (`system.admin`) | Global governance, kill-switch reset, tenant config |
| `admin` | Organization Admin | `operations.manage`, `users.manage`, `system.admin` | Kill-switch reset, user management, audit review |
| `security_manager` | High Tactical | `operations.manage`, `governance.approve` | Action proposal approval, sensor overrides |
| `operations_commander`| Tactical Execution | `operations.manage`, `incidents.manage` | Plan orchestration, proposal approval, dispatch |
| `responder` | Field Response | `field.respond`, `tasks.update` | Incident check-in, field telemetry submission |
| `analyst` | Read & Simulate | `dashboard.view`, `analytics.view` | What-if simulation runs, predictive model inspection |
| `guest_viewer` | Read Only | `dashboard.view` | Read-only situational awareness display |

---

## 3. Action Safety Gate & Deterministic Autonomy

### 3.1 Four Autonomy Operating Modes
```
  [ MODE 0: Observe ] ────────── Read-only monitoring; all autonomous dispatches blocked.
          │
  [ MODE 1: Recommend ] ──────── AI recommends tactical plans; operator approval required.
          │
  [ MODE 2: Human-Approved ] ──── Proposals staged; verified cryptographic approval required.
          │
  [ MODE 3: Bounded Automation ]─ Pre-authorized low-risk actions auto-dispatch; critical actions gated.
```

### 3.2 Gate Evaluation Pipeline
```
                    [ Incoming Action Proposal ]
                                 │
                                 ▼
                     Is Kill Switch Engaged? ────────────► [ DENY: Kill Switch Active ]
                                 │ NO
                                 ▼
                    Mode == MODE_0_OBSERVE?  ────────────► [ DENY: Read-Only Mode ]
                                 │ NO
                                 ▼
                    Is Target Adapter Configured? ───────► [ DENY: Adapter Unconfigured ]
                                 │ YES
                                 ▼
                    Evidence Confidence >= Threshold? ──► [ REQUIRE_ADDITIONAL_EVIDENCE ]
                                 │ YES
                                 ▼
                    Is Action Reversible / Low-Risk?
                        ├── Mode 3 & Low-Risk ───────────► [ ALLOW_BOUNDED_EXECUTION ]
                        └── High/Critical Risk ──────────► [ REQUIRE_HUMAN_APPROVAL ]
```

### 3.3 Two-Person Integrity
- For every action proposal requiring approval:
  $$\text{Proposer ID} \neq \text{Approver ID}$$
- Prevents rogue agents or compromised operator credentials from self-authorizing destructive actions.

### 3.4 Cryptographic Proposal Hash
Before an operator approves an action, the server computes a deterministic SHA-256 digest:
$$\text{Hash} = \text{SHA-256}(\text{ActionType} \parallel \text{TargetZone} \parallel \text{SortedParameters} \parallel \text{IncidentID} \parallel \text{TenantID})$$
This hash is recorded in `proposal.approval_hash`. Upon execution dispatch, the hash is re-computed. Any parameter tampering or payload modification aborts execution immediately.

---

## 4. Hardware Honesty & Actuator Safety

### 4.1 Anti-Deception Guarantee
Legacy systems often mock external hardware responses to appear operational. Sentra strictly forbids synthetic success receipts:
- `IoTActuatorAdapter`: When physical industrial automation controllers (BACnet/IP, Modbus, OPC-UA) are absent:
  - Returns `outcome = AdapterOutcome.UNCONFIGURED`
  - Sets `actuation_permitted = False`
  - Explicit message: `"NO REAL DISPATCH ADAPTER CONFIGURED"`
- No fake command codes or synthetic PLC acknowledgments are generated.

---

## 5. Network Security & SSRF Protection

### 5.1 Outbound Webhook Verification (`app.core.security_network`)
All outbound webhook dispatches (emergency paging, CAP feeds, third-party integrations) pass through strict network security filters:
- **Private IP Blocking:** Denies all requests to RFC 1918 and loopback ranges:
  - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`
  - IPv6 loopback (`::1`) and Unique Local (`fc00::/7`).
- **Cloud Metadata Protection:** Explicitly denies `169.254.169.254` (AWS/GCP/Azure instance metadata services).
- **DNS Rebinding Prevention:** Resolves hostnames to IP addresses prior to TCP connection and checks resolved IPs against the restricted CIDR matrix.

---

## 6. Tamper-Evident Forensic Timeline

### 6.1 Cryptographic SHA-256 Hash Chaining
Every operational event is committed with a cryptographic hash linked to the predecessor:
$$H_0 = \text{"0"}^{64} \quad (\text{Genesis Hash})$$
$$H_n = \text{SHA-256}(H_{n-1} \parallel \text{event\_id} \parallel \text{tenant\_id} \parallel \text{incident\_id} \parallel \text{timestamp} \parallel \text{event\_type} \parallel \text{summary} \parallel \text{details\_json})$$

### 6.2 Audit Verification Endpoint
The `/api/v1/operations/timeline/verify` endpoint traverses the entire chain from Genesis forward. If any row, timestamp, or payload was tampered with, the audit detects the exact corrupted row index and flags `tamper_detected: true`.
