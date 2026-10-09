# ⚡ SENTRA — AI Crisis Intelligence & Continuous Tactical Operations OS

<div align="center">

[![Sentra OS](https://img.shields.io/badge/SENTRA-v2.5.0%20Production-0ea5e9?style=for-the-badge&logo=shield&logoColor=white)](https://sentra-01.vercel.app/)
[![Release Tier](https://img.shields.io/badge/Release-PILOT__READY%20(Tier%20B)-10b981?style=for-the-badge&logo=checkmarx&logoColor=white)](docs/PRODUCTION_READINESS_MATRIX.md)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20Turbopack-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://sentra-li7c.onrender.com/docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

### 🛰️ The Autonomous Neural Backbone for Mission-Critical Facilities & Emergency Operations

**[🖥️ Launch Desktop Command Center](https://sentra-01.vercel.app/app)** &nbsp;•&nbsp; **[📱 Open Integrated Field Mobile](https://sentra-01.vercel.app/mobile)** &nbsp;•&nbsp; **[⚡ Backend API Docs](https://sentra-li7c.onrender.com/docs)** &nbsp;•&nbsp; **[🌐 Public Showcase](https://sentra-01.vercel.app/)**

</div>

---

## 🌐 Overview & Operational Mission

**Sentra** is an enterprise-grade **AI Crisis Intelligence Operating System** engineered for stadiums, high-density campuses, hospitals, airports, critical infrastructure, and tactical emergency centers. 

When disaster strikes—be it structural failure, fire outbreaks, seismic hazards, or multi-vector cyber-physical threats—traditional command systems buckle under fragmented communications, lagging manual updates, and siloed decision hierarchies. 

Sentra changes this paradigm by synthesizing live telemetry, digital twin simulations, multi-modal sensor fusion, and autonomous AI triage into an **unbreakable, continuous operating picture**.

```mermaid
flowchart TD
    subgraph SENSORY_LAYER [Sensory & Telemetry Ingestion]
        S1[IoT Environmental Sensors] --> FUSION[Real-Time Telemetry Engine]
        S2[Structural Stress Gauges] --> FUSION
        S3[Camera Vision Feeds] --> FUSION
        S4[Occupancy & Egress Beacons] --> FUSION
    end

    subgraph INTELLIGENCE_CORE [Sentra Neural Core]
        FUSION --> AI_COUNCIL[AI Crisis Engine & Gemini Intelligence]
        AI_COUNCIL --> TRIAGE[Multi-Modal Incident Triage]
        AI_COUNCIL --> TWIN[Hyperreal 3D Digital Twin]
        AI_COUNCIL --> ROUTE[Dynamic Safe Egress Routing]
    end

    subgraph OPERATIONAL_LAYER [Unified Multi-Tier Command]
        TRIAGE --> COMMAND[Desktop Tactical Command Center\nhttps://sentra-01.vercel.app]
        ROUTE --> MOBILE[Field Responder Mobile PWA\n/mobile/home]
        TWIN --> EXECUTIVE[Executive & Boardroom Oversight]
    end

    subgraph CONTINUITY [Zero-Downtime Continuity]
        COMMAND <--> RESILIENT_CACHE[Offline-First Sync Engine]
        MOBILE <--> RESILIENT_CACHE
    end
```

---

## ⚡ Instant Live Access & Demo Credentials

Sentra features **zero-friction instant demonstration access** with pre-configured role profiles. In production or cloud demo modes where external OAuth configurations are isolated, you can enter immediately using the **1-Click Instant Access** on the login screen or with the credentials below:

| Role Profile | Direct Email | Password | Primary Clearance & Capabilities |
| :--- | :--- | :--- | :--- |
| **🎖️ Commander** | `commander@sentra.demo` | `SentraDemo!2026` | Full tactical authority, lockdown controls, live evacuation triggers |
| **🛡️ System Admin** | `admin@sentra.demo` | `SentraDemo!2026` | Enterprise management, global cloud tenant routing, user RBAC |
| **🦺 Safety Officer** | `officer@sentra.demo` | `SentraDemo!2026` | Real-time sensor telemetry, hazard containment, zone sweeps |
| **📋 Compliance Auditor** | `auditor@sentra.demo` | `SentraDemo!2026` | Immutable audit trail logs, SOC forensics, legal record verification |
| **📈 Operations Analyst** | `analyst@sentra.demo` | `SentraDemo!2026` | Post-incident analytics, predictive risk simulations, ML telemetry |

> **Quick Access Shortcut:** On the [Sentra Access Portal](https://sentra-01.vercel.app/login), click any role pill under **Demo Role Quick Access** to instantly populate credentials and launch into the command environment.

---

## 🚀 Key Architectural Pillars

### 1. 🎛️ Unified Desktop & Mobile Command Center
Sentra unifies high-density desktop monitoring and field responder mobility into a singular coherent architecture:
- **Desktop Command (`/app`)**: Multi-monitor ready tactical interface featuring live situation streams, active incident queue, AI confidence matrices, threat assessment meters, and one-click crisis posture adjustments.
- **Integrated Field Ops (`/mobile`)**: Native-feeling mobile PWA accessible directly from the desktop command bar (`📱 Mobile Ops`) or standalone on mobile devices. Features turn-by-turn hazard-avoiding egress navigation, instant SOS signaling, responder team status, and offline queue synchronization.

### 2. 🧠 Autonomous AI Crisis Engine & Multi-Agent Council
- **Predictive Escalation Modeling**: Calculates structural failure, smoke dispersion, and crowd bottleneck probabilities before casualties occur.
- **Incident Prioritization Matrix**: Categorizes multiple simultaneous incidents by criticality, blast radius, and active human density.
- **Automated Advisory Generation**: Formulates natural-language containment directives reviewed by the AI Advisory Council for human-in-the-loop validation.

### 3. 🗺️ Hyperreal Digital Twin & Facility Simulation
- **Structural Telemetry**: Real-time visualization of floor plans, zones, emergency exits, and elevator statuses.
- **Dynamic Heatmaps**: Atmospheric gas levels, thermal anomalies, corridor congestion, and power grid stability mapped onto interactive layers.
- **Replay & Scenario Sandbox**: Review past emergency events or stress-test contingency plans with simulated fire, power outage, or breach events.

### 4. 📴 Offline-First Resilience & Air-Gapped Continuity
- **Zero-Dependency Fallback**: When network connections are severed during a catastrophe, client-side persistence (Zustand + local storage caches) preserves last-known safe evacuation routes and active personnel tasks.
- **Auto-Sync Queue**: Field actions taken offline (SOS alerts, task completions, responder check-ins) are safely queued and flushed automatically the instant telemetry reconnects.

### 5. 💎 Liquid Glass Design System 3.0 (Apple visionOS & Aerospace Density)
- **Obsidian Midnight Canvas (`#030712`)**: Deep cosmic dark background providing infinite contrast and preventing visual fatigue during active crisis operations.
- **3-Tier Optical Glass Materials**:
  - `Glass 01` (Subtle): 14px blur, 8% border for dense background telemetry panels and data tables.
  - `Glass 02` (Elevated): 22px blur, 12% border with top hairline specular edge highlight for operational cards and navigation docks.
  - `Glass 03` (Floating): 30px blur, 18% border with command occlusion shadows for modals, HUDs, and emergency overlays.
- **8 Standardized Semantic Statuses**: `SAFE` (#10b981), `WARNING` (#f59e0b), `CRITICAL` (#ef4444 with pulsing beacons), `INTELLIGENCE` (#06b6d4), `INFO` (#0ea5e9), `OFFLINE` (#64748b), `UNKNOWN` (#94a3b8), `EXECUTIVE` (#f5d58a).
- **Future Intelligence Visual Grammar**: `<EvidenceCard>` and `<ConfidenceIndicator>` establishing contracts for sensor stream citations, latency telemetry, multi-sensor confirmation states, and calibrated model confidence meters (0–100%).
- **Interactive QA Gallery Route**: Inspect every token, component primitive, and responsive viewport live at [`/app/design-system`](https://sentra-01.vercel.app/app/design-system). Full specifications available in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
- **Aesthetic Isolation**: Enhanced internal command workspaces without altering the signature public landing page (`/`) or login screen (`/login`).

---

## 📁 Repository & System Structure

```
sentra/
├── app/                           # Next.js 16 App Router
│   ├── (auth)/login/              # Resilient Authentication Gateway
│   ├── app/                       # Protected Tactical Command Center
│   │   ├── ai-council/            # Autonomous Intelligence & War Room
│   │   ├── analytics/             # Telemetry & Operating Metrics
│   │   ├── map/                   # Spatial Sensor & Infrastructure Map
│   │   └── settings/              # System & Session Preferences
│   ├── mobile/                    # Unified Mobile Field Responder App
│   │   ├── home/                  # Responder Dashboard & Status Posture
│   │   ├── route/                 # Turn-by-Turn Dynamic Egress Navigation
│   │   ├── alert/                 # Live Emergency Broadcast & Audio Guidance
│   │   ├── sos/                   # 1-Tap Distress Signaling & GPS Beacon
│   │   ├── staff/                 # Field Personnel Task Queue
│   │   └── offline/               # Cached Local Continuity Engine
│   ├── twin/                      # Facility & Campus Digital Twin System
│   ├── incidents/                 # Incident Command & Triage Stream
│   └── layout.tsx                 # Master Shell & Telemetry Hydration
├── components/
│   ├── app/                       # Desktop Command Center Shell & Sidebar
│   ├── mobile/                    # Mobile PWA Components (BottomNav, SOS, Map)
│   ├── security/                  # RBAC Guards, Login Form, Session Management
│   └── ui/                        # Liquid Glass 3.0 Operational Primitives
├── lib/
│   ├── auth/                      # Resilient Dual-Mode Authentication Engine
│   ├── mobile/                    # Mobile State, Task Engines & Simulation Data
│   ├── rbac/                      # Role-Based Access Control Definitions
│   └── realtime/                  # Real-Time Sensor & Telemetry Data Streams
├── store/                         # Zustand Global State Machines
│   ├── auth-store.ts              # Session & Permission State
│   └── useMobileStore.ts          # Mobile Offline Persistence State
├── styles/
│   ├── globals.css                # Global Layout & Foundation Styles
│   └── tokens.css                 # Master Liquid Glass 3.0 Design Tokens
├── tests/
│   ├── e2e/                       # Playwright Multi-Viewport Regression Specs (01-10)
│   └── test_enterprise_platform.py # FastAPI Python Unit & Integration Suite
├── types/
│   └── incident-intelligence.ts   # Future Capability Seams & Type Contracts
└── playwright.config.ts           # Playwright Test Runner Configuration
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Balashanmugam30/sentra.git
   cd sentra
   ```

2. **Install all dependencies across workspaces:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create `.env.local` in the project root:
   ```env
   # Application Configuration
   NEXT_PUBLIC_APP_NAME="Sentra"
   NEXT_PUBLIC_APP_ENV="development"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"

   # Firebase Auth Configuration (Optional in Demo Mode)
   NEXT_PUBLIC_FIREBASE_API_KEY=""
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
   NEXT_PUBLIC_FIREBASE_APP_ID=""
   ```

4. **Verify TypeScript across all workspaces:**
   ```bash
   npm run typecheck
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the Command Center.

6. **Create an optimized production build:**
   ```bash
   npm run build
   ```

---

## 🚀 Deployment & Canonical Infrastructure

| Target | Deployment URL | Description | Status |
| :--- | :--- | :--- | :---: |
| **Primary Production Command OS** | [sentra-01.vercel.app](https://sentra-01.vercel.app/) | Production Vercel deployment with full command center (`/app`) and unified field mobile (`/mobile`) | ✅ Live (Vercel Edge) |
| **Canonical Operations Backend** | [sentra-li7c.onrender.com](https://sentra-li7c.onrender.com/) | FastAPI crisis orchestration core, SQLite WAL persistence, multimodal inference | ✅ Live (Render Oregon) |
| **Backend API Documentation** | [sentra-li7c.onrender.com/docs](https://sentra-li7c.onrender.com/docs) | Interactive Swagger UI API documentation and endpoint schema contracts | ✅ Live |

---

## 📚 Phase 9 Release Documentation & Specifications

- [🗺️ Canonical 9-Phase Roadmap](docs/ROADMAP.md) — Comprehensive history and completion matrix across all 9 phases.
- [🚦 Production Readiness Matrix](docs/PRODUCTION_READINESS_MATRIX.md) — Gate-by-gate audit and `PILOT_READY` (Tier B) certification.
- [📖 Operator Release Runbook](docs/RELEASE_RUNBOOK.md) — Local execution, automated test suites, and diagnostic probes.
- [🔄 Rollback & Disaster Recovery](docs/ROLLBACK_AND_RECOVERY.md) — Vercel/Render rollback protocols and SQLite snapshot restore.
- [⚠️ Known Limitations & Boundaries](docs/KNOWN_LIMITATIONS.md) — Transparent disclosure of ephemeral disk, hardware honesty, and cloud sleep limits.
- [📊 Final Verification Matrix](docs/FINAL_VERIFICATION_MATRIX.md) — Forensic quality audit, 69/69 passing tests, and sub-10ms latency metrics.
- [🛡️ Security Threat Model & Review](docs/SECURITY_REVIEW.md) — 10-point security audit across RBAC, BOLA, SSRF, and credential hygiene.
- [🧠 AI & Data Truth Disclosures](docs/AI_AND_DATA_TRUTH.md) — Multimodal perception, Topological Evidence DAG, and uncertainty intervals.
- [💡 Product Positioning & Architecture](docs/PRODUCT_POSITIONING.md) — Market analysis, competitive comparison vs legacy CAD, and moat definitions.

---

## 🛡️ Security, Privacy & Compliance

- **Zero-Trust Role Enforcement**: Granular cryptographic permission checks (`require_permission`) on every route, action, and telemetry pipe.
- **Two-Person Integrity (TPI)**: Mandatory independent second-operator authorization for high-stakes tactical dispatches.
- **Fail-Closed Hardware Honesty**: Unconfigured physical actuators honestly declare `UNCONFIGURED` with zero simulated side-effects.
- **Audit-Grade Traceability**: Tamper-evident activity logs protected by unbroken forward SHA-256 Merkle chain hashes adhering to SOC2, ISO 27001, and NFPA standards.

---

<div align="center">

**Built with precision for uncompromised operational continuity.**  
© 2026 Sentra Autonomous Systems. All rights reserved.

</div>
