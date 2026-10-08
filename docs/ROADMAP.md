# 🗺️ Sentra Canonical 9-Phase Compressed Roadmap

> **Authoritative Specification:** Compressed 9-Phase Production Program  
> **Repository:** `https://github.com/Balashanmugam30/sentra`  
> **Canonical Production URL:** `https://sentra-01.vercel.app/`  
> **Current Execution Focus:** Phase 3 — Complete Authenticated Operations UI & Infrastructure Hardening  

---

## Canonical Program Overview

| Phase | Title | Status | Scope & Deliverables |
| :---: | :--- | :---: | :--- |
| **1** | Architecture Consolidation + Unified Responsive Foundation | ✅ Complete | Next.js 16 monorepo unification, retired standalone duplicate `apps/mobile/`, consolidated route redirects, unified desktop/tablet/mobile shells, 10 Playwright regression suites. |
| **2** | Design System Reconstruction + Liquid Glass 3.0 | ✅ Complete | Obsidian Midnight base (`#030712`), 3 optical glass tiers (`Glass 01` subtle, `Glass 02` elevated with specular sheen, `Glass 03` floating command), 8 semantic statuses, UI primitive suite, `/app/design-system` QA gallery. |
| **3** | Complete Authenticated Operations UI & Infrastructure Hardening | 🔄 In Progress | Unified authenticated shell, command header, operational command center, incidents & detail workspace, continuous incident timeline, analytics, operations execution, security posture, tenant command, mobile field ops, Vercel/Render recovery. |
| **4** | Real Intelligence Layer | ⏳ Planned | Real Gemini 2.5/Flash model integration, multimodal crisis perception, RAG vector ingestion, AI Decision Council reasoning, structured tool execution. |
| **5** | Real Data + Prediction + MLOps | ⏳ Planned | Live geospatial sensor feeds, hazard propagation modeling, ML inference registry, model drift monitoring, data ingestion pipelines. |
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
