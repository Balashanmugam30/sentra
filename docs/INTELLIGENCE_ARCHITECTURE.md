# SENTRA MULTIMODAL INTELLIGENCE ARCHITECTURE (PHASE 4)

**Architecture Version:** 4.0  
**Canonical Branch:** `main`  
**Production URL:** `https://sentra-01.vercel.app/`  
**Primary Engine:** Google GenAI (Gemini 2.5 Flash / Pro) + Deterministic Fallback Engine  
**Date:** October 2026  

---

## 1. Architectural Mission

Sentra Phase 4 transitions the platform from a high-fidelity tactical operations user interface into a genuine **Multi-Modal Crisis Intelligence Operating System**.

Prior to Phase 4, crisis responses and AI council deliberations were simulated via static string templates, mock confidence numbers, and unverified action buttons. Phase 4 introduces:
1. **Server-Side Gemini Integration** via the official `google-genai` SDK with strict JSON Schema contracts.
2. **Topological Evidence Graph (DAG)** linking raw hardware telemetry to corroborated evidence nodes and calibrated confidence scores.
3. **Cross-Modal Conflict Detection** detecting discrepancies between sensor modalities (e.g. optical smoke vs. air quality particulates).
4. **Multi-Tenant RAG Knowledge Engine** providing verifiable citations to NFPA, OSHA, and ISO emergency standards.
5. **Specialist Deliberation Council** with 5 explicit crisis roles (Fire, Evacuation, Medical, Crowd, Structure).
6. **Mandatory Human Approval Safety Gate** enforcing an `ActionProposal` state machine before physical or operational escalation.

---

## 2. End-to-End System Pipeline

```
                                [ PHYSICAL INTELLIGENCE FEEDS ]
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
               [ FLIR Radiometric ]    [ AirIQ Particulate ]    [ Axis 4K CCTV / ]
               [ Thermal Cameras  ]    [ HVAC Sensors      ]    [ Field Radios   ]
                     │                        │                        │
                     └────────────────────────┼────────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  MULTIMODAL PERCEPTION PIPELINE │
                             │  • Spatial Bounding Tags        │
                             │  • Calibration Factors          │
                             │  • Metric Normalization         │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │      EVIDENCE GRAPH ENGINE      │
                             │  • Source & Observation Nodes   │
                             │  • Multi-Sensor Corroboration   │
                             │  • Cross-Modal Conflict Detector│
                             │  • Calibrated Fused Confidence  │
                             └────────────────┬────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │                                                 │
                     ▼                                                 ▼
     ┌───────────────────────────────┐                 ┌───────────────────────────────┐
     │   MULTI-TENANT RAG ENGINE     │                 │   GEMINI INCIDENT COMMANDER   │
     │   • NFPA 1600: Emergency Mgmt │                 │   • Model: gemini-2.5-flash   │
     │   • OSHA 1910.120: Hazmat SOP │                 │   • Structured Output Schema  │
     │   • NFPA 101: Life Safety Code│ ── Citations ──▶│   • 5 Specialist Agent Debates│
     │   • Tenant-Scoped Directives  │                 │   • Deterministic Fallback    │
     └───────────────────────────────┘                 └───────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                       ┌───────────────────────────────┐
                                                       │   HUMAN APPROVAL SAFETY GATE  │
                                                       │   • ActionProposal State Mach │
                                                       │   • Pending -> Approved/Reject│
                                                       │   • Immutable Audit Trail     │
                                                       └───────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                       [ INCIDENT INTELLIGENCE COCKPIT ]
```

---

## 3. Data Models & Topological Schema

### 3.1. Evidence Graph Directed Acyclic Graph (DAG)
The Evidence Graph models crisis telemetry through four primary node types and two edge types:

- **`SourceNode`**: Represents a physical sensor, drone, camera feed, or field warden radio (`id`, `name`, `source_type`, `location`, `calibration_index`, `status`, `simulated`).
- **`ObservationNode`**: Represents an individual measurement or perception frame (`id`, `source_id`, `metric_type`, `raw_value`, `unit`, `normalized_severity`, `confidence`, `bounding_box`, `label`).
- **`EvidenceNode`**: Represents a synthesized cluster of observations indicating an actionable phenomenon (`id`, `title`, `description`, `observation_ids`, `confidence_score`, `variance_penalty`, `conflict_score`, `provenance_chain`).
- **`CorroborationEdge`**: Links matching observations across modalities (`similarity_score`, `cross_modal_factor`, `corroboration_rationale`).
- **`ConflictEdge`**: Documents contradictory observations (`discrepancy_metric`, `conflict_severity`, `explanation`).

### 3.2. Calibrated Confidence Formula
Raw confidence is not simply averaged; it is calibrated against sensor degradation, variance, and cross-modal discrepancies:

$$\text{Confidence}_{\text{fused}} = \left( \frac{1}{N} \sum_{i=1}^N \text{Confidence}(E_i) \right) \times (1 - \text{ConflictPenalty}) \times (1 - \text{VariancePenalty})$$

When cross-modal conflict exceeds 0.50 discrepancy delta, a `ConflictEdge` is established and the overall confidence is dampened by $15\%$, raising an alert banner in the operational cockpit.

---

## 4. Multi-Tenant RAG & SOP Retrieval Architecture

Sentra stores emergency standards and tenant-specific building directives in a partitioned semantic store:
- **Global Standards:** NFPA 1600 (2024), OSHA 1910.120(q), NFPA 101 (2024), ISO 22320 (2018).
- **Tenant Documents:** Partitioned by `tenant_id` (e.g. `TEN-BALA-UNI`, `TEN-BALA-MFG`, `TEN-BALA-HOSP`).
- **Traceable Citations:** Every AI recommendation contains verifiable references to exact chapters and sections:
  ```json
  {
    "doc_id": "DOC-OSHA-1910",
    "standard": "OSHA 1910.120(q)",
    "section": "Section 3.2: Immediate Isolation and Vapor Plume Protocols",
    "chunk_id": "OSHA-1910-SEC-3.2",
    "relevance_score": 0.88
  }
  ```

---

## 5. Gemini Integration & Deterministic Fallback Contract

1. **Production SDK:** Implemented using Google's official `google-genai` Python SDK (v2.29.0) and `@google/genai` npm package.
2. **Server-Side Security:** API keys are restricted to server execution environments and never exposed to client browsers.
3. **Structured Pydantic Schemas:** All model inferences enforce strict JSON Schema output matching `IncidentCommanderAssessment`.
4. **Offline / Fallback Guarantee:**
   - If `GEMINI_API_KEY` is not present, network is disconnected, or quota is reached:
   - System automatically degrades to `deterministic-rule-v4`.
   - The UI clearly labels inference as `🛡️ DETERMINISTIC FALLBACK MODE` (`inference_source: "RULE_BASED_FALLBACK"`).
   - Zero crash, zero spinner hangs, zero fake Gemini claims.

---

## 6. Human Approval Boundary (`ActionProposal`)

Sentra strictly adheres to safety-critical AI principles:
- **No Autonomous High-Impact Physical Actions:** High-consequence decisions (Lockdown, Sprinkler Discharge, Mass Evacuation, Tactical Dispatch) are formulated as `ActionProposal` items with `approval_status = "pending_review"`.
- **Operator State Machine:**
  - `pending_review` $\rightarrow$ `approved` (signed by verified operator with timestamp and role check)
  - `pending_review` $\rightarrow$ `rejected` (requires reason for operational audit log)
  - `approved` $\rightarrow$ `executed` (transmits command to building automation or dispatch systems)
- **Immutable Audit Logging:** Every review action is permanently committed to `_telemetry_metrics` and the tenant audit journal.

---

## 7. Incident Intelligence Cockpit UI

The Incident Intelligence Cockpit seamlessly integrates into `/app/incidents`:
- **Liquid Glass 3.0 Tokens:** Built using `Obsidian Midnight`, `GlassPanel`, and high-contrast accessibility standards.
- **Dynamic Sub-Views:**
  1. **Topological Evidence Graph DAG:** Shows live source nodes, observations, corroboration lines, and conflict indicators.
  2. **Multi-Agent Specialist Deliberation:** Displays individual recommendations and caveats from Fire, Evacuation, Medical, Crowd, and Structural agents.
  3. **Human Approval Safety Gate:** Allows operators to review, authorize, or reject crisis interventions in real time.
  4. **Verifiable RAG SOP Citations:** Renders exact excerpted text from NFPA, OSHA, and ISO standards with relevance scores.
