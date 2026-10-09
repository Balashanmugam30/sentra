# SENTRA — MULTI-TENANT ISOLATION ARCHITECTURE
## Zero-Trust Tenant Scoping, BOLA Prevention & Data Plane Partitioning

---

## 1. Executive Summary

In mission-critical crisis operations, multi-tenant isolation is a zero-tolerance security requirement. A security breach, sensor misconfiguration, or malicious actor in Tenant A must never allow visibility, command execution, or operational disruption in Tenant B.

Sentra achieves complete tenant isolation through defense-in-depth:
1. **Cryptographic Authentication:** Identity tokens encode immutable `tenant_id` claims verified at the API gateway.
2. **Deterministic Context Injection:** Tenancy middleware resolves and binds the tenant context to each asynchronous request context.
3. **Relational Storage Isolation:** Every table in the durable operations persistence layer includes `tenant_id` columns with indexed foreign constraints.
4. **Endpoint Authorization Gates:** All proposal lookups, approvals, rejections, timeline queries, and adapter dispatches enforce strict tenant equality checks, blocking Broken Object-Level Authorization (BOLA / IDOR) with HTTP 403.

---

## 2. Multi-Tenant Schema & Storage Architecture

### 2.1 Database Tables & Tenant Keys
All operational tables in `data/operations/operations.db` enforce mandatory tenant scoping:

```sql
-- Operational plans scoped by tenant
CREATE TABLE IF NOT EXISTS operations_plans (
    plan_id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    ...
);
CREATE INDEX idx_plans_tenant ON operations_plans(tenant_id);

-- Action proposals scoped by tenant
CREATE TABLE IF NOT EXISTS operations_proposals (
    id TEXT PRIMARY KEY,
    plan_id TEXT,
    incident_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    ...
);
CREATE INDEX idx_proposals_tenant ON operations_proposals(tenant_id);

-- Idempotency ledger scoped by tenant & key
CREATE TABLE IF NOT EXISTS operations_idempotency_ledger (
    idempotency_key TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    proposal_id TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    ...
);
CREATE INDEX idx_idempotency_tenant ON operations_idempotency_ledger(tenant_id);

-- Tamper-evident forensic timeline scoped by tenant
CREATE TABLE IF NOT EXISTS operations_timeline_events (
    event_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    incident_id TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    event_hash TEXT NOT NULL,
    ...
);
CREATE INDEX idx_timeline_tenant ON operations_timeline_events(tenant_id);
```

---

## 3. Request Lifecycle & Authorization Enforcement

```
[ Inbound HTTP Request ]
         │
         ▼
[ JWT Authentication & RBAC Guard ]
  - Decodes verified JWT access token
  - Extracts immutable `tenant_id = identity["tenant_id"]`
  - Validates role permissions (`operations.manage`)
         │
         ▼
[ Operations Router / Domain Logic ]
  - Queries filtered by `tenant_id`:
    `store.list_proposals(tenant_id=caller_tenant)`
  - Direct object access validated:
    `if proposal.tenant_id != caller_tenant: raise HTTPException(403)`
         │
         ▼
[ Durable Persistence Layer ]
  - SQL query binds `WHERE tenant_id = ?` parameter
  - Complete isolation guaranteed at disk level
```

---

## 4. BOLA (Broken Object Level Authorization) Prevention Matrix

| Endpoint | Operation | Access Control Rule | Cross-Tenant Outcome |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/operations/proposals` | List Proposals | Automatically scoped to caller's `tenant_id`. | Other tenant's proposals omitted. |
| `GET /api/v1/operations/proposals/{id}` | Inspect Proposal | `proposal.tenant_id == caller.tenant_id` | `HTTP 403 Forbidden` |
| `POST /api/v1/operations/proposals/{id}/approve` | Operator Approval | `proposal.tenant_id == caller.tenant_id` | `HTTP 403 Forbidden` |
| `POST /api/v1/operations/proposals/{id}/reject` | Operator Rejection | `proposal.tenant_id == caller.tenant_id` | `HTTP 403 Forbidden` |
| `POST /api/v1/operations/proposals/{id}/execute` | Adapter Dispatch | `proposal.tenant_id == caller.tenant_id` | `HTTP 403 Forbidden` |
| `GET /api/v1/operations/incidents/{id}/plan` | Tactical Plan | `plan.tenant_id == caller.tenant_id` | `HTTP 403 Forbidden` |
| `GET /api/v1/operations/timeline` | Audit Timeline | Scoped to caller's `tenant_id`. | Tenant B events omitted. |

---

## 5. Verification & Test Guarantees

Comprehensive automated test coverage in `tests/test_security_hardening.py` verifies:
1. **Isolated Listings:** User in Tenant A cannot see proposals created in Tenant B.
2. **Cross-Tenant View Denial:** Direct GET requests for Tenant B proposals with Tenant A tokens return `HTTP 403`.
3. **Cross-Tenant Approval Denial:** Proposer or commander in Tenant A cannot approve action proposals belonging to Tenant B (`HTTP 403`).
4. **Cross-Tenant Execution Denial:** Dispatch attempts across tenant boundaries are rejected before adapter dispatch (`HTTP 403`).
5. **Timeline Separation:** Timeline audit queries only yield records belonging to the authenticated tenant.
