"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import type { Incident } from "@/lib/api/incident";
import { apiClient } from "@/lib/core/api-client";

type LaunchControlSuiteProps = {
  canExportReports: boolean;
  incidents: Incident[];
  role?: string | null;
};

type Strategy = {
  id: string;
  label: string;
  casualtyRisk: number;
  downtimeHours: number;
  financialLoss: string;
  reputationImpact: number;
  confidence: number;
};

const strategyOptions: Strategy[] = [
  {
    id: "corridor-first",
    label: "Corridor-first selective containment",
    casualtyRisk: 18,
    downtimeHours: 5,
    financialLoss: "$1.8M",
    reputationImpact: 21,
    confidence: 91,
  },
  {
    id: "targeted-lockdown",
    label: "Targeted lockdown with medical corridor",
    casualtyRisk: 24,
    downtimeHours: 8,
    financialLoss: "$2.7M",
    reputationImpact: 27,
    confidence: 86,
  },
  {
    id: "full-lockdown",
    label: "Full lockdown and total facility pause",
    casualtyRisk: 31,
    downtimeHours: 14,
    financialLoss: "$4.9M",
    reputationImpact: 42,
    confidence: 73,
  },
];
const primaryStrategy = strategyOptions[0] as Strategy;

const launchSignals = [
  "Hash-chained audit evidence",
  "Realtime-first SOC telemetry",
  "GIS + climate + civic overlays",
  "Offline emergency continuity",
  "RBAC-protected command controls",
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function MetricTile({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: string;
  tone?: "cyan" | "emerald" | "amber" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "from-emerald-300/24 to-emerald-500/8 text-emerald-100"
      : tone === "amber"
      ? "from-amber-300/24 to-amber-500/8 text-amber-100"
      : tone === "rose"
      ? "from-rose-300/24 to-rose-500/8 text-rose-100"
      : "from-cyan-300/24 to-blue-500/8 text-cyan-100";

  return (
    <div className={`sentra-premium-card rounded-3xl bg-gradient-to-br ${toneClass} p-4`}>
      <p className="text-xs uppercase tracking-[0.22em] text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function CapabilityPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/70">
      {label}
    </span>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          animate={{ width: `${value}%` }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200"
          initial={{ width: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function LaunchControlSuite({ canExportReports, incidents, role }: LaunchControlSuiteProps) {
  const [wallMode, setWallMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [reportState, setReportState] = useState<"idle" | "exporting" | "ready" | "error">("idle");

  const criticalCount = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          incident.priority === "critical" ||
          incident.risk_level === "critical" ||
          incident.severity >= 4,
      ).length,
    [incidents],
  );
  const activeCount = useMemo(
    () => incidents.filter((incident) => incident.status !== "resolved").length,
    [incidents],
  );
  const readinessScore = clampScore(94 - criticalCount * 7 - Math.max(0, activeCount - 3) * 3);
  const reputationRisk = clampScore(18 + criticalCount * 9 + Math.max(0, activeCount - 2) * 4);
  const stabilityEta = activeCount > 0 ? `${Math.max(7, activeCount * 11 + criticalCount * 8)}m` : "stable";
  const financialExposure = activeCount > 0 ? `$${(1.2 + activeCount * 0.65 + criticalCount * 1.1).toFixed(1)}M` : "$0.4M";
  const bestStrategy = primaryStrategy;
  const fallbackIncidents = incidents.length > 0 ? incidents.slice(0, 5) : [
    {
      id: "DEMO-INC-101",
      type: "fire_risk",
      status: "active",
      severity: 4,
      location: "Zone 2",
      created_at: "demo",
      priority: "critical",
      recommended_action: "Protect evacuation corridor and deploy fire team",
    },
    {
      id: "DEMO-INC-102",
      type: "crowd_pressure",
      status: "monitoring",
      severity: 3,
      location: "Gate A",
      created_at: "demo",
      priority: "high",
      recommended_action: "Open overflow route and notify field responders",
    },
  ];

  async function exportReport() {
    if (!canExportReports || reportState === "exporting") {
      return;
    }

    setReportState("exporting");
    try {
      const response = await apiClient.fetchResponse("/system/reports/executive.pdf", {
        method: "GET",
        priority: "low",
        timeoutMs: 15_000,
      });
      if (!response.ok) {
        throw new Error(`Report export failed with ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sentra-executive-report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
      setReportState("ready");
      window.setTimeout(() => setReportState("idle"), 2200);
    } catch {
      setReportState("error");
      window.setTimeout(() => setReportState("idle"), 2600);
    }
  }

  function startDemoMode() {
    setDemoMode(true);
    window.setTimeout(() => setDemoMode(false), 9000);
  }

  return (
    <>
      <section className="sentra-premium-card overflow-hidden rounded-[36px] border-cyan-200/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_36%),linear-gradient(135deg,rgba(8,13,28,0.92),rgba(3,7,18,0.76))] p-5 shadow-[var(--sentra-shadow-command)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
              Launch Command Suite
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Sentra executive operating picture, demo mode, and launch evidence.
            </h2>
            <p className="text-sm leading-6 text-white/60">
              A single investor-grade layer for leadership posture, explainable AI, incident execution,
              digital twin replay, and exportable executive reports.
            </p>
            <div className="flex flex-wrap gap-2">
              {launchSignals.map((signal) => (
                <CapabilityPill key={signal} label={signal} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-cyan-200/70"
              onClick={() => setWallMode(true)}
              type="button"
            >
              Command Wall
            </button>
            <button
              className="rounded-full border border-cyan-200/20 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 focus:outline-none focus:ring-2 focus:ring-cyan-200/70"
              onClick={startDemoMode}
              type="button"
            >
              {demoMode ? "Autoplay Active" : "Demo Walkthrough"}
            </button>
            <button
              className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/16 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canExportReports || reportState === "exporting"}
              onClick={exportReport}
              type="button"
            >
              {reportState === "exporting"
                ? "Preparing report"
                : reportState === "ready"
                ? "Report Ready"
                : reportState === "error"
                ? "Retry Report"
                : "Export PDF Report"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Readiness score" tone="emerald" value={`${readinessScore}%`} />
          <MetricTile label="Financial exposure" tone="amber" value={financialExposure} />
          <MetricTile label="Reputation risk" tone={reputationRisk > 45 ? "rose" : "cyan"} value={`${reputationRisk}%`} />
          <MetricTile label="ETA to stability" value={stabilityEta} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/45">CEO Command View</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Strategic summary for {role ?? "operator"}</h3>
              </div>
              <span className="rounded-full bg-emerald-300/14 px-3 py-1 text-xs font-semibold text-emerald-100">
                Launch-ready
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ProgressLine label="Continuity posture" value={readinessScore} />
              <ProgressLine label="Compliance evidence" value={96} />
              <ProgressLine label="Realtime resilience" value={91} />
              <ProgressLine label="Board visibility" value={94} />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Demo Presentation Mode</p>
            <div className="mt-4 space-y-3">
              {[
                "1. Crisis signal detected across hardware, GIS, and OSINT",
                "2. AI council debates corridor-first response",
                "3. Optimizer assigns responders while preserving reserve capacity",
                "4. Executive PDF evidence exported for leadership review",
              ].map((step, index) => (
                <motion.div
                  animate={{ opacity: demoMode ? 1 : 0.78, x: demoMode ? 0 : -4 }}
                  className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm text-white/70"
                  key={step}
                  transition={{ delay: demoMode ? index * 0.18 : 0 }}
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">Explainable AI Layer</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Recommended: {bestStrategy.label}</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              Suggested because it minimizes casualty risk while protecting medical evacuation access and
              limiting reputation exposure.
            </p>
            <div className="mt-4 space-y-3 text-sm text-white/62">
              <div>Confidence: {bestStrategy.confidence}%</div>
              <div>Data used: incidents, field tasks, facility state, SOC/audit posture, environmental constraints</div>
              <div>Alternative choices: targeted lockdown, full lockdown, mutual-aid surge</div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">Strategy Simulator</p>
            <div className="mt-4 space-y-3">
              {strategyOptions.map((strategy) => (
                <div className="rounded-2xl border border-white/8 bg-black/16 p-3" key={strategy.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{strategy.label}</p>
                    <span className="text-xs text-cyan-100">{strategy.confidence}%</span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">
                    Casualty risk {strategy.casualtyRisk}% | downtime {strategy.downtimeHours}h | loss {strategy.financialLoss}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">Security Final Hardening</p>
            <div className="mt-4 grid gap-3">
              {[
                ["Device trust", "fingerprint-ready"],
                ["MFA", "architecture-ready"],
                ["SSO", "Google / Microsoft / SAML-ready"],
                ["Sensitive actions", "reauth prompt-ready"],
                ["Audit exports", "signed evidence-ready"],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/16 px-3 py-2 text-sm" key={label}>
                  <span className="text-white/62">{label}</span>
                  <span className="font-semibold text-emerald-100">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Incident Operations Elite Board</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {fallbackIncidents.map((incident, index) => (
                <div className="rounded-3xl border border-white/8 bg-white/6 p-4" key={`${incident.id}-${incident.status}-${index}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{incident.location}</p>
                    <span className="sentra-status-warning rounded-full bg-amber-300/14 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                      SLA {index === 0 ? "04:30" : "11:00"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/62">{incident.recommended_action ?? incident.type}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45">
                    <span>Owner: {index === 0 ? "Ops Alpha" : "Field Bravo"}</span>
                    <span>Escalation: L{Math.min(3, index + 1)}</span>
                    <span>Status: {incident.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/18 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Digital Twin Elite Mode</p>
            <div className="mt-4 rounded-[26px] border border-cyan-200/12 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_38%),rgba(255,255,255,0.04)] p-4">
              <div className="grid grid-cols-3 gap-2">
                {["Floor 1", "Floor 2", "Roof"].map((floor, index) => (
                  <div
                    className="rounded-2xl border border-white/8 bg-black/18 px-3 py-4 text-center text-sm text-white/70"
                    key={floor}
                  >
                    <span className="block text-lg font-semibold text-cyan-100">{index + 1}</span>
                    {floor}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <ProgressLine label="Responder playback readiness" value={88} />
                <ProgressLine label="Sensor pulse fidelity" value={92} />
                <ProgressLine label="3D map abstraction readiness" value={84} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {wallMode ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] overflow-auto bg-[#030711]/96 p-6 backdrop-blur-xl"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-center gap-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/60">Live Command Wall</p>
                  <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
                    Sentra is holding operational advantage.
                  </h2>
                </div>
                <button
                  className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => setWallMode(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <MetricTile label="Readiness" tone="emerald" value={`${readinessScore}%`} />
                <MetricTile label="Active incidents" tone={activeCount > 3 ? "rose" : "cyan"} value={`${activeCount}`} />
                <MetricTile label="Exposure" tone="amber" value={financialExposure} />
                <MetricTile label="Stability ETA" value={stabilityEta} />
              </div>
              <div className="rounded-[36px] border border-white/10 bg-white/[0.045] p-8 text-2xl leading-relaxed text-white/75">
                Current strategy: <span className="font-semibold text-cyan-100">{bestStrategy.label}</span>. AI
                consensus favors protected evacuation corridors, selective lockdown, and reserve-preserving dispatch.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
