# Sentra — Design Reference Selection & Brand Guidelines

## 1. Visual Philosophy: Porcelain & Calibrated Wave Intelligence
Sentra's aesthetic departs from conventional "dark-mode neon cybersecurity" tropes. It adopts the visual language of high-reliability mission systems (Linear, Datadog modern UI, Stripe Dashboard, Apple Pro tools):
* **Canvas:** Soft neutral porcelain (`#f8fafc` / `#f7f9fc`).
* **Surfaces:** Pure white (`#ffffff`) elevated cards with micro-elevation (`box-shadow: 0 2px 12px -4px rgba(0,0,0,0.04)`).
* **Borders:** Hairline slate dividers (`#e2e8f0` / `border-slate-200`).
* **Typography:** Manrope font display headings with deep slate contrast (`#0f172a`), slate-600 body text (`#475569`), and font-mono data chips.
* **Accent & Brand:** Geometric flowing wave motifs using gentle sky blue (`#38bdf8`), soft indigo (`#818cf8`), and mint teal (`#2dd4bf`). Zero pitch-black canvases, zero neon lasers, zero distracting dot grids.

---

## 2. Component Design Specifications

### Geometric Vector Logo (`SentraLogoMark`)
* Multi-layer precision geometric curves evoking dynamic wave pulses and architectural containment.
* Accompanying geometric wordmark "SENTRA" with subtle uppercase pill badge "OS" and subtitle "Crisis Intelligence".
* Scales seamlessly from 24px mobile icon to desktop brand header.

### Ambient Wave Ribbon Layer (`WaveAccent`)
* Non-blocking, GPU-accelerated SVG watercolor ribbons rendered in pale sky/violet/teal gradients.
* Subdued opacity (40%), blending softly into `#f8fafc`.
* Replaces the legacy `AuroraBackground` and `DotGrid`.

### Header-Led Navigation Architecture (`TopBar`)
* **Left:** Geometric Sentra logo + quick workspace mode switcher (`Executive`, `Command`, `Demo`, `Crisis`).
* **Center:** Primary horizontal navigation tabs:
  * `Dashboard` (`/app`)
  * `Incidents` (`/app/incidents`)
  * `Operations` (`/operations/execution`)
  * `Analytics` (`/app/analytics`)
  * `AI Council` (`/app/ai-council`)
  * `Live Twin` (`/twin/live`)
  * `More` dropdown (covering SOC, Predictions, Resources, Recovery, Mobile, Cloud, Reports, Team, Settings).
* **Right:** Command search (`Ctrl K`), System Live telemetry badge with pulsing green indicator, Notifications center, RoleBadge, and User Profile avatar with preferences modal.

### Responsive Breakpoint Strategy
* **Desktop (1440px):** Full-width 1600px container, 4-column balanced KPI grid, horizontal navigation bar, no pinned left sidebar.
* **Tablet (768px):** Clean hamburger menu, logo, search icon, live badge, notifications, and profile. Stacked 1-column KPI grid with zero horizontal clipping.
* **Mobile (390px):** Compact vector mark, search icon, notification count, role badge, profile avatar, full-width content cards.
