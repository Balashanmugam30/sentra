# ⚙️ Sentra Operations Architecture — Phase 6

## 1. Executive Architecture Summary
Sentra Phase 6 establishes the **Autonomous Crisis Operations** framework. It bridges multi-modal intelligence (Phase 4) and calibrated risk predictions (Phase 5) into a closed-loop operational orchestration engine with deterministic safety gating, legal state machine enforcement, crisis playbooks, and uncertainty-aware digital twin simulation.

---

## 2. Operational Lifecycle State Machine
Every incident operational response progresses through strictly validated state transitions enforced server-side by `app.operations.state_machine.validate_transition()`:

```
[ OPEN ]
   │
   ▼
[ ASSESSING ]
   │
   ▼
[ PLAN_READY ]
   │
   ▼
[ AWAITING_APPROVAL ] ──(Rejected)──► [ REJECTED ]
   │                 ──(Expired)──►  [ EXPIRED ]
   ▼
[ APPROVED ]
   │
   ▼
[ EXECUTION_REQUESTED ]
   │
   ▼
[ EXECUTING ]
   ├──────────────────────┐
   ▼                      ▼
[ EXECUTED ]           [ FAILED ] (e.g. EXECUTION_OUTCOME_UNKNOWN)
   │                      │
   ▼                      ▼
[ VERIFYING ] ◄───────────┘
   │
   ▼
[ RESOLVED ]
```

### Invariants:
1. **Illegal Transitions Blocked:** Attempts to skip lifecycle phases (e.g. jumping directly from `OPEN` to `EXECUTING`) raise `IllegalStateTransitionError`.
2. **Terminal State Immutability:** Once an operation enters `RESOLVED`, `CANCELLED`, `REJECTED`, or `EXPIRED`, no further dispatch or mutation is permitted.
3. **Concurrency Locks:** Multi-threaded worker or operator interactions are guarded by `ConcurrencyLeaseManager` using bounded TTL leases.

---

## 3. Core Subsystems

| Module | Location | Core Responsibilities |
| :--- | :--- | :--- |
| **Domain Models** | `app/operations/domain.py` | Pydantic v2 schemas for Autonomy Modes, Proposals, Playbooks, Plans, and Receipts. |
| **State Machine** | `app/operations/state_machine.py` | Validated lifecycle transitions, concurrency lease manager. |
| **Safety Gate** | `app/operations/safety_gate.py` | Deterministic server-side policy evaluator, proposal hash checking, two-person integrity. |
| **Playbook Engine** | `app/operations/playbooks.py` | 5 canonical crisis SOPs, DFS cycle detection, DAG dependency validation. |
| **Execution Adapters** | `app/operations/adapters.py` | Typed adapters (Simulation, IoT, Notification, CAD), idempotency ledger, outcome reconciliation. |
| **Orchestrator** | `app/operations/orchestrator.py` | Incident Commander tactical assessment loop, SOP matching, proposal generation. |
| **Timeline Store** | `app/operations/timeline.py` | Append-only deduplicated chronological audit event logger. |
| **Crisis Simulator** | `app/operations/simulator.py` | Parametric what-if crisis modeling with strict simulation namespace isolation. |
| **Recovery Store** | `app/operations/store.py` | Persistent state repository with startup reconciliation recovering interrupted executions. |

---

## 4. Multi-Tenant Safety & Auditability
- **Tenant Scoping:** All plans, proposals, timelines, and execution receipts are bound to verified tenant identifiers (`TEN-BALA-UNI`).
- **RBAC Governance:** Every route requires verified operator permissions (`operations.manage`).
- **Forensic Ledger:** Every transition, policy decision, approval, and execution logs an immutable audit event to both `app.audit.engine` and `app.operations.timeline`.
