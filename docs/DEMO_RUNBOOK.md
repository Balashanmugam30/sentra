# SENTRA DEMO RUNBOOK & DETERMINISTIC CRISIS SCENARIOS

## 1. Overview & Demonstration Principles

The Sentra Deterministic Crisis Demonstration Suite provides repeatable, high-fidelity crisis scenarios designed for stakeholder presentations, operational drills, and safety gate audits.

### Core Guarantees:
- **Zero Live Actuation:** All demo executions enforce `is_simulation=True`. No physical relays, emergency sirens, or external emergency webhooks are triggered.
- **Cryptographic Merkle Chain Guard:** Every demo event is appended to the tamper-evident SQLite WAL timeline with SHA-256 parent hashing. Post-execution verification runs `persistence.verify_timeline_integrity()`.
- **Hardware Honesty:** Unconfigured or disconnected physical hardware reports `UNCONFIGURED` rather than simulated success.
- **Safety Gate Supremacy:** The AI orchestrator cannot bypass safety constraints. Unapproved or high-uncertainty proposals are blocked deterministically.

---

## 2. Canonical Scenario Catalog

### Scenario 1: Urban Conflagration & Rapid Evacuation (`fire_escalation`)
- **Category:** Thermal Escalation
- **Target Zones:** Zone 2, Zone 3
- **Context:** A rapid combustion surge occurs in Zone 2 with heavy particulate emission and thermal plume expansion threatening adjacent corridors.
- **Initial Telemetry:**
  - `thermal_temp_c`: 685.0°C
  - `pm25_ug_m3`: 448.0 µg/m³
  - `co_ppm`: 85.0 ppm
  - `wind_vector_kmh`: 28.5 km/h
  - `sensor_confidence`: 0.94
- **Safety Gate Decision:** `APPROVED_WITH_CONDITIONS`
- **Execution Outcome:** Tactical evacuation alert dispatched via simulated CAP notification adapter (`SIMULATED`). Suppression actuators require operator two-person rule approval.
- **Key Invariants Demonstrated:**
  - Plume expansion computation based on environmental vectors.
  - Automatic escalation from observation to response proposal.
  - Strict human-in-the-loop requirement for destructive physical interventions.

---

### Scenario 2: Multi-Sensor Conflict & Uncertainty Dampening (`sensor_disagreement`)
- **Category:** Telemetry Conflict
- **Target Zones:** Zone 1
- **Context:** An infrared thermal sensor reports an extreme anomaly (820°C) while adjacent optical obscuration and particulate sensors report baseline ambient conditions.
- **Initial Telemetry:**
  - `sensor_ir_temp_c`: 820.0°C
  - `sensor_optical_obscuration`: 0.02
  - `sensor_pm25`: 14.0 µg/m³
  - `divergence_ratio`: 4.8x
  - `sensor_confidence`: 0.41
- **Safety Gate Decision:** `BLOCKED_BY_POLICY`
- **Execution Outcome:** Automatic suppression dispatch is strictly blocked. System flags `Observation confidence below threshold (< 0.70)`.
- **Key Invariants Demonstrated:**
  - Multi-sensor cross-validation prevents false-positive actuator triggers (e.g. water deluge damaging non-fire electronics).
  - Explicit uncertainty boundary requiring manual operator field verification.

---

### Scenario 3: Telemetry Heartbeat Loss & Degraded Fallback (`sensor_outage`)
- **Category:** Sensor Outage
- **Target Zones:** Zone 4
- **Context:** Zone 4 environmental sensor cluster loses network heartbeat for 180 seconds during an active industrial alert.
- **Initial Telemetry:**
  - `last_heartbeat_age_sec`: 180s
  - `status`: `STALE_TELEMETRY`
  - `fallback_mode`: `CONSERVATIVE_HEURISTIC`
  - `confidence_penalty`: 0.50
  - `sensor_confidence`: 0.50
- **Safety Gate Decision:** `BLOCKED_BY_POLICY`
- **Execution Outcome:** System refuses to trigger automated actions on stale data. Activates conservative heuristic envelope while emitting an operational health alert.
- **Key Invariants Demonstrated:**
  - Staleness threshold enforcement (>120s = stale).
  - Graceful degradation without operational collapse or panic dispatches.

---

### Scenario 4: Tactical Action on Unconfigured Physical Adapter (`adapter_unconfigured`)
- **Category:** Hardware Honesty
- **Target Zones:** Zone 3
- **Context:** An operator authorizes localized water mist suppression in an area where physical BACnet hardware has not yet been connected to the Sentra IoT bus.
- **Initial Telemetry:**
  - `proposal_action`: `WATER_MIST_SUPPRESSION`
  - `hardware_transport`: `NONE_ATTACHED`
  - `sensor_confidence`: 0.91
- **Safety Gate Decision:** `APPROVED`
- **Execution Outcome:** Adapter registry honestly reports `receipt: { status: "UNCONFIGURED", reason: "No hardware transport configured for physical actuation" }`.
- **Key Invariants Demonstrated:**
  - Zero fabricated hardware actuation.
  - Transparent operational ledger: operators see exact hardware reality rather than simulated false positives.

---

### Scenario 5: Counterfactual Digital-Twin Simulation Sweep (`what_if_comparison`)
- **Category:** Digital Twin
- **Target Zones:** Zone 1, Zone 2, Zone 3
- **Context:** Incident commander tests hypothetical stress factors: ambient temperature increase (+25°C), 2 blocked stairwells, and 120-second dispatch latency.
- **Initial Telemetry:**
  - `ambient_temp_delta`: 25.0°C
  - `spread_rate_mult`: 2.2x
  - `blocked_routes`: `["Stairwell West", "Corridor B2"]`
  - `dispatch_delay_seconds`: 120s
- **Safety Gate Decision:** `SIMULATION_ONLY`
- **Execution Outcome:** Deterministic projection outputs:
  - Projected Duration: 45.0m × temperature factor × spread factor
  - Projected Containment Probability: 68% (down from 88% baseline)
  - Damage Index: 64.2 / 100
  - Projected Casualties: 0 (safe egress margin maintained)
  - Recommended Adjustments: Pre-stage auxiliary deluge; dynamic signage diversion.
- **Key Invariants Demonstrated:**
  - Sandboxed execution completely decoupled from live operational state.
  - Mathematical modeling informs decisions before committing live resources.

---

## 3. How to Execute Demonstrations

### Via the Web Command Center UI:
1. Log in to Sentra (`/login` or via authenticated session).
2. Navigate to **Operations Command Center** (`/app/operations`).
3. Click the **Deterministic Demo Suite** tab.
4. Review the 5 scenario cards.
5. Click **Execute Scenario** on any card.
6. Observe:
   - Live execution spinner
   - Instant Execution Report card with Run ID (`RUN-XXXX`)
   - Safety Gate Decision badge with color-coded status
   - Cryptographic `SHA-256 Chain: VALID` indicator
   - Hardware / Simulation receipts and emitted event count.

### Via REST API:
```bash
# 1. List available scenarios
curl -s -H "Authorization: Bearer <TOKEN>" https://sentra-li7c.onrender.com/api/v1/operations/demo/scenarios | jq .

# 2. Run Urban Conflagration Scenario
curl -s -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "fire_escalation"}' \
  https://sentra-li7c.onrender.com/api/v1/operations/demo/run | jq .

# 3. Verify Timeline Cryptographic Integrity
curl -s -H "Authorization: Bearer <TOKEN>" https://sentra-li7c.onrender.com/api/v1/operations/readiness | jq .
```
