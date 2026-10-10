# SENTRA — DESIGN REFERENCE & COMPONENT SELECTION ARCHITECTURE

## 1. Executive Context & Design Philosophy
This document establishes the authoritative component selection and design reference architecture for Sentra OS, pivoting from the previous dark-saturated, heavily rounded, neo-dashboard aesthetic to a **light-first, calm, high-precision enterprise operational operating system**.

### Principles:
1. **Light-First Neutral Backbone:** Grounded in a refined Slate/Cool Gray palette (`#F8FAFC` canvas, `#FFFFFF` crisp primary cards, `#0F172A` high-contrast typography, and `#E2E8F0` micro-borders).
2. **Selective Liquid Glass:** Glassmorphic translucency is strictly restricted to elevated contextual surfaces: floating command/search bar, sticky navigation header, dropdowns, modal overlays, and the assistant dock. Core data surfaces remain crisp, opaque, and highly readable.
3. **Information Density with Breathing Room:** Eliminating oversized 3-line marketing headlines in favor of compact, editorial headers with high-value operational metrics above the fold.
4. **Restrained Motion & Telemetry Truth:** Eliminating distracting continuous shimmers, decorative glowing rainbow progress tracks, and unanchored counts. Every metric is anchored in verified data with honest operational labels.

---

## 2. Component Research & Reference Catalog

### 2.1 Researched Reference Patterns (Linear, Vercel, shadcn/ui, 21st.dev)

| Design Need | Selected Reference / Source | Specific Pattern | Why Selected |
|---|---|---|---|
| **Persistent Shell & Layout** | shadcn/ui Dashboard Shell & Linear App | Persistent 260px slim sidebar + sticky topbar + 12-column responsive grid | Industry standard for high-trust enterprise SaaS; prevents layout shift and eliminates arbitrary margins. |
| **Command Header & Search** | 21st.dev "Linear Style Command Menu" & shadcn Command | Centered floating pill with `Ctrl K` / `Cmd K` shortcut, fixed 38px height scale | Replaces cluttered 44px text-heavy search bar; provides clean baseline alignment with mode pills and status. |
| **Segmented Mode Switcher** | Radix UI / shadcn Tabs | Slotted segmented capsule control (`Command` \| `Executive` \| `Demo` \| `Crisis`) | Eliminates dense stacked pills; uses subtle background highlight on active item with zero neon glow. |
| **KPI Metric Strips** | ReUI & shadcn Studio Metric Block | 6-part structured card: Title, status indicator, prominent mono value, contextual delta/trend | Replaces decorative glowing rainbow progress bars with meaningful operational status. |
| **Navigation Sidebar** | Linear App & Tailwind UI Sidebar | Sectioned slim navigation with 36px item height, SVG micro-icons, subtle tinted active state | Replaces heavy navy cards and noisy glowing active bars with a quiet, calm hierarchy. |
| **Editorial Hero** | Vercel Analytics & Stripe Dashboard Header | Compact single-row or two-tier header: Title (24px-28px), date/shift metadata, primary/secondary action buttons | Frees up 60% of vertical viewport space compared to giant multi-line hero boxes. |
| **Assistant Dock** | Magic UI Floating Action / Dock | Discreet floating glass pill in bottom-right corner with 24px margin | Prevents overlapping dashboard interaction controls and cards. |

---

## 3. Component Replacement Mapping

| Existing Sentra Component | Identified Defects | New Replaced Implementation |
|---|---|---|
| `modules/dashboard/components/top-bar.tsx` | Colliding breadcrumbs (`D..`), overlapping search, displaced notification badge below bell, competing status text | Refactored topbar with 3 distinct zones: Left (breadcrumb + title), Center (compact search pill), Right (segmented mode switcher, notification bell with overlay counter, profile pill). |
| `components/ui/luxury-sidebar.tsx` | Heavy dark background, saturated cyan highlights, dense widgets | Replaced with clean slim enterprise sidebar (`#FFFFFF` background, `#F1F5F9` subtle hover, `#E2E8F0` borders, accessible icons). |
| `modules/dashboard/components/dashboard-experience.tsx` | Giant 3-line hero typography (`text-5xl`), glowing rainbow KPI progress tracks | Compact editorial hero with single-tier 26px heading, date stamp, concise actions, and clean 4-card metric grid. |
| `components/ui/glass-panel.tsx` | Heavy dark navy backgrounds with forced blur | Redefined for Light Enterprise: subtle white translucency (`bg-white/90`), fine hairline borders (`border-slate-200/80`), and light diffuse shadows (`shadow-sm`). |
| `modules/dashboard/modes/executive-workspace.tsx` | Opaque dark cards with low text contrast | Structured white operational cards with clear section headers, clean typography, and balanced 7/5 column grid. |
| `modules/dashboard/modes/command-workspace.tsx` | Heavy dark cards with neon accents | Crisp enterprise command cards with unified slate styling and clear tabular layouts. |
| `app/globals.css` | Hardcoded dark overrides, competing phase variables | Cleaned and unified around CSS semantic tokens: `--background`, `--card`, `--foreground`, `--muted`, `--border`, `--primary`. |

---

## 4. Typography & Color Tokens Specification

### Color Tokens (Light Enterprise Mode)
- **Canvas Background (`--background`):** `#F8FAFC` (Slate 50)
- **Primary Surface (`--card`):** `#FFFFFF` (Pure White)
- **Muted Surface (`--muted`):** `#F1F5F9` (Slate 100)
- **Primary Text (`--foreground`):** `#0F172A` (Slate 900)
- **Secondary Text (`--muted-foreground`):** `#64748B` (Slate 500)
- **Border (`--border`):** `#E2E8F0` (Slate 200)
- **Primary Accent (`--primary`):** `#1E293B` / `#0F172A` (Deep Slate / Navy)
- **Semantic Status:**
  - Success / Ready: `#059669` (Emerald 600) / Background: `#ECFDF5`
  - Warning / Threat: `#D97706` (Amber 600) / Background: `#FFFBEB`
  - Destructive / Critical: `#DC2626` (Red 600) / Background: `#FEF2F2`
  - Informational: `#2563EB` (Blue 600) / Background: `#EFF6FF`

### Typography Hierarchy
- **Typeface:** `Geist Sans` (`--font-sans`) for all UI and headings.
- **Monospace:** `Geist Mono` (`--font-mono`) strictly for numeric values, telemetry rates, and identifiers.
- **Hierarchy:**
  - Page Heading: `26px (1.625rem)`, semi-bold (`font-semibold`), leading tight.
  - Section Heading: `16px (1rem)`, semi-bold (`font-semibold`).
  - Card Title: `14px (0.875rem)`, medium (`font-medium`), slate-900.
  - Body Text: `14px (0.875rem)`, regular (`font-normal`), slate-600.
  - Metadata / Micro-labels: `12px (0.75rem)`, medium (`font-medium`), sentence-case.
  - KPI Big Numbers: `28px (1.75rem)`, bold (`font-bold`), font-mono.

---

## 5. Accessibility & Responsiveness Strategy

1. **WCAG 2.1 AA Contrast Compliance:**
   - Normal text against canvas: `#0F172A` on `#F8FAFC` exceeds 14:1 contrast ratio (well above 4.5:1 requirement).
   - Secondary text: `#64748B` on `#FFFFFF` exceeds 4.8:1 contrast ratio.
2. **Interactive Elements:**
   - Consistent 38px/40px touch targets.
   - Visible outline focus rings (`focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2`).
3. **Responsive Breakpoints:**
   - `< 768px` (Mobile): Sidebar collapses into an accessible slide-over sheet; search collapses into icon button; KPI grid reflows into single column; sticky header maintains one clean row with zero breadcrumb truncation.
   - `768px - 1024px` (Tablet): Sidebar in icon-only or drawer mode; 2x2 KPI grid.
   - `> 1024px` (Desktop): Full persistent sidebar, centered search command bar, full segmented controls.
