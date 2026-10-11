# SENTRA — Dashboard Color & Layout Forensic Root-Cause Analysis

## Executive Summary

Visual inspection of the rejected production deployment at `https://sentra-01.vercel.app/app` revealed two critical architectural defects:
1. **Split-Theme Mixed Interface**: The top navigation rendered as white/light, while the application canvas, hero, KPI panels, and summary cards rendered as dark navy/blue with cyan, pink, and green radial highlights. In dark mode browser contexts, text colors furthermore washed out into unreadable white-on-white.
2. **Missing Desktop Left Sidebar & Crowded Horizontal Header**: The primary desktop left-sidebar was completely suppressed and replaced by an overcrowded single-row horizontal navigation bar duplicating every route and workspace mode in the header.

This document identifies the exact lines of code, CSS selectors, computed values, and runtime behaviors responsible, and defines the remediation architecture while strictly preserving the protected dark cyber public landing and login interfaces.

---

## 1. Root Cause A: Missing Desktop Left Sidebar

### 1.1 Forensic Source Evidence

1. **`components/app/app-sidebar.tsx` (Lines 6–12)**:
   ```typescript
   export function AppSidebar(props: ComponentProps<typeof LuxurySidebar>) {
     // Mobile-only slide-out drawer. Desktop uses the top GlobalHeader navigation.
     if (!props.mobileOpen) {
       return null;
     }
     return <LuxurySidebar {...props} />;
   }
   ```
   **Behavior**: When rendered on desktop, `props.mobileOpen` evaluates to `false`. The component returned `null`, entirely unmounting the sidebar DOM from desktop rendering.

2. **`components/ui/luxury-sidebar.tsx` (Line 615)**:
   ```tsx
   <aside
     aria-label="Sentra primary navigation"
     className={`sentra-app-sidebar sentra-luxury-sidebar sentra-phase12-sidebar glass-nav ${collapsed ? "is-collapsed" : ""} ${
       mobileOpen ? "is-mobile-open" : "hidden"
     } lg:hidden`}
   ```
   **Behavior**: Even if mounted, the `lg:hidden` utility class explicitly forced `display: none` at desktop viewports (`min-width: 1024px`).

3. **`modules/dashboard/components/top-bar.tsx` (Lines 190–280)**:
   Because the left sidebar was disabled on desktop, the top navigation was crammed with:
   - Workspace mode switchers (`Executive`, `Command`, `Demo`, `Crisis`)
   - Primary route links (`Dashboard`, `Incidents`, `Operations`, `Analytics`, `AI Council`, `Live Twin`)
   - "More" dropdown (`SOC Console`, `Predictive AI`, `Resources`, `Recovery`, `Field Mobile App`, etc.)
   This forced all global controls, navigation links, search, system status, notifications, and profile menus onto a single congested line.

4. **`app/globals.css` (Line 3445 & 4165)**:
   ```css
   .sentra-auth-shell .sentra-shell-main {
     margin-left: 0 !important;
   }
   ```
   This collapsed the left gutter, allowing content to stretch across the full width without leaving room for a persistent sidebar.

---

## 2. Root Cause B & C: Split Theme & Dark Content

### 2.1 Forensic Source Evidence

1. **System Theme Evaluation in `hooks/use-theme.ts` (Lines 30–44)**:
   ```typescript
   const resolvedTheme =
     theme === "system"
       ? window.matchMedia("(prefers-color-scheme: dark)").matches
         ? "dark"
         : "light"
       : theme;

   if (resolvedTheme === "dark") {
     root.classList.add("dark");
   } else {
     root.classList.remove("dark");
   }
   ```
   **Behavior**: On any operating system or browser configured with dark mode (the standard developer/operator baseline), `prefers-color-scheme: dark` evaluated to `true`. This added the `.dark` class to `document.documentElement` (`<html class="dark">`).

2. **Isolated White TopBar Override in `app/globals.css` (Lines 3490–3499)**:
   ```css
   .sentra-auth-shell .sentra-topbar-inner {
     min-height: 52px;
     border: 1px solid var(--border, #e2e8f0) !important;
     border-radius: 12px !important;
     background: rgba(255, 255, 255, 0.88) !important;
     box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04) !important;
     color: var(--text, #0f172a) !important;
   }
   ```
   **Behavior**: The topbar was forced to white with `!important` declarations, ignoring the `.dark` class.

3. **Active Dark Workspace Selectors and Utilities**:
   While the topbar was forced to white, the main dashboard content remained bound to dark styles:
   - **Hero (`app/globals.css`, Line 2478)**:
     ```css
     .dark .sentra-phase7-hero {
       background:
         linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.024)),
         rgba(18, 22, 32, 0.72) !important;
       box-shadow: 0 28px 84px rgba(0, 0, 0, 0.28) !important;
     }
     ```
     Computed background: `rgba(18, 22, 32, 0.72)` (dark navy).
   - **KPI Cards (`app/globals.css`, Line 2540)**:
     ```css
     .sentra-phase7-kpi-pill {
       background:
         linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.026)),
         rgba(255, 255, 255, 0.028) !important;
     }
     ```
   - **`components/ui/glass-panel.tsx` (Lines 20, 24, 31, 33, 36)**:
     ```tsx
     dark:bg-[linear-gradient(145deg,rgba(16,24,44,0.58)_0%,rgba(8,13,28,0.68)_100%)]
     dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.16),transparent_65%)] /* Cyan glow */
     dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.16),transparent_65%)] /* Pink glow */
     dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.16),transparent_65%)] /* Green glow */
     ```
   - **`modules/dashboard/modes/executive-workspace.tsx` (Lines 48, 60, 93)**:
     Contained hardcoded utility classes `dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70`.

4. **Result**:
   The header computed to white (`rgba(255, 255, 255, 0.88)`), while the content area computed to navy blue (`rgba(18, 22, 32, 0.72)`), creating a jarring split-theme interface. When white text was triggered on partially lightened elements, numbers and text washed out completely into illegibility.

---

## 3. Remediation Architecture

### 3.1 Two-Column Responsive Layout Restoration
1. **`AppSidebar`**: Provide persistent, visible left sidebar on desktop (`width: 240px`, collapsible to `72px`), and an accessible slide-out drawer on mobile/tablet.
2. **`TopBar`**: Remove redundant horizontal navigation links. Dedicate `TopBar` exclusively to mobile burger button, contextual breadcrumbs / workspace switcher, global search command palette, system status, notifications, and profile dropdown.
3. **`AppShell`**: Implement clean flexbox layout where sidebar occupies fixed left space and `sentra-shell-main` fills remaining width without margin hacks.

### 3.2 Light Lime/Wave Enterprise Palette
Scoped strictly to `.sentra-auth-shell`:
- **Canvas**: `#F7F9F5` (warm light neutral)
- **Primary surface**: `#FFFFFF`
- **Secondary surface**: `#F1F5F0`
- **Text**: `#1F2937` (main ink), `#586579` (supporting), `#738096` (muted)
- **Borders**: `#E4E9E1` (fine), `#D3DBD0` (strong)
- **Lime Accent**: `#84CC16` (accent), `#3F6212` (deep olive text), `#F1F8E5` (subtle pale lime surface), `#ECF7D9` (active nav fill)
- **Wave Brand Accent**: Subtle soft cyan `#DFF5F5` and soft lilac `#EEE9FF` as low-opacity ambient accents behind headers.

### 3.3 Strict Isolation from Protected Landing & Login Pages
- All CSS fixes will be scoped exclusively to `.sentra-auth-shell` and its descendants.
- Zero changes to the 11 protected files:
  - `components/landing/hero-section.tsx`
  - `components/landing/landing-experience.tsx`
  - `components/landing/navbar.tsx`
  - `components/landing/feature-section.tsx`
  - `components/landing/ai-section.tsx`
  - `components/landing/cta-section.tsx`
  - `components/landing/system-preview-section.tsx`
  - `modules/auth/components/login-screen.tsx`
  - `components/security/login-form.tsx`
  - `components/landing/aurora-background.tsx`
  - `components/landing/dot-grid.tsx`
  - `components/brand/wave-accent.tsx`
- Baseline screenshots of landing and login confirm 100% preservation.
