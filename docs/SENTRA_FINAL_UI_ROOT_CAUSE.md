# SENTRA — FORENSIC UI ROOT-CAUSE ANALYSIS

**Document Date:** October 11, 2026  
**Target Route:** `https://sentra-01.vercel.app/executive` and associated authenticated product routes  
**Status:** Root Causes Isolated & Remediated  

---

## 1. Verified Root Causes Summary

Through runtime inspection and source code analysis, four interconnected root causes were identified that created the split-theme interface (light navigation alongside black canvas, dark navy heroes, and invisible white text on white KPI cards):

### Root Cause A: Isolated Standalone Route (`/executive`) with Legacy Dark Canvas
- **Source File:** `app/executive/page.tsx`
- **Active Code:**
  ```tsx
  <main className="sentra-analytics-shell px-5 py-8 text-[var(--text)] md:px-8">
    <div className="relative z-10 mx-auto max-w-[1520px]">
      <ExecutiveAnalyticsCommandCenter ... />
    </div>
  </main>
  ```
- **Active CSS in `app/globals.css` (lines 2758-2763 & lines 3261-3266):**
  ```css
  .sentra-analytics-shell {
    background:
      radial-gradient(circle at 14% -10%, rgba(125, 211, 252, 0.12), transparent 34rem),
      radial-gradient(circle at 82% 0%, rgba(139, 92, 246, 0.1), transparent 30rem),
      linear-gradient(180deg, #05070b 0%, #080d16 54%, #05070b 100%);
  }
  ```
- **Runtime Impact:** While `AppShell` and `luxury-sidebar` rendered light backgrounds (`#FFFFFF` and `#F7F9F5`), `.sentra-analytics-shell` rendered on the inner `<main>` container, forcing a pitch-black background (`#05070b` / `#03050a`).

---

### Root Cause B: Invisible White Text on Light KPI Surfaces (`AnimatedKpiCard`)
- **Source File:** `components/analytics/premium-charts.tsx` (lines 120–158)
- **Active Code:**
  ```tsx
  export function AnimatedKpiCard({ ... }) {
    return (
      <motion.article
        className={cn(
          "sentra-analytics-kpi group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_56px_rgba(0,0,0,0.22)] backdrop-blur-2xl",
          "sentra-phase12-kpi-card",
          className,
        )}
      >
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
          <CountUp ... />
        </p>
        <p className="mt-3 min-h-10 text-sm leading-5 text-white/56">{detail}</p>
  ```
- **Runtime Conflict:** Because previous global rules forced cards to render with white backgrounds (`bg-white` / `rgb(255, 255, 255)`), `AnimatedKpiCard` rendered white surfaces, but its inner labels and values were hard-coded to `text-white/42`, `text-white`, and `text-white/56`.
- **Measured Computed Styles in Playwright:**
  - Card background: `rgb(255, 255, 255)` (Pure White)
  - Card title color: `oklab(0.999994 0.0000455678 0.0000200868 / 0.42)` (White at 42% opacity)
  - Result: 100% invisible text on white background!

---

### Root Cause C: Dark Navy/Blue Hero & Briefing Cards in Analytics Modules
- **Source File:** `components/analytics/premium-charts.tsx` (lines 327–357 & 405–438)
- **Active Code:**
  ```tsx
  <motion.header
    className="sentra-analytics-hero rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.045] ..."
  >
  ...
  <motion.section
    className="overflow-hidden rounded-[34px] border border-cyan-100/12 bg-[linear-gradient(145deg,rgba(125,211,252,0.10),rgba(139,92,246,0.07),rgba(255,255,255,0.035))] p-6 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-7"
  >
  ```
- **Active CSS in `app/globals.css` (lines 2785–2792):**
  ```css
  .sentra-analytics-hero {
    background:
      radial-gradient(circle at 12% 0%, rgba(125, 211, 252, 0.13), transparent 28rem),
      radial-gradient(circle at 82% 4%, rgba(139, 92, 246, 0.11), transparent 26rem),
      linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.024)),
      rgba(18, 22, 32, 0.72);
  }
  ```
- **Runtime Impact:** Even in light mode, `.sentra-analytics-hero` had a winner-rule in `globals.css` that painted it `rgba(18, 22, 32, 0.72)` (dark navy), while inner briefing subcards had `bg-black/20` and `text-white/70`.

---

### Root Cause D: Route Divergence Between `/app?mode=executive` and `/executive`
- When the user visited `https://sentra-01.vercel.app/app?mode=executive`, `DashboardExperience` rendered the redesigned `ExecutiveWorkspace` (which was already light and clean).
- However, when navigating to `https://sentra-01.vercel.app/executive`, Next.js rendered `app/executive/page.tsx`, which was loading the legacy `ExecutiveAnalyticsCommandCenter` module inside the black `.sentra-analytics-shell`.
- Furthermore, `OperationalAnalyticsWorkspace` in `/app/analytics` was also embedding `ExecutiveAnalyticsCommandCenter`.

---

## 2. Permanent Architectural Remedies

1. **Unify `/executive` with Executive Workspace:**  
   Wire `app/executive/page.tsx` to render `DashboardExperience` with `initialMode="executive"` wrapped in `<ProtectedWorkspaceShell>`, ensuring both `/executive` and `/app?mode=executive` render the identical, high-contrast, Alabaster + Lime 4-KPI leadership intelligence layout specified in Section 7.1.

2. **Systemic Elimination of Legacy Dark Classes in `premium-charts.tsx`:**  
   Replace all instances of `text-white`, `border-white/10`, `bg-black/20`, and dark ECharts themes with semantic design tokens:
   - Primary text: `#1F2937`
   - Secondary text: `#586579`
   - Muted text: `#738096`
   - Borders: `#E4E9E1`
   - Surface: `#FFFFFF`
   - Inner card surface: `#F1F5F0`
   - Accent: `#84CC16` / `#3F6212`

3. **Neutralize `.sentra-analytics-*` in `app/globals.css`:**  
   Replace black background gradients (`#05070b`, `#03050a`) and dark navy backgrounds (`rgba(18, 22, 32, 0.72)`) with `var(--app-background, #F7F9F5)` and `var(--app-surface, #FFFFFF)`.

4. **Typography Migration:**  
   Migrate display font in `app/layout.tsx` from `Manrope` to `Plus_Jakarta_Sans` via `next/font/google` and ensure `--font-display`, `--font-sans`, and `--font-mono` are applied consistently.
