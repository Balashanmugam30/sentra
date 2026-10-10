# Sentra — Security & Isolation Review

## 1. Simulation Isolation & Actuator Safeguards
* **Simulation Sandbox:** All five deterministic crisis demo scenarios (Chemical spill, Flash flood, Structural collapse, Cyber-physical fault, and Fire outbreak) execute strictly within in-memory state models.
* **Actuator Hardware Adapters:** Hardware adapters in `app/hardware/` and `services/iot/` remain in `UNCONFIGURED` mock state unless authentic hardware keys are supplied.
* **External Emergency Broadcasts:** Emergency broadcasts, SMS, and public alarms are air-gapped in demonstration and test modes. No irreversible real-world actions are triggered during scenario demonstrations.

---

## 2. Authentication & Session Boundaries
* **Session Integrity:** Protected routes under `/app`, `/operations`, `/twin`, `/cloud`, and `/security` require active authentication and RBAC permissions.
* **Session Expiration:** Idle sessions expire gracefully with a secure toast notification and automatic redirection to `/login`.
* **RBAC Enforcement:** Fine-grained permissions (`dashboard.view`, `incidents.view`, `operations.manage`, `analytics.view`, `system.admin`) prevent privilege escalation. Unauthorized accesses are intercepted by `PermissionGate` and `AccessModal`.
* **SSRF Protection:** Network security outbound validators (`app/core/security_network.py`) block private IP ranges, cloud metadata addresses (`169.254.169.254`), localhost, and loopback CIDRs. Verified by pytest `test_ssrf_filter_blocks_private_and_metadata_addresses`.

---

## 3. Ephemeral Persistence Reconciled Disclosures
* **Host Architecture:** Sentra backend runs on Render Web Service. The default free container filesystem is ephemeral.
* **Transactional Integrity:** SQLite WAL (Write-Ahead Logging) provides local transactional concurrency and consistency during container lifetime.
* **Disaster Recovery Notice:** In the absence of an external persistent managed database (e.g. AWS RDS or Supabase PostgreSQL) or off-host backup synchronization, container recreation will reset local SQLite state to initial seeds. Production pilot certification is subject to configuring an external PostgreSQL database.
