# SENTRA — UI COMPONENT RESEARCH & INTEGRATION

**Document Date:** October 11, 2026  
**Tools Consulted:** `shadcn` MCP, `21st.dev` MCP, Modern Web Standards  
**Focus:** Enterprise Light-First Design, Collapsible Sidebar Scaffolding, Responsive Topbar, Restrained Wave Elements  

---

## 1. Components Researched & Evaluated

### 1.1 shadcn Blocks & Primitives
- **`sidebar-01` (registry:block):**
  - *Pattern:* Navigation categorized by semantic operational sections (`Core`, `Operations`, `Infrastructure`, `Admin`).
  - *Adoption:* Used to structure Sentra's left sidebar with clear group labels, SVG icon pairings, and active route states.
- **`sidebar-07` (registry:block):**
  - *Pattern:* Dual-width collapsible sidebar (`240px` expanded, `72px` collapsed) using CSS custom properties (`--sentra-sidebar-width`) and local storage state persistence.
  - *Adoption:* Implemented directly in `components/ui/luxury-sidebar.tsx` and `components/app/app-shell.tsx`.
- **`dashboard-01` (registry:block):**
  - *Pattern:* Structured dashboard layout with executive summary cards, 4-column KPI cards, and secondary detail panels.
  - *Adoption:* Applied across `ExecutiveWorkspace` and `DashboardExperience`.

### 1.2 21st.dev Catalog Research
- **`Dashboard Sidebar` by arunjdass (ID: `14941`):**
  - *Pattern:* Premium dual-theme dashboard & sidebar shell with Charcoal Ink (dark) and Alabaster (light) architectural palettes, micro-contrast layout spacing, and collapsible multi-tiered navigation.
  - *Adoption:* Directly informed our Alabaster (`#F7F9F5`) canvas, Pure White (`#FFFFFF`) card surfaces, and subtle `#E4E9E1` border hierarchy.
- **`Dashboard with Collapsible Sidebar` by uniquesonu (ID: `5556`):**
  - *Pattern:* Interactive collapsible sidebar with Lucide icon alignment and CSS variable tokenization.
  - *Adoption:* Validated mobile drawer collapse and drawer backdrop interaction.

### 1.3 React Bits & Wave Brand Identity
- **Restrained Wave Integration:**
  - *Pattern:* Gentle 2px top gradient ribbon (`#06B6D4` cyan to `#8B5CF6` lilac) applied to executive hero cards, providing brand continuity with Sentra's landing page without dark navy canvas bleed or neon clutter.
  - *Palette:* Low-opacity ambient wave tints (`#E8F1FF`, `#E1F5F4`, `#F0EAFF`, `#E9ECFF`).

---

## 2. Integrated Design System Tokens

```css
:root {
  --app-background: #F7F9F5;
  --app-foreground: #1F2937;
  --app-surface: #FFFFFF;
  --app-surface-muted: #F1F5F0;
  --app-surface-elevated: #FFFFFF;
  --app-border: #E2E8DE;
  --app-border-strong: #CBD5C0;
  --app-foreground-muted: #586579;
  --app-foreground-subtle: #738096;
  --app-primary: #1F2937;
  --app-primary-foreground: #FFFFFF;
  --app-accent: #84CC16;
  --app-accent-foreground: #3F6212;
  --app-success: #16A34A;
  --app-warning: #D97706;
  --app-critical: #DC2626;
  --app-info: #0284C7;
  --app-focus-ring: #84CC16;
  --app-wave-blue: #E8F1FF;
  --app-wave-cyan: #E1F5F4;
  --app-wave-lilac: #F0EAFF;
  --app-wave-periwinkle: #E9ECFF;
}
```

---

## 3. Navigation Architecture Decision: Field Mobile App

- **Audit Findings:**
  - Route `/mobile` and sub-routes (`/mobile/home`, `/mobile/sos`, `/mobile/responder`, `/mobile/staff`, `/mobile/offline`) provide a dedicated progressive web companion for field personnel and first responders with distinct SOS trigger workflows and offline capabilities.
  - It is not a dead link or placeholder, but it does not belong in the primary executive/operator `Operations` navigation cluster.
- **Decision:**
  - Preserved the `/mobile` routes and PWA manifests.
  - Relocated `Field Mobile App` out of the primary `Operations` group into a secondary `Field Tools` group with an appropriate role requirement, keeping the primary operations navigation focused on incidents, execution, resources, and recovery.
