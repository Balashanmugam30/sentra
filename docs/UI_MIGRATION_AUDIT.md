# Sentra — UI Migration Audit

## Overview
This audit tracks all modified, retired, and modernized components across the Sentra web application codebase during the Phase 9 Final Design Reset.

---

## 1. Component Migration Inventory

| Component Path | Previous State | Migrated State | Status |
| :--- | :--- | :--- | :--- |
| `components/brand/sentra-logo.tsx` | Non-existent | Geometric vector wave SVG mark + Manrope wordmark | **New Component** |
| `components/brand/wave-accent.tsx` | Non-existent | Light porcelain ambient wave gradient ribbons | **New Component** |
| `components/landing/landing-experience.tsx` | Hardcoded `bg-black`, `bg-[#010101]`, dark sections | Porcelain `#f8fafc`, light sections, modern footer | **Modernized** |
| `components/landing/navbar.tsx` | Fixed dark link | Glass porcelain navbar with `SentraLogo`, nav links, CTAs | **Modernized** |
| `components/landing/hero-section.tsx` | `AuroraBackground`, `DotGrid`, `text-white` | Light hero with `WaveAccent`, Manrope typography, proof bar | **Modernized** |
| `components/landing/feature-section.tsx` | `via-black/60 to-black`, `text-white/90` | Pure white cards with `#e2e8f0` borders, pastel tag badges | **Modernized** |
| `components/landing/system-preview-section.tsx` | Dark terminal aesthetic | Light command console preview with status telemetry | **Modernized** |
| `components/landing/ai-section.tsx` | Dark cards with glowing purple bars | Porcelain explainable AI card with progress confidence bars | **Modernized** |
| `components/landing/cta-section.tsx` | Dark aurora section with dark buttons | Clean porcelain CTA with subtle wave background | **Modernized** |
| `modules/auth/components/login-screen.tsx` | Dark aurora and dot grid overlay | Porcelain canvas with `WaveAccent` | **Modernized** |
| `components/auth/PermissionGate.tsx` | Dark rounded-32px loading card | Light rounded-2xl white card with blue accents | **Modernized** |
| `modules/dashboard/components/top-bar.tsx` | Dark linear-gradient, breadcrumb-only | Full-width GlobalHeader with logo, primary nav, More menu | **Modernized** |
| `components/app/app-sidebar.tsx` | Pinned 280px desktop sidebar export | Responsive mobile-only slide-out drawer (`mobileOpen`) | **Modernized** |
| `components/ui/luxury-sidebar.tsx` | Always rendered desktop sidebar | Pinned desktop hidden (`lg:hidden`), drawer mode enabled | **Modernized** |
| `app/app/settings/page.tsx` | Exposed "Dark" option | Standardized to Enterprise Light & Adaptive System | **Modernized** |
| `app/layout.tsx` | Read dark from localStorage | Deterministically migrates `"dark"` to `"light"` | **Hardened** |
| `hooks/use-theme.ts` | Hydrated dark from localStorage | Normalizes saved theme to `"light"` | **Hardened** |
| `app/globals.css` | `margin-left: 304px`, dark gradients | `margin-left: 0`, white surface tokens, light sidebar | **Modernized** |

---

## 2. Legacy Cleanup and Deprecations
* **DotGrid and AuroraBackground:** Removed from the active user paths on both Landing (`/`) and Login (`/login`).
* **Fixed 280px Left Sidebar:** Retired from the desktop layout; desktop interface is 100% header-led.
* **Hardcoded Dark Tokens:** Removed inline dark linear-gradients and radial overlays in shell containers.
