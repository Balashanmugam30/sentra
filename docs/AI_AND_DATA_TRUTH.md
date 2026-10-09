# SENTRA AI, PREDICTION & DATA TRUTH DISCLOSURE

## 1. Executive Summary & Epistemic Honesty

In life-safety crisis operations, artificial intelligence must never hallucinate, over-claim confidence, or obscure uncertainty. Sentra adheres to strict epistemic honesty: every insight, prediction, and tactical proposal is accompanied by verifiable provenance, calibrated confidence scores, and visible simulation boundaries.

This document details the verified capabilities, failure behaviors, and operational boundaries of the Sentra intelligence and data layers.

---

## 2. Intelligence Architecture & Model Integration

### 2.1 Google GenAI Gemini Integration
- **SDK:** Official `google-genai` Python SDK (v2.29.0).
- **Default Models:** `gemini-2.5-flash` for high-throughput topological assessment and triage; `gemini-2.5-pro` for multi-agent council deliberation.
- **Fail-Closed Fallback:** When `GEMINI_API_KEY` is unconfigured, expired, or network-isolated, the system does **not** crash or fabricate synthetic AI text. It activates the deterministic `RULE_BASED_FALLBACK` engine, transparently annotating all outputs with `provider: "rule_based_fallback"`.

### 2.2 Topological Evidence Graph (DAG)
- **Structure:** Directed Acyclic Graph connecting `SourceNode` -> `ObservationNode` -> `EvidenceNode` -> `AssessmentNode`.
- **Cross-Modal Conflict Detection:**
  - Evaluates telemetry divergence across distinct physical modalities (e.g., radiometric infrared thermal camera vs particulate laser counter).
  - Divergence ratio exceeding 3.0x triggers a `ConflictEdge`, automatically applying confidence dampening and alerting operators to sensor conflict.
- **Freshness Invariant:** Telemetry heartbeats exceeding 120 seconds are classified as `STALE_TELEMETRY`. The safety gate imposes an automatic confidence penalty (up to 50%), preventing automated actuation on obsolete observations.

### 2.3 Specialist Agent Deliberation Council
- 5 specialized autonomous roles deliberate upon tactical proposals:
  1. **Fire & Thermal Commander** (plume modeling, combustion dynamics)
  2. **Evacuation & Egress Coordinator** (stairwell clearance, transit vectors)
  3. **Medical & Casualty Triage Officer** (exposure toxicity, trauma staging)
  4. **Crowd Dynamics Specialist** (bottlenecks, crushing hazards)
  5. **Structural Integrity Inspector** (load-bearing degradation, collapse risk)
- Deliberations record explicit dissenting views and operational uncertainty notes.

---

## 3. Prediction Pipeline & Uncertainty Intervals

- **Multi-Task Crisis Prediction:**
  - Predicts temporal conflagration spread rate, particulate dispersion, and containment probability.
- **Calibrated Uncertainty:**
  - Predictions are accompanied by calibrated 90% uncertainty intervals: `[lower_bound, upper_bound]`.
  - When sensor disagreement is detected or telemetry is stale, interval bounds widen symmetrically, communicating epistemic uncertainty to human incident commanders.
- **Zero Fabricated Precision:**
  - The system never presents single-point estimates without uncertainty boundaries.

---

## 4. Digital-Twin Simulation Boundaries & Demo Isolation

### 4.1 What-If Crisis Simulator
- **Isolation Boundary:** Operates in an isolated digital-twin sandbox.
- **Data Marker:** All inputs and outputs are strictly labeled `is_simulation=True` and `disclaimer: "SIMULATION / NOT LIVE OPERATIONAL DATA"`.
- **Non-Interference:** What-if parameter sweeps (e.g., +25°C ambient temperature influx, blocked corridors) do not alter the live state machine, live incidents, or active dispatch queues.

### 4.2 Deterministic Demo Engine (5 Canonical Scenarios)
1. `fire_escalation`: Urban conflagration demonstrating thermal plume expansion and automated evacuation alert.
2. `sensor_disagreement`: Multi-sensor conflict (820°C IR vs baseline optical) demonstrating automatic uncertainty dampening and safety gate policy block.
3. `sensor_outage`: 180s heartbeat loss demonstrating degraded conservative fallback without service interruption.
4. `adapter_unconfigured`: Operator-authorized tactical action encountering unattached physical actuator, returning honest `UNCONFIGURED` receipt.
5. `what_if_comparison`: Counterfactual digital-twin sweep evaluating containment probability deltas under adverse egress conditions.

**Guarantees:**
- Live emergency kill switch is never tripped or reset by demo runs.
- Zero physical actuator signals or external emergency CAD packets are dispatched.
- Every run appends tamper-evident audit blocks to SQLite WAL and verifies the SHA-256 Merkle chain post-run.

---

## 5. Summary of Truthful Claims

| Feature Domain | Verified Production Reality | Prohibited False Claim |
| :--- | :--- | :--- |
| **Physical Deluge / Dampers** | Fail-closed `UNCONFIGURED` status | Never claim live physical BACnet actuation |
| **Emergency CAD Integration** | Fail-closed `UNCONFIGURED` status | Never claim live municipal 911 dispatch |
| **AI Deliberation** | Real Gemini SDK or rule-based fallback | Never claim independent sentient agency |
| **Storage Durability** | Ephemeral container disk on Render Free | Never claim multi-region cloud disaster recovery |
| **Sensor Telemetry** | Validated bounds with staleness dampening | Never claim zero-latency infallible telemetry |
