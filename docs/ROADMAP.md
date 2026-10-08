# 🗺️ Sentra Canonical 9-Phase Compressed Roadmap

> **Authoritative Specification:** Compressed 9-Phase Production Program  
> **Repository:** `https://github.com/Balashanmugam30/sentra`  
> **Canonical Production URL:** `https://sentra-01.vercel.app/`  
> **Current Execution Focus:** Phase 6 — Autonomous Crisis Operations (Phase 5 Complete)  

---

## Canonical Program Overview

| Phase | Title | Status | Scope & Deliverables |
| :---: | :--- | :---: | :--- |
| **1** | Architecture Consolidation + Unified Responsive Foundation | ✅ Complete | Next.js 16 monorepo unification, retired standalone duplicate `apps/mobile/`, consolidated route redirects, unified desktop/tablet/mobile shells, 10 Playwright regression suites. |
| **2** | Design System Reconstruction + Liquid Glass 3.0 | ✅ Complete | Obsidian Midnight base (`#030712`), 3 optical glass tiers (`Glass 01` subtle, `Glass 02` elevated with specular sheen, `Glass 03` floating command), 8 semantic statuses, UI primitive suite, `/app/design-system` QA gallery. |
| **3** | Complete Authenticated Operations UI & Infrastructure Hardening | ✅ Complete | Unified authenticated shell, command header, operational command center, incidents & detail workspace, continuous incident timeline, analytics, operations execution, security posture, tenant command, mobile field ops, Vercel/Render recovery. |
| **4** | Real Multimodal Crisis Intelligence Layer | ✅ Complete | Official Google GenAI (Gemini 2.5 Flash / Pro) integration, Multimodal perception (FLIR thermal, CCTV, air quality), Topological Evidence Graph DAG with cross-modal conflict detection, Multi-tenant RAG emergency SOP vector retrieval (NFPA, OSHA, ISO), 5 Specialist Agent deliberation council, Mandatory Human Approval Safety Gate (ActionProposal state machine), and Incident Intelligence Cockpit UI. |
| **5** | Real Data + Prediction + MLOps | ✅ Complete | Canonical multi-modal data plane schemas, atomic persistent storage repository with SHA-256 validation, physical bounds & range validation, idempotency registry, 5-family feature engineering, multi-task crisis prediction engine with calibrated 90% uncertainty intervals [lower, upper], MLOps model registry & lifecycle management, zero-disruption shadow mode runner, feature PSI drift surveillance, inference telemetry, and Prediction Cockpit UI. |
| **6** | Autonomous Crisis Operations | ⏳ Planned | Closed-loop hazard containment, automated building overrides, safety approval gates, multi-agent dispatch protocols. |
| **7** | Security + Reliability + Enterprise Hardening | ⏳ Planned | End-to-end zero-trust architecture, audit log immutability, automated failover, air-gapped readiness, enterprise compliance. |
| **8** | Testing + Performance + Human UX + Demo Intelligence | ⏳ Planned | Comprehensive synthetic load testing, sub-100ms telemetry latency, stress simulation scenarios, judge/investor demo scripting. |
| **9** | Production Release + Competitive Productization | ⏳ Planned | Enterprise SLA validation, multi-tenant billing, commercial packaging, final production sign-off. |

---

## Phase 1 Deliverables (Consolidation)
1. **Retired Standalone Mobile Workspace:** Completely removed duplicate `apps/mobile/` package and unified all mobile functionality into canonical root `app/mobile/*`.
2. **Migrated PWA Infrastructure:** Relocated `manifest.json`, `sw.js`, and vector icons into root `public/`, scoped cleanly to `/mobile`.
3. **Route Consolidation:**
   - Canonical desktop root: `/app`.
   - Automated 308 permanent redirects: `/dashboard` -> `/app`, `/app/dashboard` -> `/app`, `/landing` -> `/`.
4. **Shell & Viewport Unification:** Enhanced `<AppShell>` and `<LuxurySidebar>` for seamless drawer behavior on mobile (<768px), rail on tablet (768-1023px), and full sidebar on desktop (>=1024px).
5. **Accessibility & Scroll Safety:** Eliminated keyboard event hijacking in smooth scroll, disabled Lenis on mobile/touch, preserved native browser key navigation.
6. **State Reconciler:** Reactively synchronized `useUserStore` with primary `useAuthStore`.
7. **Future Capability Seams:** Defined type contracts in `types/incident-intelligence.ts`.
8. **Automated E2E Suite:** Implemented 10 Playwright regression specifications covering all breakpoints, auth, PWA, and routes.

---

## Phase 2 Deliverables (Liquid Glass 3.0)
1. **Liquid Glass 3.0 Tokens Foundation:** Established Obsidian Midnight base (`#030712`), 3 Liquid Glass material tiers (`Glass 01` subtle 14px blur, `Glass 02` elevated 22px blur with top specular hairline highlight, `Glass 03` floating 30px blur with command depth shadow), and hairline specular utilities in `styles/tokens.css`.
2. **Standardized Semantic Status Palette:** Standardized 8 operational states (`safe`, `warning`, `critical`, `intelligence`, `info`, `offline`, `unknown`, `executive`) with calibrated contrast ratios and pulsing beacon support (`StatusBadge`, `StatusDot`).
3. **Operational Telemetry Primitives:** Created `<MetricCard>` with tabular monospace numeral stability, trends, deltas, status badges, and hints for rapid real-time updates without layout jitter.
4. **Accessible Component Primitives:** Upgraded and authored reusable components in `components/ui/`:
   - `<GlassPanel>` (Tiers 1–3)
   - `<GlassCard>` (interactive states, hover lift, specular reflection)
   - `<Button>` (6 variants: primary, secondary, ghost, danger, executive, intelligence; verified min 44px touch targets)
   - `<Input>` & `<SearchInput>` (with ⌘K shortcut, clear button, and 44px touch targets)
   - `<SegmentedControl>` (Apple-style smooth glass indicator with keyboard navigation)
   - `<GlassDialog>` (accessible modal with focus trap, focus restoration, backdrop blur, keyboard listeners, ARIA dialog role)
   - `<AlertBanner>` (operational severity banners with dynamic ARIA live semantics)
5. **Future Intelligence Visual Grammar:** Authored `<EvidenceCard>` and `<ConfidenceIndicator>` establishing visual contracts for sensor stream citations, latency telemetry, multi-sensor confirmation states, and calibrated model confidence meters (0–100%).
6. **Dedicated Design System QA Showcase Route:** Implemented interactive gallery at `/app/design-system` displaying all materials, tokens, typography scales, components, and telemetry across all 8 standard tactical viewports (320px–1728px).
7. **Comprehensive Architecture Documentation:** Authored `docs/DESIGN_SYSTEM.md` detailing design philosophy, token recipes, component APIs, accessibility contracts, and responsive standards.
8. **Automated E2E QA Suite:** Implemented `tests/e2e/11-design-system.spec.ts` verifying rendering, touch target compliance, dialog interactivity, and zero horizontal scroll leak across mobile, tablet, and desktop viewports.

---

## Phase 3 Deliverables (Operations UI & Infrastructure Recovery)
1. **GitHub CI & Infrastructure Recovery:**
   - Decommissioned obsolete duplicate project `prj_bzfzTYAxczZ9oRUNVPZ09kAYUmWi` from GitHub webhook integration, resolving the blocking `Vercel – sentra` failure status.
   - Restored GitHub commit status to clean healthy green on `main`.
2. **Backend & Cloud Port Readiness:**
   - Configured `render.yaml` blueprint with automated secret generation (`JWT_SECRET`, `SECRET_KEY`) and CORS origin integration for `https://sentra-01.vercel.app`.
   - Dynamic port binding `${PORT:-8000}` in `Dockerfile.backend` and `app/core/config.py`.
3. **Protected QA Route:** Securely protected `/app/design-system` under authenticated RouteGuard and session cookies.
4. **Touch Target Enforcement:** Audited and resolved all interactive elements to meet minimum 44px touch targets (dialog close, search clear, segmented controls, alert dismiss).
5. **Complete Authenticated Operations Surfaces:**
   - Unified Responsive OS Shell (Desktop sidebar, tablet compressed rail, mobile drawer).
   - Premium Command Header with live status, context switcher, quick search, notifications.
   - Command Center operational landing dashboard.
   - Incidents Queue & Comprehensive Incident Detail Workspace.
   - Continuous Incident Timeline with event audit stream.
   - Analytics & Operational Telemetry Hub.
   - Operations Dispatch & Execution Queue with distinct View / Recommend / Execute actions.
   - Security Posture & Access Audit Log Surface.
   - Tenant & Multi-Organization Command Surface.
   - Application Settings with honest persistence state.
   - Root-Integrated Mobile Field Operations Companion (`/mobile/*`).

---

## Phase 4 Deliverables (Real Multimodal Crisis Intelligence Layer)
1. **Official Google GenAI (Gemini 2.5 Flash / Pro) Provider:**
   - Integrated the official `google-genai` Python SDK (v2.29.0) and `@google/genai` npm library.
   - Server-side execution only with strict JSON Schema contracts.
   - Explicit degradation and deterministic fallback (`RULE_BASED_FALLBACK`) when offline or unconfigured.
2. **Topological Evidence Graph (DAG):**
   - Implemented graph data structure linking `SourceNode` -> `ObservationNode` -> `EvidenceNode` -> `AssessmentNode`.
   - Calibrated confidence engine factoring in sensor variance, degradation, and cross-modal corroboration.
3. **Cross-Modal Conflict Detection:**
   - Detects discrepancies between sensor modalities (e.g. radiometric thermal spike vs. particulate air sensor baseline).
   - Establishes `ConflictEdge` objects with explanation strings and applies automated confidence dampening.
4. **Multi-Tenant RAG Emergency SOP Retrieval:**
   - Vector similarity retrieval engine indexing NFPA 1600 (Emergency Mgmt), OSHA 1910.120 (Hazmat), NFPA 101 (Life Safety Code), ISO 22320, and tenant-scoped facility directives.
   - Verifiable citations with standard name, section title, chunk ID, and exact textual excerpts.
5. **AI Incident Commander & 5 Specialist Roles:**
   - Multi-agent deliberation across Fire Commander, Evacuation Coordinator, Medical Triage Officer, Crowd Dynamics Specialist, and Structural Safety Inspector.
   - Structured tactical reasoning with operational caveats and dissent tracking.
6. **Mandatory Human Approval Safety Gate:**
   - Strict `ActionProposal` state machine (`pending_review` -> `approved` -> `executed` / `rejected`).
   - High-impact physical operations (Lockdowns, Mass Alerts, Sprinkler Activation, Tactical Dispatch) blocked from execution without explicit verified operator sign-off.
7. **Incident Intelligence Cockpit UI Integration:**
   - Seamlessly integrated into `/app/incidents` with Liquid Glass 3.0 tokens.
   - Interactive sub-navigation across Topological Evidence DAG, Specialist Agents, Human Approval Gate, and RAG Citations.
8. **Forensic Audit & Architecture Documentation:**
   - Authored `docs/INTELLIGENCE_AUDIT.md` (complete forensic matrix).
   - Authored `docs/INTELLIGENCE_ARCHITECTURE.md` (end-to-end multi-tier pipeline and mathematical formulas).
9. **Full Automated Verification:**
   - Python unit test suite (`tests/test_intelligence_layer.py`) passing 100% with live Gemini invocation.
   - Playwright end-to-end test suite (`tests/e2e/13-intelligence-layer.spec.ts`) validating UI intelligence panels, DAG nodes, and human approval transitions.

---

## Phase 5 Deliverables (Real Data + Prediction + MLOps)
1. **Canonical Multi-Modal Sensor Data Plane:**
   - Authored typed Pydantic V2 schemas in `app/data/canonical_schemas.py` for multi-sensor envelopes: FLIR thermal (`flir_c5`), AirIQ air quality/gas (`airiq_pro`), optical flow crowd density CCTV (`axis_q35`), acoustic sensors, and responder radio reports.
   - Standardized `DataQualityReport`, `FeatureSnapshot` (5 families), `UncertaintyInterval` (90% calibrated bounds), `IncidentPredictionBundle`, and MLOps registry models.
2. **Atomic Ingestion & Persistence Engine:**
   - Authored thread-safe storage repository in `app/data/storage.py` using `threading.RLock`, atomic `.tmp` file replacement, SHA-256 digest validation, and tenant isolation in `data/sentra_data_plane.json`.
   - Authored sensor ingestion pipeline in `app/data/ingestion.py` with physical bounds checking (temperatures -40°C to 1200°C, VOC/CO/PM2.5 positive limits, optical density 0-100%), deduplication idempotency registry, and out-of-order sequence correction.
3. **Real-Time Data Quality & Anomaly Engine:**
   - Authored dynamic data quality auditing in `app/data/quality_engine.py`: staleness detection (>60s sensor heartbeat threshold), sensor dropout alerts, noise spike filtering, and cross-modal discrepancy flags (e.g. thermal surge without smoke/optical confirmation).
4. **5-Family Crisis Feature Engineering Pipeline:**
   - Authored real-time feature extraction in `app/data/feature_engine.py` across 5 orthogonal feature families:
     - **Environmental Dynamics:** thermal gradient, gas diffusion rate, air quality index.
     - **Spatial Topography:** containment perimeter, distance to egress corridors, vertical plume spread.
     - **Crowd / Occupant Density:** evacuation flow rate, bottleneck pinch-point risk, headcount exposure.
     - **Temporal Velocity:** rate of escalation, duration active, time to critical threshold.
     - **Evidence Graph Topological Features:** contradiction ratio, verified node count, multi-sensor consensus score.
5. **Calibrated Multi-Task Crisis Forecasting Engine:**
   - Authored deterministic Bayesian-calibrated crisis forecasting in `app/ml/prediction_engine.py` across 5 critical tactical horizons:
     - Fire Spread & Flashover Probability (15-min horizon).
     - Structural Collapse Risk (30-min horizon).
     - Crowd Crush & Egress Bottleneck Congestion (5-min horizon).
     - Toxic Plume Dispersion Reach (10-min horizon).
     - Multi-Dimensional Casualty Risk Index (composite casualty likelihood).
   - Calibrated 90% uncertainty intervals `[lower_bound_90, upper_bound_90]` on all predictions with explicit epistemic (model uncertainty) vs. aleatoric (sensor noise) uncertainty breakdown.
   - Honest fallback states: `HIGH_CONFIDENCE_INFERENCE`, `CALIBRATED_FALLBACK`, and `INSUFFICIENT_EVIDENCE` (no hallucinated forecasts).
6. **MLOps Model Registry & Zero-Downtime Governance:**
   - Authored production-grade model lifecycle manager in `app/mlops/model_registry.py` tracking active production models (`sentra-ensemble-risk-v2.4`) and shadow candidate models (`sentra-transformer-crowd-v3.0`).
   - Non-blocking shadow-mode execution pipeline comparing production vs shadow predictions.
   - Prediction divergence delta monitoring (flagging divergences > 15%).
   - Population Stability Index (PSI) drift engine continuously monitoring distribution shift across feature snapshots (`NORMAL` < 0.1, `WATCH` 0.1-0.25, `DRIFT_DETECTED` > 0.25).
   - Inference latency telemetry (p50, p95, p99 tracking).
7. **FastAPI Endpoints:**
   - Implemented and mounted 3 routers: `app/data/router.py` (`/data/*`), `app/prediction/router.py` (`/predictions/*`), and `app/mlops/router.py` (`/mlops/*`).
8. **TypeScript Types & Resilient Client SDK:**
   - Authored `lib/data/prediction-types.ts` and `lib/data/prediction-service.ts` with transparent mock fallbacks for resilient offline / demo operation.
9. **Liquid Glass 3.0 Prediction Cockpit UI:**
   - Authored `components/predictions/prediction-cockpit-panel.tsx`: High-density responsive operational cockpit utilizing Obsidian Midnight tokens, inline SVGs, calibrated 90% uncertainty bar indicators `[lower% — upper%]`, stream quality indicators, evacuation bottleneck alerts, MLOps model registry & shadow divergence tracker, and human authorization safety modal.
   - Integrated into authenticated operational routes: `/app/incidents`, `/app/analytics`, and `/twin/predictive`.
10. **Automated Testing & End-to-End Verification:**
    - 17/17 Python test suite passing across all unit & integration tests (`tests/test_data_plane_and_mlops.py`, `tests/test_intelligence_layer.py`, `tests/test_enterprise_platform.py`).
    - 35/35 Playwright E2E tests passing across all 14 test specs, including new comprehensive `tests/e2e/14-data-prediction-mlops.spec.ts`.
11. **Comprehensive Architectural Documentation:**
    - Authored `docs/DATA_ARCHITECTURE.md`, `docs/PREDICTION_ARCHITECTURE.md`, `docs/MLOPS.md`, and `docs/RENDER_DEPLOYMENT.md`.

