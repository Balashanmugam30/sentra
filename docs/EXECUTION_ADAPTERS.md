# 🔌 Execution Adapters & Hardware Honesty — Phase 6

## 1. Overview & Architectural Role
In Sentra Phase 6 (Autonomous Crisis Operations), execution adapters translate authorized tactical proposals into downstream physical, simulated, or notification actions. 

Crucially, Sentra operates under strict **Hardware Honesty Principles**:
- No fake dispatch claims.
- If physical actuators or third-party integrations are not configured or live, the adapter must explicitly return `UNCONFIGURED` and state `NO REAL DISPATCH ADAPTER CONFIGURED`.
- All execution requests are routed through the `IdempotencyLedger` to prevent double-fires, duplicate network packets, and replay attacks.

---

## 2. Adapter Catalog

| Adapter Name | Type | Target Actions | Operational Policy & Hardware Honesty |
| :--- | :--- | :--- | :--- |
| **SimulationAdapter** | Virtual | All simulation actions, digital twin dry-runs | Executes in isolated virtual sandbox; returns synthetic execution metrics with explicit simulated flag. |
| **IoTActuatorAdapter** | Physical / Hardware | HVAC dampening, gas isolation, fire suppression, siren triggers | **Hardware Honesty Rule:** When physical hardware credentials or device drivers are not mounted, returns status `UNCONFIGURED` with log `"NO REAL DISPATCH ADAPTER CONFIGURED"`. Never simulates success for physical hardware. |
| **EmergencyNotificationAdapter** | Dispatch / Comms | SMS broadcast, CAP alert, public address, responder paging | Formats standard Common Alerting Protocol (CAP) or emergency SMS payloads. Logs dispatch receipt with verifiable timestamp. |
| **TacticalCoordinationAdapter** | Operations / Human | Responder tasking, perimeter barricade dispatch, staging area setup | Generates structured tactical task cards for incident commanders and field teams. |

---

## 3. Idempotency Ledger & Concurrency Control

Every execution request carries an `idempotency_key` generated from the proposal hash and execution sequence:

```python
class IdempotencyLedger:
    """Thread-safe ledger preventing duplicate action dispatches."""
    def __init__(self):
        self._executed_keys: Set[str] = set()
        self._lock = threading.Lock()

    def check_and_reserve(self, key: str) -> bool:
        with self._lock:
            if key in self._executed_keys:
                return False  # Duplicate attempt rejected
            self._executed_keys.add(key)
            return True
```

### Safety Guarantees:
1. **At-Most-Once Physical Actuation:** Physical IoT actions will never fire twice due to network retries.
2. **Replay Rejection:** Cached or stale execution packets are rejected immediately by the safety gate.
3. **Audit Immutability:** All entries in the idempotency ledger are mirrored to the `TimelineStore`.

---

## 4. Execution Lifecycle & Outcome Reconciliation

```
[PLAN_READY] 
      │ (Operator Approval)
      ▼
[APPROVED] 
      │ (Dispatch Requested)
      ▼
[EXECUTION_REQUESTED]
      │ (Adapter Execution)
      ▼
[EXECUTING]
      ├── Success ──────────────────────────► [EXECUTED] ──► [VERIFYING] ──► [RESOLVED]
      ├── Hardware Unconfigured ────────────► [FAILED / UNCONFIGURED]
      ├── Explicit Adapter Rejection ───────► [FAILED]
      └── Timeout / Unknown Result ─────────► [EXECUTION_OUTCOME_UNKNOWN] (Manual Reconciliation)
```

### Handling Uncertain Outcomes (`EXECUTION_OUTCOME_UNKNOWN`)
If an external actuator or third-party dispatch system drops connection during execution, Sentra does NOT assume success or failure:
- Proposal state moves to `EXECUTION_OUTCOME_UNKNOWN`.
- Incident commander is alerted with an urgent telemetry reconciliation prompt.
- `OperationsStore` holds execution lease until telemetry verifies physical state or an operator manually reconciles the outcome.

---

## 5. Startup Recovery & Orphan Reconciliation
Upon backend boot or process restart, `OperationsStore` scans all in-flight proposals:
- Proposals stuck in `EXECUTING` or `EXECUTION_REQUESTED` prior to boot are marked with `reconciled_on_boot = True`.
- Their status transitions safely to `EXECUTION_OUTCOME_UNKNOWN` or `FAILED`, preventing silent zombie executions from lingering in production.
