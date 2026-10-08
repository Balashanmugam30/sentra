# Sentra Liquid Glass Design System 3.0

> **Canonical Visual Standard for Sentra — AI Crisis Intelligence & Continuous Tactical Operations OS**

---

## 1. Executive Design Philosophy

Sentra is a mission-critical operating system deployed by emergency response coordinators, incident command staff, structural engineers, and field responders during active, life-safety events.

The user interface must convey **calm, authoritative, high-trust, operational clarity**.

### What Sentra Is NOT:
- **Not Cyberpunk / Gaming Neon**: No garish green/magenta glow, no scanlines, no faux-hacker terminals.
- **Not Generic AI SaaS**: No ubiquitous purple gradient cards, sparkling stars, or empty "magic" widgets.
- **Not Crypto / Web3**: No aggressive charts, flashing green/red candles, or token metrics.

### What Sentra IS:
- **Liquid Glass Materials (Apple visionOS & macOS Sonoma Inspired)**: Multi-layered optical glass with physical depth, subtle hairline specular edge highlights, and calibrated backdrop blur.
- **Aerospace & Mission Control Information Density**: Tabular numbers, precise telemetry readouts, clear visual hierarchy, and instant cognitive readability under high stress.
- **Calm Authority**: Deep Obsidian Midnight foundation (`#030712`) providing infinite contrast, accented by precision azure and cyan for intelligence, calm emerald for safety, controlled amber for caution, and vivid crimson for life-safety emergencies.

---

## 2. Color Foundation & Design Tokens

### 2.1 Base Palette
The foundation of Sentra is anchored in deep obsidian neutrals:

| Token | CSS Variable | Hex / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Obsidian Base** | `--liquid-base` | `#030712` | Root dark canvas background |
| **Elevated Base** | `--liquid-base-elevated` | `#070d1b` | Midground container fill |
| **Surface Base** | `--liquid-base-surface` | `#0b1528` | Elevated panel fill |
| **Foreground Text** | `--text-primary` | `#f8fafc` | Primary titles and telemetry readouts |
| **Secondary Text** | `--text-secondary` | `rgba(248, 250, 252, 0.72)` | Subtitles, labels, descriptions |
| **Muted Text** | `--text-muted` | `rgba(248, 250, 252, 0.48)` | Timestamps, metadata, hints |

---

## 3. The 3-Tier Liquid Glass Materials

Sentra employs three mathematically distinct tiers of optical glass materials, tailored to information density and cognitive priority:

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 3: Floating Command Glass                             │
│  (Command Bars, Floating HUDs, Modals, Flyouts)             │
│  • 30px Blur  • 18% Border  • Directional Specular Shine    │
├─────────────────────────────────────────────────────────────┤
│  Tier 2: Elevated Interactive Glass                         │
│  (Active Cards, Metric Displays, Navigation Docks)          │
│  • 22px Blur  • 12% Border  • Top Specular Hairline         │
├─────────────────────────────────────────────────────────────┤
│  Tier 1: Subtle Foundational Glass                          │
│  (Data Tables, Secondary Panels, Grouping Containers)       │
│  • 14px Blur  • 8% Border  • Soft Ambient Occlusion         │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Tier 1: Subtle (`.glass-tier-1` / `tier="subtle"`)
- **Backdrop Blur**: `14px` (`backdrop-filter: blur(14px)`)
- **Background**: `rgba(255, 255, 255, 0.035)`
- **Border**: `1px solid rgba(255, 255, 255, 0.075)`
- **Shadow**: `0 4px 20px -2px rgba(0, 0, 0, 0.35)`
- **Use Case**: Background grouping containers, dense telemetry lists, logs, table rows.

### 3.2 Tier 2: Elevated (`.glass-tier-2` / `tier="elevated"`)
- **Backdrop Blur**: `22px` (`backdrop-filter: blur(22px)`)
- **Background**: `linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%)`
- **Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Specular Top Highlight**: `before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/28 before:to-transparent`
- **Shadow**: `0 16px 40px -4px rgba(0, 0, 0, 0.5)`
- **Use Case**: Primary operational cards, interactive telemetry widgets, active navigation items.

### 3.3 Tier 3: Floating (`.glass-tier-3` / `tier="floating"`)
- **Backdrop Blur**: `30px` (`backdrop-filter: blur(30px)`)
- **Background**: `linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(7, 13, 27, 0.92) 100%)`
- **Border**: `1px solid rgba(255, 255, 255, 0.18)`
- **Specular Highlight**: Precision directional top and border illumination.
- **Shadow**: `0 28px 70px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.14)`
- **Use Case**: Command bars, emergency HUD overlays, action drawers, modal dialogs.

---

## 4. Semantic Status Palette (8 Operational States)

Crisis operations rely on immediate visual status recognition. Sentra provides 8 standardized semantic states:

| Status Key | Visual Color | Hex Token | Operational Meaning | Pulse Support |
| :--- | :--- | :--- | :--- | :--- |
| `safe` | Emerald / Teal | `#10b981` | Nominal operations, verified clear sectors, online mesh | Optional |
| `warning` | Amber / Gold | `#f59e0b` | Elevated caution, sensor anomaly, approaching threshold | Optional |
| `critical` | Vivid Crimson | `#ef4444` | Structural collapse, life safety threat, compromised corridor | **Active Beacon** |
| `intelligence` | Deep Cyan / Azure | `#06b6d4` | AI model reasoning, predictive vector, neural synthesis | Optional |
| `info` | Sky Blue | `#0ea5e9` | Telemetry broadcast, system telemetry, connection update | No |
| `offline` | Slate Grey | `#64748b` | Disconnected radio, hardware loss, peer mesh offline | No |
| `unknown` | Neutral Steel | `#94a3b8` | Pending verification, unconfirmed sensor stream | No |
| `executive` | Champagne Gold | `#f5d58a` | Incident Commander override, tactical command protocol | Optional |

---

## 5. Typography & Monospace Telemetry

### 5.1 Type Scales
```css
--type-display: clamp(2.75rem, 5.5vw, 4.5rem);   /* Hero stats & EOC widescreen display */
--type-h1:      clamp(2.00rem, 3.6vw, 2.75rem);   /* Primary page & incident titles */
--type-h2:      clamp(1.50rem, 2.4vw, 2.00rem);   /* Sector & section headers */
--type-h3:      clamp(1.15rem, 1.6vw, 1.35rem);   /* Card titles & modal headings */
--type-body:    0.9375rem (15px);                 /* Standard body text (1.5 line height) */
--type-body-sm: 0.8125rem (13px);                 /* Telemetry captions & meta */
--type-caption: 0.6875rem (11px);                 /* Uppercase tracking tags (tracking-widest) */
```

### 5.2 Tabular Telemetry Rule
All live numbers, timestamps, coordinates, and latency readings **must** employ tabular lining figures:
```css
font-family: var(--font-mono), ui-monospace, monospace;
font-feature-settings: "tnum" 1;
font-variant-numeric: tabular-nums;
```
This ensures zero layout jitter when live telemetry updates multiple times per second.

---

## 6. Component Primitives Reference (`components/ui/`)

### 6.1 `GlassPanel`
```tsx
import { GlassPanel } from "@/components/ui";

<GlassPanel tier="elevated" tone="default">
  <h3>Operational Sector A</h3>
  <p>Telemetry stream synchronized.</p>
</GlassPanel>
```

### 6.2 `GlassCard`
```tsx
import { GlassCard } from "@/components/ui";

<GlassCard density="normal" interactive tier="elevated">
  <p>Interactive card with hover lift and specular sheen.</p>
</GlassCard>
```

### 6.3 `StatusBadge` & `StatusDot`
```tsx
import { StatusBadge, StatusDot } from "@/components/ui";

// Status Badge with pulsing beacon
<StatusBadge pulse={true} size="md" status="critical">
  CRITICAL EMERGENCY
</StatusBadge>

// Standalone Status Dot
<StatusDot pulse size="md" status="safe" />
```

### 6.4 `MetricCard`
```tsx
import { MetricCard } from "@/components/ui";

<MetricCard
  label="Zone Containment"
  value="94.2"
  unit="%"
  delta="+2.4%"
  trend="up"
  trendLabel="vs last hr"
  status="safe"
  statusLabel="NOMINAL"
  hint="9 floors verified secure"
  interactive
/>
```

### 6.5 `Button` (44px Minimum Touch Target)
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md">
  Primary Tactical
</Button>

<Button variant="secondary" size="md">
  Elevated Glass
</Button>

<Button variant="danger" size="md">
  Critical Override
</Button>
```

### 6.6 `SearchInput` & `Input`
```tsx
import { SearchInput, Input } from "@/components/ui";

<SearchInput
  placeholder="Search telemetry feeds (⌘K)..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery("")}
/>
```

### 6.7 `SegmentedControl`
```tsx
import { SegmentedControl } from "@/components/ui";

<SegmentedControl
  value={filter}
  onChange={setFilter}
  options={[
    { value: "live", label: "Live Feeds" },
    { value: "evac", label: "Evacuation" },
    { value: "mesh", label: "Mesh Net" },
  ]}
/>
```

### 6.8 `GlassDialog` (Accessible Modal)
```tsx
import { GlassDialog } from "@/components/ui";

<GlassDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Tactical Protocol Override"
  description="Confirm evacuation vector modification."
  maxWidth="md"
>
  <p>Dialog body content...</p>
</GlassDialog>
```

### 6.9 `AlertBanner`
```tsx
import { AlertBanner } from "@/components/ui";

<AlertBanner
  severity="critical"
  title="CRITICAL: Sector B Compromised"
  description="Thermal divergence verified at Stairwell B."
  timestamp="18:32:04 UTC"
  pulse
  action={<Button size="sm" variant="danger">Reroute</Button>}
/>
```

---

## 7. Future Intelligence Visual Grammar

Sentra establishes a strict visual grammar for AI reasoning and automated decision support:
1. **Source Citation**: Every AI inference references physical sensors (e.g. FLIR Sensor 4A, Acoustic Sensor Array 12).
2. **Telemetry Age & Latency**: Timestamp and millisecond latency displayed with tabular precision.
3. **Multi-Sensor Verification**: Categorized as `verified`, `hypothetical`, `contradicted`, or `provisional`.
4. **Calibrated Confidence**: Visual gauge (0-100%) classified into:
   - **High Confidence**: ≥85% (Emerald)
   - **Moderate Confidence**: 60–84% (Cyan)
   - **Cautionary**: 40–59% (Amber)
   - **Low / Provisional**: <40% (Crimson)

### 7.1 `EvidenceCard`
```tsx
import { EvidenceCard } from "@/components/ui";

<EvidenceCard
  sourceName="FLIR Optical & Acoustic Array #04"
  sourceType="Hardware Sensor"
  timestamp="18:32:04 UTC"
  latencyMs={16}
  verification="verified"
  confidence={94}
  title="Thermal Anomaly Verified at Stairwell B"
  excerpt="Acoustic triangulation and optical sensors confirm structural obstruction."
  coordinates="37.7749° N, 122.4194° W"
  tags={["Thermal", "Floor4", "MultiSensorVerified"]}
/>
```

### 7.2 `ConfidenceIndicator`
```tsx
import { ConfidenceIndicator } from "@/components/ui";

<ConfidenceIndicator score={94} size="md" />
```

---

## 8. Responsive Viewport Standards

Sentra is continuously audited against 8 canonical tactical device viewports:

| Viewport Width | Device Category | Tactical Target Profile |
| :--- | :--- | :--- |
| **320px** | Ultra-narrow Mobile | Ruggedized field handhelds, small feature devices |
| **390px** | Standard Mobile | Field responders (iPhone 14/15, Pixel) |
| **414px** | Large Mobile | Tactical supervisors (Max/Plus devices) |
| **768px** | Tablet Portrait | Incident commander field tablet (iPad Mini/Air) |
| **1024px** | Tablet Landscape | Field command vehicle display, mobile laptop |
| **1280px** | Standard Desktop | Operations center workstation |
| **1440px** | Wide Desktop | Command Operations Center multi-feed console |
| **1728px** | Ultra-wide Desktop | Emergency Operations Center (EOC) video wall |

### Responsive Design Rules:
- **Zero Horizontal Overflow**: Every screen width down to 320px must contain zero horizontal scroll leak (`document.body.scrollWidth <= viewportWidth`).
- **Touch Targets**: All interactive controls must provide minimum `44px` height/width (`min-h-11` / `touch-target-safe`).
- **Safe Area Insets**: Floating command bars must support `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)`.

---

## 9. Accessibility Contract (WCAG AA)

- **Color Contrast**: Normal text achieves ≥ `4.5:1` contrast against Obsidian Midnight background; large text achieves ≥ `3:1`.
- **Keyboard Navigation**: Interactive controls display high-contrast visible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400/50`).
- **Reduced Motion**: All animations and pulsing beacons automatically disable when `@media (prefers-reduced-motion: reduce)` is detected.
- **Screen Reader Semantics**: Dialogs use `role="dialog"` with `aria-modal="true"`; progress gauges use `role="progressbar"` with `aria-valuenow`.

---

## 10. Design System QA Route

The interactive design system gallery and inspection route is located at:

**`https://sentra-01.vercel.app/app/design-system`**

(Local: `http://127.0.0.1:3100/app/design-system`)

Human reviewers, QA engineers, Playwright tests, and Chrome DevTools can inspect every token, material tier, button state, metric card, and viewport behavior live.
