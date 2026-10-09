# 📋 Crisis Playbook Engine & DAG Validation — Phase 6

## 1. Playbook Specification
Crisis Playbooks in Sentra represent versioned, deterministic Standard Operating Procedures (SOPs) structured as Directed Acyclic Graphs (DAGs). Each step explicitly declares prerequisites, timeouts, required operator roles, and reversibility.

---

## 2. DAG Structural Validation
Before activation or execution, every playbook undergoes rigorous graph validation implemented in `app.operations.playbooks.validate_playbook_dag()`:
1. **Uniqueness:** All step IDs within a playbook must be unique.
2. **Prerequisite Resolution:** Every prerequisite step ID must exist within the playbook.
3. **Self-Reference Prohibition:** A step cannot list itself as a prerequisite.
4. **Cycle Detection:** Depth-First Search (DFS) with a recursion call stack validates that the step dependency graph contains **zero cycles**.

---

## 3. Canonical Playbook Catalog

### 1. `PB-FIRE-01`: Structural Fire & Rapid Containment SOP
- **Standard:** NFPA 1600 / ISO 22320
- **Threshold:** Severity 3+
- **Steps:**
  1. `step-fire-01`: HVAC Smoke Damper & Zone Air Isolation (`HVAC_ISOLATION`, HIGH risk)
  2. `step-fire-02`: Broadcast Evacuation Directive (`EVACUATION_ALERT`, CRITICAL risk, prereq: step-fire-01)
  3. `step-fire-03`: Egress Access Control Release (`LOCKDOWN_ACCESS`, HIGH risk, prereq: step-fire-01)
  4. `step-fire-04`: Pre-Arm Sprinkler Valves (`SUPPRESSION_TRIGGER`, CRITICAL risk, prereq: step-fire-02)
  5. `step-fire-05`: Mutual Aid CAD Telemetry Packet (`MUTUAL_AID_REQUEST`, HIGH risk, prereq: step-fire-04)

### 2. `PB-GAS-02`: Hazardous Airborne Contaminant & Gas Leak Isolation
- **Standard:** OSHA 1910.120 / NFPA 472
- **Threshold:** Severity 3+
- **Steps:**
  1. `step-gas-01`: Airlock Corridor Hermetic Seal (`LOCKDOWN_ACCESS`, HIGH risk)
  2. `step-gas-02`: Scrubber Negative Pressure Exhaust (`HVAC_ISOLATION`, HIGH risk, prereq: step-gas-01)
  3. `step-gas-03`: Sector Hazmat Evacuation Directive (`EVACUATION_ALERT`, CRITICAL risk, prereq: step-gas-01)
  4. `step-gas-04`: Medical Triage Staging Ping (`NOTIFICATION_BROADCAST`, MEDIUM risk, prereq: step-gas-03)

### 3. `PB-CROWD-03`: Overcrowding & Chokepoint Evacuation Deconfliction
- **Standard:** ISO 22320
- **Threshold:** Severity 2+
- **Steps:**
  1. `step-crowd-01`: Auxiliary Egress Door Release (`LOCKDOWN_ACCESS`, MEDIUM risk)
  2. `step-crowd-02`: Dynamic Flow Guidance Broadcast (`NOTIFICATION_BROADCAST`, MEDIUM risk, prereq: step-crowd-01)
  3. `step-crowd-03`: Drone Chokepoint Surveillance Dispatch (`DRONE_DISPATCH`, HIGH risk, prereq: step-crowd-01)

### 4. `PB-CONFLICT-04`: Conflicting Multimodal Sensor Resolution
- **Standard:** NIST SP 800-160 / IEEE 1451
- **Threshold:** Severity 2+
- **Steps:**
  1. `step-conflict-01`: Diagnostic Ping Cluster (`DIAGNOSTIC_PING`, LOW risk, auto-executable in Mode 3)
  2. `step-conflict-02`: Deploy Inspection Drone (`DRONE_DISPATCH`, MEDIUM risk, prereq: step-conflict-01)
  3. `step-conflict-03`: Recalibrate Biased Nodes (`SENSOR_RECALIBRATION`, MEDIUM risk, prereq: step-conflict-02)

### 5. `PB-OUTAGE-05`: Telemetry Sensor-Network Blackout & Fallback
- **Standard:** CISA Incident Response Guidelines
- **Threshold:** Severity 3+
- **Steps:**
  1. `step-outage-01`: Poll Mesh Gateway Failover (`READ_STATUS`, LOW risk, auto-executable in Mode 3)
  2. `step-outage-02`: Physical Warden Patrol Sweep (`DRONE_DISPATCH`, MEDIUM risk, prereq: step-outage-01)
  3. `step-outage-03`: Broadcast Fallback Operating Posture (`NOTIFICATION_BROADCAST`, MEDIUM risk, prereq: step-outage-02)
