# Sentra — Design Reset Root Cause Analysis

## Executive Summary
This document provides a forensic engineering investigation into why previous redesign attempts failed to deliver the intended light-first enterprise interface and why the product owner repeatedly observed dark mode, harsh neon effects, and layout clutter in production.

---

## 1. Identified Root Causes

### Root Cause A: LocalStorage Theme Preference Persistence & Hydration Race
* **Mechanism:** In `app/layout.tsx` (inline script) and `hooks/use-theme.ts`, client state was hydrated via `localStorage.getItem("sentra-theme")`. If a user or automated test runner had ever selected or defaulted to `"dark"` mode in a prior session, the browser persisted `"dark"` in local storage.
* **Impact:** Even when default code set `theme: "light"`, returning visitors and persistent browser profiles were immediately re-injected with the `.dark` CSS class on `document.documentElement`.
* **Resolution:** In both `app/layout.tsx` and `hooks/use-theme.ts`, deterministic migration was introduced to normalize any stored `"dark"` preference to `"light"`. The system now explicitly standardizes on Enterprise Light.

### Root Cause B: Token Overrides and Hardcoded Backgrounds
* **Mechanism:** In `app/globals.css`, multiple legacy style rules contained hardcoded hex colors such as `#05070b`, `#07090d`, and `rgba(16,24,44,0.68)`. Specifically:
  * `.sentra-topbar-inner` had an inline linear gradient: `bg-[linear-gradient(145deg,rgba(16,24,44,0.68)_0%,rgba(8,13,28,0.78)_100%)]`.
  * `.sentra-auth-shell .sentra-shell-main` contained `margin-left: calc(var(--sentra-sidebar-width) + 24px) !important;`.
  * `.sentra-app-sidebar` had `radial-gradient(circle..., rgba(5,7,11,0.76))`.
* **Impact:** Even in light mode, components were visually rendered as dark navy blocks with glowing cyan borders.
* **Resolution:** Stripped hardcoded dark gradients from top-bar and sidebars; replaced with clean porcelain tokens (`#ffffff` surface, `#f8fafc` canvas, `#e2e8f0` hairline borders, and `#0f172a` deep slate text).

### Root Cause C: Landing Page Hardcoded Black Canvas
* **Mechanism:** `components/landing/landing-experience.tsx`, `hero-section.tsx`, `feature-section.tsx`, `system-preview-section.tsx`, `ai-section.tsx`, and `cta-section.tsx` explicitly hardcoded `bg-black`, `bg-[#010101]`, `AuroraBackground`, and `DotGrid`.
* **Impact:** The public marketing front door appeared as a cyber-hacker aesthetic rather than an enterprise operations platform.
* **Resolution:** Replaced all hardcoded black backgrounds with porcelain canvas (`#f8fafc`), removed `DotGrid` and `AuroraBackground`, and introduced `WaveAccent` (soft ambient pastel watercolor waves) and `SentraLogo`.

### Root Cause D: Navigation Frame Architecture (Pinned 280px Sidebar)
* **Mechanism:** `components/app/app-shell.tsx` rendered `AppSidebar` pinned at 280px with CSS enforcing `margin-left: calc(var(--sentra-sidebar-width) + 24px) !important;`.
* **Impact:** On desktop viewports (1440px), the dashboard was compressed into an asymmetrical container, causing KPI cards and operation feeds to look cramped.
* **Resolution:** Replaced the permanent 280px left sidebar with a full-width header-led application navigation (`TopBar` with Sentra mark, workspace mode pills, primary horizontal routes, and `More` dropdown). Mobile viewports retain a slide-out drawer on demand.

---

## 2. Verification Evidence
All 4 root causes have been eliminated in the source code and verified across 11 Playwright screenshots under desktop, tablet, and mobile viewports.
