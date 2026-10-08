"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertBanner,
  Button,
  ConfidenceIndicator,
  EvidenceCard,
  GlassCard,
  GlassDialog,
  GlassPanel,
  Input,
  MetricCard,
  SearchInput,
  SegmentedControl,
  StatusBadge,
  StatusDot,
} from "@/components/ui";
import type { StatusType } from "@/components/ui/status-dot";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "materials" | "components" | "intelligence">("overview");
  const [pulseActive, setPulseActive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeSegment, setActiveSegment] = useState("live");

  return (
    <div className="min-h-screen bg-[#030712] text-white p-4 sm:p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header & Mission Banner */}
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              S
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Sentra Liquid Glass
                </h1>
                <StatusBadge size="sm" status="intelligence">
                  Design System 3.0
                </StatusBadge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Calm, authoritative, high-trust, operational visual language for AI Crisis Intelligence OS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              href="/app"
            >
              ← Command Center
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              href="/mobile/home"
            >
              Field Ops →
            </Link>
            <Button
              data-testid="preview-modal-button"
              onClick={() => setDialogOpen(true)}
              size="sm"
              variant="primary"
            >
              Preview Modal
            </Button>
          </div>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <SegmentedControl
            onChange={(val) => setActiveTab(val as typeof activeTab)}
            options={[
              { value: "overview", label: "Overview & Philosophy" },
              { value: "materials", label: "3 Glass Tiers" },
              { value: "components", label: "Component Matrix" },
              { value: "intelligence", label: "Future Intelligence Grammar" },
            ]}
            size="sm"
            value={activeTab}
          />

          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-slate-400">Base: Obsidian Midnight (#030712)</span>
            <button
              aria-pressed={pulseActive}
              className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-slate-300 hover:text-white transition"
              onClick={() => setPulseActive(!pulseActive)}
              type="button"
            >
              Beacon Pulses: {pulseActive ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: THE 3 LIQUID GLASS MATERIAL TIERS */}
      <section className="space-y-5" id="glass-materials">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              The 3-Tier Liquid Glass Hierarchy
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Engineered with physical depth, subtle hairline specular highlights, and optical blur to prevent visual fatigue during mission-critical crisis operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1: Subtle */}
          <GlassPanel
            className="flex flex-col justify-between h-full min-h-[220px]"
            tier="subtle"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest">
                  Glass 01
                </span>
                <span className="text-[11px] rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-400 font-mono">
                  14px blur • 8% border
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Subtle Background Tier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quiet foundational surfaces. Optimized for extensive data tables, background telemetry panels, secondary logs, and dense lists without overwhelming high-density data.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>--glass-tier-1</span>
              <span>rgba(255,255,255,0.035)</span>
            </div>
          </GlassPanel>

          {/* Tier 2: Elevated */}
          <GlassPanel
            className="flex flex-col justify-between h-full min-h-[220px]"
            tier="elevated"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-widest">
                  Glass 02
                </span>
                <span className="text-[11px] rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-cyan-300 font-mono">
                  22px blur • 12% border
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Elevated Interactive Tier</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Primary active surfaces. Featuring hairline top specular edge reflection and diffuse ambient shadow. Standard for cards, navigation docks, metrics, and incident feeds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs font-mono text-cyan-200">
              <span>--glass-tier-2</span>
              <span>Specular Edge Active</span>
            </div>
          </GlassPanel>

          {/* Tier 3: Floating */}
          <GlassPanel
            className="flex flex-col justify-between h-full min-h-[220px]"
            tier="floating"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-widest">
                  Glass 03
                </span>
                <span className="text-[11px] rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-amber-200 font-mono">
                  30px blur • 18% border
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Floating Command Tier</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Highest tactical z-index. Deep layered occlusion shadows, dual-edge specular highlights, and concentrated backdrop filter. For floating HUDs, command bars, and modals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-200">
              <span>--glass-tier-3</span>
              <span>Command Elevation</span>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* SECTION 2: SEMANTIC STATUS PALETTE */}
      <section className="space-y-5" id="status-palette">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Semantic Status Palette (8 Operational States)
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Strictly defined operational colors. Free from gaming neon and generic purple gradients. Calibrated for unambiguous crisis decision-making under high-stress conditions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { status: "safe", label: "SAFE", desc: "Operational Normal", color: "#10b981" },
            { status: "warning", label: "WARNING", desc: "Elevated Caution", color: "#f59e0b" },
            { status: "critical", label: "CRITICAL", desc: "Life Safety Emergency", color: "#ef4444" },
            { status: "intelligence", label: "INTELLIGENCE", desc: "AI Decision Engine", color: "#06b6d4" },
            { status: "info", label: "INFO", desc: "Telemetry & Status", color: "#0ea5e9" },
            { status: "offline", label: "OFFLINE", desc: "Mesh Disconnected", color: "#64748b" },
            { status: "unknown", label: "UNKNOWN", desc: "Unverified Stream", color: "#94a3b8" },
            { status: "executive", label: "EXECUTIVE", desc: "Tactical Command", color: "#f5d58a" },
          ].map((item) => (
            <GlassCard
              className="p-4 flex flex-col justify-between gap-3"
              key={item.status}
              tier="subtle"
            >
              <div className="flex items-center justify-between">
                <StatusBadge
                  pulse={pulseActive && (item.status === "critical" || item.status === "warning")}
                  size="sm"
                  status={item.status as StatusType}
                >
                  {item.label}
                </StatusBadge>
                <StatusDot
                  pulse={pulseActive && item.status === "critical"}
                  size="md"
                  status={item.status as StatusType}
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">{item.desc}</p>
                <p className="text-[11px] font-mono text-slate-400">{item.color}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SECTION 3: OPERATIONAL TELEMETRY METRIC CARDS */}
      <section className="space-y-5" id="telemetry-metrics">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Operational Telemetry & Metric Cards
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            High-density telemetry displays with tabular monospace numerals for stable rendering during high-frequency real-time updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            delta="+2.4%"
            hint="9 floors verified secure"
            interactive
            label="Zone Containment"
            status="safe"
            statusLabel="NOMINAL"
            trend="up"
            trendLabel="vs last hour"
            unit="%"
            value="94.2"
          />
          <MetricCard
            delta="14 Units"
            hint="Radio mesh synchronized"
            interactive
            label="Field Responders"
            status="info"
            statusLabel="ACTIVE"
            trend="neutral"
            trendLabel="En Route"
            unit="PERS"
            value="142"
          />
          <MetricCard
            delta="-12s"
            hint="West Stairwell clear"
            interactive
            label="Evacuation Velocity"
            status="warning"
            statusLabel="ALERT"
            trend="down"
            trendLabel="Accelerating"
            unit="m/s"
            value="1.48"
          />
          <MetricCard
            delta="P99: 22ms"
            hint="Zero packet drop detected"
            interactive
            label="Mesh Telemetry RTT"
            status="safe"
            statusLabel="OPTIMAL"
            trend="up"
            trendLabel="Sub-30ms"
            unit="ms"
            value="18"
          />
        </div>
      </section>

      {/* SECTION 4: BUTTON & INTERACTIVE CONTROLS MATRIX */}
      <section className="space-y-5" id="interactive-matrix">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Button Hierarchy & Touch Target Compliance
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            All interactive buttons satisfy the minimum 44px touch target specification for responsive mobile, tablet, and widescreen tactical displays.
          </p>
        </div>

        <GlassPanel className="p-6 space-y-6" tier="elevated">
          {/* Button Variants */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Button Variants (44px Minimum Touch Height)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="md" variant="primary">
                Primary Tactical
              </Button>
              <Button size="md" variant="secondary">
                Elevated Glass
              </Button>
              <Button size="md" variant="intelligence">
                AI Intelligence
              </Button>
              <Button size="md" variant="executive">
                Executive Command
              </Button>
              <Button size="md" variant="danger">
                Critical Incident
              </Button>
              <Button size="md" variant="ghost">
                Ghost Quiet
              </Button>
            </div>
          </div>

          {/* Button States */}
          <div className="space-y-3 pt-3 border-t border-white/8">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Button Operational States
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading size="md" variant="primary">
                Dispatching Responders
              </Button>
              <Button disabled size="md" variant="secondary">
                Locked Protocol
              </Button>
              <Button
                leadingIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" />
                  </svg>
                }
                size="md"
                variant="secondary"
              >
                With Leading Icon
              </Button>
              <Button
                size="md"
                trailingIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" />
                  </svg>
                }
                variant="primary"
              >
                With Trailing Icon
              </Button>
            </div>
          </div>

          {/* Form & Search Inputs */}
          <div className="space-y-3 pt-3 border-t border-white/8">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Input Primitives & Command Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput
                onChange={(e) => setSearchValue(e.target.value)}
                onClear={() => setSearchValue("")}
                placeholder="Search telemetry feeds, zones, or responders (⌘K)..."
                value={searchValue}
              />
              <Input
                label="Sector Identifier"
                placeholder="e.g. SECTOR-ALPHA-04"
              />
            </div>
          </div>

          {/* Segmented Controls */}
          <div className="space-y-3 pt-3 border-t border-white/8">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Segmented Control Command Filter
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <SegmentedControl
                onChange={setActiveSegment}
                options={[
                  { value: "live", label: "Live Telemetry" },
                  { value: "evac", label: "Evacuation Corridors" },
                  { value: "assets", label: "Field Assets" },
                  { value: "ai-sim", label: "Predictive Models" },
                ]}
                value={activeSegment}
              />
              <span className="text-xs font-mono text-cyan-300">
                Selected Filter: [{activeSegment}]
              </span>
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* SECTION 5: FUTURE INTELLIGENCE VISUAL GRAMMAR */}
      <section className="space-y-5" id="future-intelligence">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Future Intelligence Visual Grammar
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Visual contracts for AI crisis intelligence. Every automated insight provides source citations, calibrated confidence meters, latency telemetry, and multi-sensor verification states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EvidenceCard
            confidence={94}
            coordinates="37.7749° N, 122.4194° W"
            excerpt="High-density acoustic triangulation combined with optical thermal sensors confirms thermal divergence at Stairwell B, Floor 4. Model predicts containment viable for 14 minutes."
            latencyMs={16}
            sourceName="FLIR Optical & Acoustic Array #04"
            sourceType="Hardware Sensor"
            tags={["ThermalDivergence", "Floor4", "MultiSensorVerified"]}
            timestamp="18:32:04 UTC"
            title="Thermal Anomaly Verified at Stairwell B"
            verification="verified"
          />

          <EvidenceCard
            confidence={72}
            coordinates="Zone 02 • Sector C"
            excerpt="Predictive egress flow simulation indicates 82% corridor congestion if Route Delta is chosen. Automatic rerouting via Corridor Echo projected to reduce evacuation bottleneck by 4.2 minutes."
            latencyMs={42}
            sourceName="Sentra Egress Neural Predictor"
            sourceType="Model Projection"
            tags={["EgressOptimization", "CorridorEcho", "ProvisionalRoute"]}
            timestamp="18:32:10 UTC"
            title="Projected Egress Bottleneck Mitigation"
            verification="hypothetical"
          />
        </div>

        {/* Confidence Gauge Matrix */}
        <GlassCard className="p-6 space-y-4" tier="subtle">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Calibrated Confidence Meters (0% to 100%)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3.5">
              <ConfidenceIndicator score={95} size="md" />
              <p className="text-[11px] text-slate-400">High Confidence (≥85%)</p>
            </div>
            <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3.5">
              <ConfidenceIndicator score={74} size="md" />
              <p className="text-[11px] text-slate-400">Moderate Confidence (60-84%)</p>
            </div>
            <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3.5">
              <ConfidenceIndicator score={48} size="md" />
              <p className="text-[11px] text-slate-400">Cautionary (40-59%)</p>
            </div>
            <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-3.5">
              <ConfidenceIndicator score={22} size="md" />
              <p className="text-[11px] text-slate-400">Low / Provisional (&lt;40%)</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* SECTION 6: OPERATIONAL CRISIS ALERT BANNERS */}
      <section className="space-y-5" id="crisis-alerts">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Operational Alert Banners
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Crisp operational alerts spanning critical life-safety warnings, system advisories, and recovery clearances.
          </p>
        </div>

        <div className="space-y-3.5">
          <AlertBanner
            action={
              <Button size="sm" variant="danger">
                Initiate Reroute
              </Button>
            }
            description="Active thermal event confirmed at Floor 4, West Wing. Egress routes 3 and 4 compromised. Field units re-routed to East Exit."
            pulse
            severity="critical"
            timestamp="18:32:45 UTC"
            title="CRITICAL: Structural Obstruction Detected"
          />

          <AlertBanner
            action={
              <Button size="sm" variant="secondary">
                Inspect Sensors
              </Button>
            }
            description="Mesh node 12 signal degraded due to particulate density. Redundant mesh path engaged via Relay Node 07."
            severity="warning"
            timestamp="18:31:12 UTC"
            title="WARNING: Mesh Relay Degradation"
          />

          <AlertBanner
            description="Sector Alpha-12 secondary search complete. All 28 occupants safely accounted for at Assembly Area 2."
            severity="safe"
            timestamp="18:29:00 UTC"
            title="RESOLVED: Primary Sector Clearance"
          />
        </div>
      </section>

      {/* SECTION 7: RESPONSIVE VIEWPORT SPECIFICATION */}
      <section className="space-y-5" id="viewport-specs">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Audited 8-Viewport Responsive System
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Rigorous automated Playwright verification across all 8 standard tactical device form factors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { width: "320px", label: "Ultra-narrow Mobile", target: "Tactical Handhelds" },
            { width: "390px", label: "Standard Mobile", target: "iPhone 14/15" },
            { width: "414px", label: "Large Mobile", target: "Plus / Max Devices" },
            { width: "768px", label: "Tablet Portrait", target: "iPad Mini / Air" },
            { width: "1024px", label: "Tablet Landscape", target: "iPad Pro / Laptop" },
            { width: "1280px", label: "Standard Desktop", target: "Desktop Workstation" },
            { width: "1440px", label: "Wide Desktop", target: "Command Display" },
            { width: "1728px", label: "Ultra-wide Display", target: "Emergency Ops Center" },
          ].map((vp) => (
            <GlassCard className="p-3.5 space-y-1" key={vp.width} tier="subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">{vp.width}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-medium text-slate-300">{vp.label}</p>
              <p className="text-[11px] text-slate-400">{vp.target}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Interactive Modal Dialog */}
      <GlassDialog
        description="Liquid Glass Tier 3 dialog primitive with background blur, focus isolation, and escape key listener."
        maxWidth="md"
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="Tactical Command Protocol 04"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            You are initiating a high-priority tactical protocol override. All connected field units will receive updated route vectors within 800 milliseconds.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button onClick={() => setDialogOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)} variant="primary">
              Confirm Override
            </Button>
          </div>
        </div>
      </GlassDialog>
    </div>
  );
}
