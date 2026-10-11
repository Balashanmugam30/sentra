# SENTRA — Dashboard Design References & Component Selection

## Overview

To transition Sentra from an overcrowded, split-theme interface into a polished enterprise operations console, we analyzed design patterns and component architectures across leading industry references, shadcn blocks, 21st.dev components, and SaaS design systems.

This document records the exact references evaluated, the selected patterns, the design rationale, and their integration targets in Sentra.

---

## 1. Reference Architecture Evaluation

### Reference A: Linear's Interface Refresh (`linear.app/now/behind-the-latest-design-refresh`)
- **Key Disciplines**:
  - Restrained typographic scale (tight, crisp, sans-serif display, sentence-case hierarchy).
  - Quiet, low-contrast navigation rail that remains anchored without competing with primary data.
  - Single-line compact topbars dedicated to context and search rather than route duplication.
  - Consistent padding and vertical alignment across all cards.
- **Application in Sentra**:
  - Adopted for the revised `TopBar` and `LuxurySidebar`. Removed the giant horizontal route pills; streamlined the topbar into an uncluttered context bar.

### Reference B: shadcn Sidebar & Dashboard Blocks (`ui.shadcn.com`)
- **Evaluated Blocks**:
  - `sidebar-01`: Grouped navigation with categorical headers (`Overview`, `Operations`, `Administration`).
  - `sidebar-07`: Icon-rail collapsible state with tooltip-accessible hover triggers.
  - `sidebar-08`: Inset navigation structure with micro-contrast layout spacing.
  - `dashboard-01`: Structured metric cards with clean label-value-meta hierarchy and clear tabular numbers.
- **Application in Sentra**:
  - Re-architected Sentra's `AppSidebar` and `LuxurySidebar` following the `sidebar-01` / `sidebar-08` information architecture with categorized navigation groups:
    - **Overview**: Dashboard
    - **Intelligence**: Analytics, AI Council, Predictions, Reports
    - **Operations**: Incidents, Operations, Resources, Recovery, Field Mobile App
    - **Environment**: Live Twin, SOC
    - **Administration**: Cloud, Team, Settings
  - Metric cards rebuilt with `dashboard-01` discipline: white surfaces (`#FFFFFF`), crisp borders (`#E4E9E1`), subtle drop shadows, tabular numerals, and status badges.

### Reference C: 21st.dev Light Sidebar (`docs.21st.dev`)
- **Evaluated Components**:
  - `wensity/sidebar` [id: 31454]: Collapsible app sidebar that shrinks to an icon rail with active animated pill.
  - `arunjdass/dashboard-sidebar` [id: 14941]: Alabaster (light) architectural palette with multi-tiered navigation and micro-contrast spacing.
- **Application in Sentra**:
  - Adopted the Alabaster micro-contrast spacing and active item styling: pale lime surface (`#F1F8E5` / `#ECF7D9`), olive/dark ink text (`#1F2937`), and subtle lime indicator (`#84CC16`).

### Reference D: React Bits & Wave Brand Harmony (`reactbits.dev`)
- **Pattern**:
  - Restrained ambient wave geometry rather than heavy dark gradients or neon glows.
- **Application in Sentra**:
  - Incorporated soft, low-opacity wave ribbons using the landing brand colors (soft cyan `#DFF5F5`, pale sky `#E5F0FF`, and soft lilac `#EEE9FF`) as ambient background accents behind the Executive hero and section headers, harmonizing with the landing brand without recreating dark cyber visuals.

### Reference E: SaaS Applications (Inspo / Mobbin: Amie, Capacities, Dust)
- **Pattern**:
  - Warm neutral canvas (`#F7F9F5`) providing eye comfort over pure harsh `#FFFFFF` while keeping card surfaces pure white (`#FFFFFF`) for crisp elevation.
  - High-contrast typography (`#1F2937`) ensuring WCAG AAA accessibility.

---

## 2. Integrated Color System

| Token | Value | Role |
|---|---|---|
| **Canvas** | `#F7F9F5` | Natural warm light background for entire app workspace |
| **Surface Primary** | `#FFFFFF` | Metric cards, panels, sidebar, dialogs |
| **Surface Secondary** | `#F1F5F0` | Search inputs, table headers, hover states |
| **Text Primary** | `#1F2937` | Headings, metric values, primary labels |
| **Text Supporting** | `#586579` | Subtext, card descriptions |
| **Text Muted** | `#738096` | Meta tags, timestamps, icons |
| **Border Fine** | `#E4E9E1` | Card outlines, dividers |
| **Border Strong** | `#D3DBD0` | Focus outlines, active borders |
| **Lime Accent** | `#84CC16` | Active navigation pill, status dots, focus rings |
| **Lime Surface** | `#F1F8E5` | Active item background, status badges |
| **Olive Ink** | `#3F6212` | Active item text, high-emphasis status |
| **Ambient Cyan** | `#DFF5F5` | Subtle wave brand accent |
| **Ambient Lilac** | `#EEE9FF` | Subtle wave brand accent |

---

## 3. Component Integration Matrix

| Component File | Role in Sentra | Changes Applied |
|---|---|---|
| `components/app/app-sidebar.tsx` | Desktop & Mobile Sidebar Container | Restored desktop mounting; removed `if (!props.mobileOpen) return null;` |
| `components/ui/luxury-sidebar.tsx` | Nav Rail & Information Architecture | Removed `lg:hidden`; styled with light alabaster palette, lime active pills, and categorized groups |
| `components/app/app-shell.tsx` | Layout Shell | Two-column desktop flex layout; sidebar anchored left, main scrollable right |
| `modules/dashboard/components/top-bar.tsx` | Global Action Cockpit | Stripped redundant horizontal route links; added mobile burger trigger; refined search, status, and profile |
| `components/ui/workspace-shell.tsx` | Hero & Page Header Container | Replaced dark navy hero with crisp white card, editorial title, and subtle wave accent |
| `modules/dashboard/modes/executive-workspace.tsx` | Executive Dashboard | Rebuilt 4 KPI cards and 2-column layout in light theme; eliminated dark radial glows |
| `components/ui/glass-panel.tsx` | Elevated Panel Primitive | Defaults to pure white `#FFFFFF` surface with fine `#E4E9E1` border in app shell |
| `app/globals.css` | Scoped Application Styling | Enforced light theme inside `.sentra-auth-shell` regardless of root `.dark` class |
