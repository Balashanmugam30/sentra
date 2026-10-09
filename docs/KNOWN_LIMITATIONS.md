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

### 2.1 Ephemeral Container Disk Substrate
- **Current Behavior:** The production backend on Render Free tier runs on an ephemeral container filesystem (`storage_type: "ephemeral_container_disk"`).
- **Impact:** While SQLite Write-Ahead Logging (`WAL`) provides ACID guarantees during runtime, container restarts, redeployments, or sleep cycles reset local disk storage unless backed by persistent volumes.
- **Remediation for Tier C:** Production deployment with real hardware actuation mandates migration to a managed external PostgreSQL instance (e.g., AWS RDS, Supabase Enterprise, or Render Managed PostgreSQL) with automated point-in-time recovery.

### 2.2 Off-Host Backup Synchronization
- **Current Behavior:** Online SQLite snapshot generation and cryptographic checksumming are fully operational, but automated replication to off-host cloud object storage (Amazon S3 / Google Cloud Storage) is unconfigured by default (`off_host_synced: False`).
- **Impact:** Backups are stored on the local container disk.
- **Remediation for Tier C:** Provision S3 bucket credentials and set `SENTRA_BACKUP_S3_BUCKET` in the cloud environment.

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

### 4.1 Dependency on External Gemini API Key
- **Current Behavior:** Deep multimodal perception (FLIR thermal analysis, camera frame interpretation) and natural-language SOP retrieval utilize Google Gemini 2.5 Flash / Pro via the official `google-genai` SDK.
- **Fallback Behavior:** If `GEMINI_API_KEY` is omitted, invalid, or experiences network timeouts, Sentra immediately falls back to deterministic rule-based algorithms (`RULE_BASED_FALLBACK`). The application never crashes with unhandled 500 exceptions, but multimodal deep analysis is substituted with statistical threshold alerts.

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
| **Storage Persistence** | Ephemeral Container Disk | None (Sandboxed) | Acceptable for pilot | 🛑 Blocking |
| **Physical Actuation** | Fail-closed `UNCONFIGURED` | None (Simulated) | Acceptable for pilot | 🛑 Blocking |
| **Off-Host Backups** | `off_host_synced: False` | None | Acceptable for pilot | 🛑 Blocking |
| **Cloud Cold Start** | 45s idle spin-up | Minor demo delay | Minor pilot delay | 🛑 Blocking |
| **Multi-Region** | Single-Region (Oregon) | None | Minor latency | Acceptable |
