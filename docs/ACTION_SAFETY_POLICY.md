# 🛡️ Action Safety Policy & Autonomy Governance — Phase 6

## 1. Principles of Operational Safety
1. **Never AI as Sole Authorizer:** Large Language Models and AI agents propose tactical actions; they never serve as the final authorizing authority for physical or life-critical execution.
2. **Deny by Default:** Any unrecognized, untested, or unsupported action type defaults to `SafetyDecision.DENY`.
3. **Cryptographic Hash Binding:** Human approval is cryptographically tied to the SHA-256 hash of the exact proposal parameters. Any parameter mutation invalidates the approval.
4. **Two-Person Integrity:** Proposer identity (e.g., AI agent or Operator A) cannot authorize their own proposal for high-risk or critical actions.

---

## 2. Autonomy Operating Modes

| Autonomy Mode | Code | Policy & Behavior |
| :--- | :--- | :--- |
| **Mode 0: OBSERVE** | `MODE_0_OBSERVE` | Read-only telemetry, perception monitoring, and situational assessments. **Zero executions permitted.** |
| **Mode 1: RECOMMEND** | `MODE_1_RECOMMEND` | Generates tactical plans and action proposals. All dispatches require explicit verified human authorization. |
| **Mode 2: HUMAN-APPROVED** | `MODE_2_HUMAN_APPROVED` | **Canonical Production Default.** Operators inspect proposal parameters, verify proposal hash, and authorize via digital signature. |
| **Mode 3: BOUNDED AUTOMATION** | `MODE_3_BOUNDED_AUTOMATION` | Explicitly allowlisted, low-risk, reversible actions (`DIAGNOSTIC_PING`, `READ_STATUS`) auto-execute. All physical or critical actions **still require human approval**. |

---

## 3. Central Emergency Kill Switch
- **Scope:** Immediate global emergency stop halting all automated, bounded, and queued execution dispatches.
- **Triggering:** Available via one-click operator override or REST API (`POST /api/v1/operations/kill-switch`).
- **Attribution:** Mandatory attribution records the actor ID, UTC timestamp, and operational reason.
- **Reversibility:** Resetting the kill switch restores operations while preserving the complete incident audit trail.

---

## 4. Proposal Cryptographic Hash Verification
```python
def compute_proposal_hash(
    action_type: str,
    target_zone: str,
    parameters: Dict[str, Any],
    incident_id: str,
    tenant_id: str,
) -> str:
    # Deterministic canonical serialization
    payload_repr = {
        "action_type": action_type,
        "target_zone": target_zone,
        "parameters": sorted(parameters.items()),
        "incident_id": incident_id,
        "tenant_id": tenant_id,
    }
    return hashlib.sha256(json.dumps(payload_repr, sort_keys=True).encode("utf-8")).hexdigest()
```

When an operator approves an action, the server records `approval_hash = current_hash`. Immediately prior to adapter dispatch, the server re-computes the hash. If parameters were modified in flight, execution is rejected with `SafetyDecision.DENY`.
