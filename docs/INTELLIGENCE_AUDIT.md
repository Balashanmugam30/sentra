# SENTRA INTELLIGENCE LAYER — FORENSIC AUDIT MATRIX (PHASE 4)

**Document Status:** Complete Forensic Baseline  
**Canonical Branch:** `main`  
**Production URL:** `https://sentra-01.vercel.app/`  
**Audit Date:** October 2026  
**Auditor:** Sentra Principal Intelligence Architect & DevOps Maintainer  

---

## 1. Executive Summary

Sentra has transitioned through Phase 1 (Forensic Cleanup & Mobile Redundancy Elimination), Phase 2 (Responsive Unification & Liquid Glass Token System), and Phase 3 (Production Recovery, Infrastructure Hardening & Complete Operations Cockpit).

While Phase 3 established a unified, high-performance authenticated operations UI, the underlying intelligence architecture remained largely heuristic or simulated. Specifically:
- "AI Council" recommendations were generated via deterministic weighted strings (`lib/engines/ai-council-engine.ts` and `app/ai/council_service.py`).
- "Perception" was based on synthetic sensor thresholds (`app/perception/detector.py`) rather than true multimodal vision processing.
- "Evidence" was presented as static mockup cards without a topological Directed Acyclic Graph (DAG) or cryptographic provenance chain.
- "Emergency SOPs" were hardcoded text snippets rather than dynamically retrieved vector chunks with verified section citations.
- "Human Oversight" lacked an enforced state machine separating speculative AI proposals from authorized physical/tactical interventions.

Phase 4 executes the complete architectural transition from **Polished Operations UI** to **Real Multimodal Crisis Intelligence Layer**.

---

## 2. Intelligence Subsystem Audit Matrix

Every intelligence dimension is evaluated against four strict categories:
- **`REAL`**: Implemented with genuine production logic, official SDKs, real data processing, and verified execution.
- **`PARTIAL`**: Real architectural scaffolding or heuristics exist, but requires integration with real model inference, vector storage, or live data flows.
- **`SIMULATED`**: Synthetic data generators or rule-based generators masquerading as intelligent output.
- **`MISSING`**: No functional code, schema, or endpoint exists in the repository.

| # | Subsystem Dimension | Pre-Phase 4 State | Classification | Primary File Paths Audited | Forensic Finding & Technical Root Cause |
|---|---|---|---|---|---|
| **1** | **Gemini Model Integration** | No server SDK calls; heuristic strings returned | `MISSING` | `app/ai/service.py`<br>`lib/engines/ai-council-engine.ts` | The codebase lacked `google-genai` and `@google/genai` packages. All "AI" advice was generated via static string interpolation templates. |
| **2** | **Multimodal Vision / CCTV Perception** | Synthetic noise thresholds; no image embeddings | `SIMULATED` | `app/perception/detector.py`<br>`app/perception/sensors.py` | `detector.py` simulated CCTV "detections" by sampling random normal distributions around baseline values. No real visual frames were processed. |
| **3** | **Evidence Graph & Provenance** | Unlinked UI cards; no graph structure or ancestry | `SIMULATED` | `components/ui/evidence-card.tsx`<br>`lib/engines/incident-intelligence.ts` | UI displayed isolated evidence badges with mock confidence numbers. No node/edge schema existed to track `Source -> Observation -> Evidence -> Corroboration/Conflict -> Assessment`. |
| **4** | **Confidence Engine & Sensor Fusion** | Simple linear averaging; no cross-modal calibration | `PARTIAL` | `lib/ai/confidence.ts`<br>`app/perception/fusion.py` | Mathematical weighting existed, but lacked sensor variance weighting, sensor degradation penalties, cross-modal conflict dampening, and calibrated uncertainty bounds. |
| **5** | **Contradiction & Conflict Detection** | Non-existent; contradictory reports simply overwritten | `MISSING` | `app/perception/fusion.py`<br>`lib/engines/live-twin-intelligence.ts` | When camera and sensor readings diverged (e.g., thermal spike without optical smoke), the system did not compute conflict indices or generate discrepancy alerts. |
| **6** | **Human Field Reports Ingestion** | Form submission existed, but unweighted and unverified | `PARTIAL` | `app/api/` endpoints<br>`lib/data/incidents.ts` | Human reports were stored as plain text notes without credibility weighting, geospatial proximity verification, or correlation against sensor telemetry. |
| **7** | **RAG Architecture & Vector SOP Retrieval** | Hardcoded static markdown paragraphs; no embeddings | `MISSING` | `lib/engines/ai-council-engine.ts`<br>`data/` | SOP guidance consisted of hardcoded switch-case branches. No vector embedding generation, pgvector schema, or chunked document retrieval with verifiable citations existed. |
| **8** | **Knowledge Graph Foundation** | Flat relational tables in memory/JSON; no graph links | `PARTIAL` | `data/tenancy_store.json`<br>`lib/types/twin.ts` | Facilities and sensors were stored in flat arrays. Spatial adjacency (`Zone A is adjacent to Zone B`), utility dependencies, and responder assignment topology were not modeled as graph nodes and relations. |
| **9** | **AI Incident Commander & Specialist Agents** | Faux multi-agent strings generated in a single loop | `SIMULATED` | `app/ai/council_service.py`<br>`lib/ai/council.ts` | The "Council" simulated Fire, Logistics, Medical, and Structural agents by choosing pre-written statements from an array based on incident severity. |
| **10** | **Safety Boundary & Human Approval Gate** | Immediate UI action buttons without transactional gating | `PARTIAL` | `components/twin/decision-simulator.tsx`<br>`app/app/incidents/page.tsx` | High-impact actions (Lockdown, Mass Evacuation, Sprinkler Activation) did not enforce an `ActionProposal` state machine (`proposed` -> `reviewed` -> `approved` -> `executed`). |
| **11** | **Explainability & CoT Leak Prevention** | Plain string dump; no structured rationale schema | `SIMULATED` | `lib/engines/executive-intelligence.ts` | UI showed generic "Reasoning" text blocks without breakdown into verified observations, uncertainty factors, alternative hypotheses, or safety constraints. |
| **12** | **Graceful Degradation & Fallback Modes** | Crashing if mock service failed; no fallback contract | `MISSING` | `lib/ai/api.ts` | System lacked a formalized deterministic offline fallback layer that explicitly signaled degraded state (`FALLBACK_DETERMINISTIC_MODE`) when AI providers were unavailable. |
| **13** | **Cockpit UI Integration** | Static components disconnected from backend stream | `PARTIAL` | `components/twin/`<br>`app/app/cockpit/page.tsx` | Dashboard UI had high visual fidelity (Liquid Glass) but consumed mocked state hooks with disconnected event loops. |
| **14** | **Telemetry, Observability & Token Auditing** | No latency, token usage, or model audit trails | `MISSING` | `app/ai/router.py` | Zero observability for AI inference latency, prompt token counts, completion token counts, schema validation failures, or provider error rates. |

---

## 3. Deep Forensic Breakdown

### 3.1. The "AI Council" & "Perception" Illusion
In `app/ai/council_service.py` lines 42–78:
```python
# PRE-PHASE 4 CODEBASE REALITY:
def evaluate_crisis(incident_type: str, severity: str):
    # Simulated static branches
    if incident_type == "fire":
        return {
            "fire_specialist": "Initiate immediate suppression protocol B-2.",
            "crowd_specialist": "Evacuate sector 4 via northwest stairwells.",
            "consensus": 0.88
        }
```
*Verdict:* Completely simulated. It gave the impression of multi-agent debate and consensus, but was purely deterministic switch logic without situational adaptation, contextual reasoning, or real sensor grounding.

### 3.2. Evidence Provenance & Topological Disconnect
In `components/ui/evidence-card.tsx` and `lib/engines/incident-intelligence.ts`:
- Evidence was represented as arbitrary items: `{ id: "EV-01", title: "Thermal spike", confidence: 0.92 }`.
- There was no recorded lineage back to raw hardware telemetry (`SourceNode`), observation timestamp, ingestion pipeline, sensor calibration factor, or corroborating optical streams (`CorroborationEdge`).
- There was no mechanism to identify conflicts when a secondary sensor contradicted the primary alert.

### 3.3. RAG & Knowledge Retrieval Absence
- Crisis procedures (NFPA fire response, FEMA mass casualty triage, chemical plume evacuation standards) were either hardcoded as static bullet points or nonexistent.
- There was no multi-tenant vector indexing mechanism allowing facilities to upload their specific architectural blueprints, hazardous material manifests, and standard operating procedures (SOPs).

---

## 4. Phase 4 Mandatory Engineering Blueprint

To achieve true operational intelligence without pretense or simulation illusions, Phase 4 implements the following canonical stack:

```
[ Raw Hardware Sensors ]  [ CCTV / Image Feeds ]  [ Human Field Reports ]
           │                       │                       │
           ▼                       ▼                       ▼
   [ Sensor Normalizer ]   [ Multimodal Vision ]   [ Credibility Engine ]
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │       EVIDENCE GRAPH ENGINE       │
                 │ ───────────────────────────────── │
                 │ • Sources & Raw Observations     │
                 │ • Multi-Sensor Fusion & Weights   │
                 │ • Calibrated Confidence (0.0-1.0) │
                 │ • Cross-Modal Conflict Detector   │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │       KNOWLEDGE GRAPH & RAG       │
                 │ ───────────────────────────────── │
                 │ • Spatial Topology (Zones/Assets) │
                 │ • Emergency SOP Vector Chunks     │
                 │ • Traceable Citations (Doc/Sec)   │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │    GEMINI INCIDENT COMMANDER      │
                 │ ───────────────────────────────── │
                 │ • Official google-genai SDK       │
                 │ • Server-Side Execution Only      │
                 │ • Specialist Agents (Fire/Med/...)│
                 │ • Structured JSON Pydantic Schema │
                 │ • Degradation & Offline Fallback  │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                 ┌───────────────────────────────────┐
                 │     HUMAN SAFETY APPROVAL GATE    │
                 │ ───────────────────────────────── │
                 │ • ActionProposal State Machine    │
                 │ • Operator Authorization Boundary │
                 │ • Audit Trail & Execution Journal │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                 [ Incident Intelligence Cockpit UI ]
```

---

## 5. Architectural Quality Bar & Constraints

1. **Strict Server-Side Model Access:** `GEMINI_API_KEY` is never transmitted to the browser or embedded in client bundles.
2. **Deterministic Fallback Transparency:** When `GEMINI_API_KEY` is not present, the system cleanly falls back to an offline rule-based deterministic engine, explicitly marking output as `FALLBACK_DETERMINISTIC_REASONING` (`is_simulated = false`, `inference_source = "RULE_BASED_FALLBACK"`). No fake Gemini inference claims.
3. **Structured Pydantic Contracts:** All LLM outputs are validated against strict JSON schemas with 0 schema drift.
4. **Human in the Loop:** Autonomous actions with physical or life-safety consequences require explicit human operator approval via signed `ActionProposal` objects.
5. **No Regressions:** TypeScript typecheck, ESLint, Next.js production build, Python compile, pytest, and Playwright E2E suites must pass at 100%.
