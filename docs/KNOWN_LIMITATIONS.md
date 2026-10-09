# ⚠️ Sentra Known Limitations & Architectural Disclosures

> **Document Type:** Known Limitations, Production Boundaries & Honest Disclosures  
> **Release Target:** Sentra v2.5.0 (Phase 9 Release)  
> **Target Audience:** Enterprise Evaluators, Solutions Architects, Security Officers, Compliance Auditors  
> **Canonical Production URLs:**  
> - Frontend: `https://sentra-01.vercel.app/`  
> - Backend: `https://sentra-li7c.onrender.com/`  
> - Render Service ID: `srv-d7og1jreo5us73e6un70`  

---

## 1. Overview & Principle of Honest Disclosure

Sentra adheres to a strict principle of **zero fabricated capabilities and transparent operational boundaries**. In high-stakes mission-critical operations, false certainty and phantom actuation represent severe life-safety hazards.

This document enumerates all known architectural constraints, infrastructure limits, and hardware dependencies in the current release.

---

## 2. Infrastructure & Persistence Limitations

### 2.1 Ephemeral Container Disk Substrate & RPO Reality
- **Current Behavior:** The production backend on Render Free tier runs on an ephemeral container filesystem (`storage_type: "ephemeral_container_disk"`).
- **Impact on Persistence & RPO:**
  - While SQLite Write-Ahead Logging (`WAL`) provides ACID transaction integrity locally during process execution, container restarts, redeployments, or sleep evictions wipe the local container disk.
  - **Recovery Point Objective (RPO) Reality:** RPO < 5 minutes applies **strictly within a single running container instance** (recovering from an in-process worker crash). Across container replacement, redeployment, or host destruction, **RPO is unbounded (total data loss)** because local files are destroyed.
- **Impact on Pilots:** Ephemeral/training pilots are supported, but **durable state-preserving pilots are blocked** until an external database is attached.
- **Remediation:** Production deployment with persistent state mandates migration to a managed external PostgreSQL instance (e.g., AWS RDS, Supabase Enterprise, or Render Managed PostgreSQL) with automated point-in-time recovery.

### 2.2 Off-Host Backup Synchronization
- **Current Behavior:** Online SQLite snapshot generation and cryptographic checksumming are fully operational, but automated replication to off-host cloud object storage (Amazon S3 / Google Cloud Storage) is unconfigured by default (`off_host_synced: False`).
- **Impact:** Backups reside exclusively on the ephemeral container disk and are destroyed if the container is recreated.
- **Remediation:** Provision an S3 bucket and credentials (`SENTRA_BACKUP_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) in the host environment.

### 2.3 Render Free Tier Sleep & Cold Starts
- **Current Behavior:** On the free hosting plan, the Render container spins down after 15 minutes of inactivity.
- **Impact:** First incoming request after idle incurs an initial spin-up cold start latency of 40–55 seconds. Once awake, response times drop to sub-30ms.
- **Remediation:** Upgrade the Render service to a persistent `Starter` or `Standard` instance plan ($7/mo) to eliminate spin-down sleep behavior.

---

## 3. Physical Actuation & Edge Hardware Boundaries

### 3.1 Unattached Physical Industrial Actuators
- **Current Behavior:** The `IoTActuatorAdapter` and `TacticalCoordinationAdapter` report `status: "UNCONFIGURED"` with `actuation_permitted: False`.
- **Honest Design:** Sentra refuses to simulate fake success receipts or pretend that physical valves, fire dampers, or access gates were actuated when hardware interfaces are absent.
- **Remediation for Tier C:** Deploy certified edge gateways running authenticated BACnet/IP, Modbus TCP, or MQTT industrial protocols with mutual TLS client certificates.

### 3.2 Proprietary CAD & E911 Integration Interfaces
- **Current Behavior:** Tactical coordination outputs formatted JSON dispatches and standardized incident summaries. Direct dispatch into proprietary Public Safety Answering Point (PSAP) systems (e.g., Motorola Solutions PremierOne, Hexagon OnCall CAD) is disabled.
- **Remediation:** Enterprise deployments require site-specific middleware connectors and agency-approved CAD API credentials.

---

## 4. AI & Inference Boundaries

### 4.1 Dependency on External Gemini API Key & Verified Fallback
- **Architecture:** The codebase natively integrates Google Gemini 2.5 Flash / Pro via the official `google-genai` Python SDK v2.29.0.
- **Verified Live State:** In the production cloud environment, `GEMINI_API_KEY` is currently **unconfigured**.
- **Verified Fallback Behavior:** As verified live via `POST /ai/intelligence/assess`, Sentra gracefully degrades to deterministic rule-based algorithms (`inference_source: "RULE_BASED_FALLBACK"`, `is_degraded: True`). The application maintains 100% uptime with zero 500 errors, but deep multimodal perception is replaced by calibrated heuristic thresholds until an API key is provided.

### 4.2 Hallucination Prevention & Evidentiary Bounds
- **Current Behavior:** AI recommendations cannot execute autonomously without passing through the Topological Evidence Graph DAG and the Two-Person Integrity safety gate.
- **Constraint:** AI cannot invent sensor evidence or fabricate confidence scores. In the presence of sensor disagreement (e.g., thermal spike without smoke corroboration), model confidence is mathematically dampened below the 0.70 threshold.

---

## 5. Network & Regional Topography

### 5.1 Single-Region Deployment
- **Current Topology:** The Render backend is deployed in the Oregon (US-West) region. The Vercel frontend is distributed globally across Edge points of presence.
- **Impact:** API requests from European or Asian operational centers incur trans-Pacific network latency (~120–180ms round-trip).
- **Remediation:** Deploy multi-region active-active backend clusters behind Cloudflare or AWS Global Accelerator for global enterprise deployments.

---

## 6. Summary Matrix of Limitations & Release Impact

| Limitation Area | Current State | Impact on Tier A (Demo) | Impact on Tier B (Pilot) | Impact on Tier C (Physical) |
| :--- | :--- | :---: | :---: | :---: |
| **Storage Persistence** | Ephemeral Container Disk | ✅ Supported (Sandboxed) | ⚠️ Pass for Ephemeral;<br>🛑 **Blocked for Durable** | 🛑 Blocking |
| **Off-Host Backups** | `off_host_synced: False` | ✅ Supported | ⚠️ Pass for Ephemeral;<br>🛑 **Blocked for Durable** | 🛑 Blocking |
| **Live AI Provider** | Rule-Based Fallback Active | ✅ Supported (Deterministic) | ✅ Supported (Heuristics) | 🛑 Blocking (Requires Key) |
| **Physical Actuation** | Fail-closed `UNCONFIGURED` | ✅ Supported (Simulated) | ✅ Supported (Simulated) | 🛑 Blocking (Requires Gateways) |
| **Cloud Cold Start** | 45s idle spin-up | Minor demo delay | Acceptable for pilot | 🛑 Blocking (Requires Paid Tier) |
| **Multi-Region** | Single-Region (Oregon) | None | Minor latency | Acceptable |
