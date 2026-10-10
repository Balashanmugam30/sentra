"use client";

import { useMemo, type ReactNode } from "react";
import { animated, useSpring } from "@react-spring/web";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { addDays, format } from "date-fns";
import { motion } from "framer-motion";
import CountUp from "react-countup";

import { cn } from "@/lib/utils";
import type { AICouncilAgent, AICouncilSummary } from "@/lib/ai/types";
import type { AnalyticsHubSummary } from "@/lib/analytics/types";

const chartText = "rgba(245,247,250,0.72)";
const chartMuted = "rgba(245,247,250,0.42)";
const gridLine = "rgba(255,255,255,0.08)";
const cyan = "#7dd3fc";
const violet = "#8b5cf6";
const success = "#22c55e";
const warning = "#f4c56a";
const danger = "#ef4444";

type AnimatedKpiCardProps = {
  className?: string;
  decimals?: number;
  detail: string;
  label: string;
  prefix?: string;
  suffix?: string;
  tone?: "blue" | "violet" | "green" | "amber" | "red";
  value: number;
};

type PremiumEChartProps = {
  action?: ReactNode;
  className?: string;
  height?: number;
  option: EChartsOption;
  subtitle?: string;
  title: string;
};

function baseGrid() {
  return {
    bottom: 34,
    left: 36,
    right: 22,
    top: 36,
  };
}

function tooltip() {
  return {
    appendToBody: true,
    backgroundColor: "rgba(5,7,11,0.92)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    confine: true,
    extraCssText:
      "border-radius: 16px; box-shadow: 0 18px 44px rgba(0,0,0,0.42); backdrop-filter: blur(18px);",
    padding: 12,
    textStyle: {
      color: "#f8fafc",
      fontFamily: "Inter, Geist, ui-sans-serif, system-ui",
      fontSize: 12,
    },
  };
}

function axis() {
  return {
    axisLabel: { color: chartMuted, fontFamily: "Inter, Geist, ui-sans-serif, system-ui", margin: 12 },
    axisLine: { lineStyle: { color: gridLine } },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: gridLine, type: "dashed" as const } },
  };
}

function readMetric(summary: AnalyticsHubSummary, id: string, fallback: number) {
  const metric = Object.values(summary.metrics)
    .flat()
    .find((item) => item.metric_id === id);
  return metric?.value ?? fallback;
}

function toneGradient(tone: AnimatedKpiCardProps["tone"]) {
  if (tone === "violet") {
    return "from-violet-300/22 to-white/[0.02]";
  }
  if (tone === "green") {
    return "from-emerald-300/18 to-white/[0.02]";
  }
  if (tone === "amber") {
    return "from-amber-300/18 to-white/[0.02]";
  }
  if (tone === "red") {
    return "from-red-300/18 to-white/[0.02]";
  }
  return "from-sky-300/20 to-white/[0.02]";
}

export function AnimatedKpiCard({
  className,
  decimals = 0,
  detail,
  label,
  prefix = "",
  suffix = "",
  tone = "blue",
  value,
}: AnimatedKpiCardProps) {
  const normalized = Math.max(0, Math.min(100, value > 100 ? value / 100000 : value));
  const spring = useSpring({
    width: `${Math.max(18, Math.min(100, normalized))}%`,
    config: { tension: 140, friction: 24 },
  });

  return (
    <motion.article
      className={cn(
        "sentra-analytics-kpi group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_56px_rgba(0,0,0,0.22)] backdrop-blur-2xl",
        "sentra-phase12-kpi-card",
        className,
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-90", toneGradient(tone))} />
      <div className="relative">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
          {prefix}
          <CountUp decimals={decimals} duration={1.1} end={value} preserveValue separator="," />
          {suffix}
        </p>
        <p className="mt-3 min-h-10 text-sm leading-5 text-white/56">{detail}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8">
          <animated.div
            className={cn(
              "h-full rounded-full",
              tone === "red"
                ? "bg-red-300"
                : tone === "amber"
                  ? "bg-amber-300"
                  : tone === "green"
                    ? "bg-emerald-300"
                    : tone === "violet"
                      ? "bg-violet-300"
                      : "bg-sky-300",
            )}
            style={spring}
          />
        </div>
      </div>
    </motion.article>
  );
}

export function PremiumEChart({ action, className, height = 320, option, subtitle, title }: PremiumEChartProps) {
  return (
    <motion.section
      className={cn(
        "sentra-analytics-panel rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl",
        "sentra-phase12-chart-panel",
        className,
      )}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.025em] text-white">{title}</h3>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-white/54">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">
        <ReactECharts
          lazyUpdate
          notMerge
          option={option}
          opts={{ renderer: "canvas" }}
          style={{ height, width: "100%" }}
        />
      </div>
    </motion.section>
  );
}

export function ExecutiveAnalyticsCommandCenter({
  error,
  loading,
  onRefresh,
  summary,
}: {
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  summary: AnalyticsHubSummary;
}) {
  const labels = useMemo(
    () => Array.from({ length: 8 }, (_, index) => format(addDays(new Date(2026, 3, 20), index), "MMM d")),
    [],
  );
  const readiness = summary.analytics_supremacy_score;
  const annualSavings = readMetric(summary, "MET-ROI", 2100000);
  const responseSpeed = 61;
  const riskReduction = 42;
  const aiConfidence = readMetric(summary, "MET-TRUST", 91);
  const activeThreats = 6;

  const trendOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan, success, violet],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: labels },
      yAxis: { ...axis(), type: "value" },
      series: [
        { name: "Incidents", type: "line", smooth: true, symbolSize: 7, data: [14, 12, 16, 11, 9, 10, 7, 6] },
        { name: "Resolved", type: "line", smooth: true, symbolSize: 7, data: [8, 10, 12, 13, 11, 12, 10, 9] },
        { name: "Predicted", type: "line", smooth: true, symbolSize: 7, lineStyle: { type: "dashed" }, data: [13, 14, 12, 10, 8, 7, 6, 5] },
      ],
    }),
    [labels],
  );

  const revenueOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan, violet],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: labels },
      yAxis: { ...axis(), type: "value", axisLabel: { color: chartMuted, formatter: "${value}k" } },
      series: [
        {
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              x2: 0,
              y: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(125,211,252,0.28)" },
                { offset: 1, color: "rgba(125,211,252,0.02)" },
              ],
            },
          },
          data: [180, 220, 260, 310, 380, 440, 510, 590],
          name: "Loss prevented",
          smooth: true,
          type: "line",
        },
        {
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              x2: 0,
              y: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(139,92,246,0.22)" },
                { offset: 1, color: "rgba(139,92,246,0.02)" },
              ],
            },
          },
          data: [90, 120, 170, 210, 260, 310, 370, 420],
          name: "Continuity value",
          smooth: true,
          type: "line",
        },
      ],
    }),
    [labels],
  );

  const readinessGauge = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      series: [
        {
          axisLabel: { color: chartMuted, distance: 18 },
          axisLine: {
            lineStyle: {
              color: [
                [0.5, danger],
                [0.75, warning],
                [1, cyan],
              ],
              width: 14,
            },
          },
          detail: {
            color: "#fff",
            formatter: "{value}%",
            fontSize: 34,
            fontWeight: 700,
            offsetCenter: [0, "64%"],
          },
          max: 100,
          min: 0,
          pointer: { itemStyle: { color: cyan }, width: 4 },
          progress: { show: true, width: 14 },
          splitLine: { distance: -14, length: 14, lineStyle: { color: "rgba(255,255,255,0.18)" } },
          title: { color: chartMuted, fontSize: 12, offsetCenter: [0, "36%"] },
          type: "gauge",
          data: [{ name: "Readiness", value: readiness }],
        },
      ],
    }),
    [readiness],
  );

  return (
    <div className="sentra-analytics-command space-y-6">
      <motion.header
        className="sentra-analytics-hero rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)] dark:backdrop-blur-2xl md:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-cyan-100/58">Executive Analytics Command Center</p>
            <h1 className="mt-3 max-w-5xl text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              Boardroom-grade intelligence from every Sentra signal.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-white/58">
              Crisis performance, AI trust, security posture, revenue protection, and predictive risk stitched into one premium operating view.
            </p>
          </div>
          <button
            className="inline-flex items-center rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:border-cyan-400/40 dark:bg-cyan-500/20 dark:text-cyan-200"
            disabled={loading}
            onClick={onRefresh}
            type="button"
          >
            {loading ? "Refreshing" : "Refresh analytics"}
          </button>
        </div>
        {error ? (
          <div className="mt-5 rounded-2xl border border-amber-200/14 bg-amber-400/8 px-4 py-3 text-sm text-amber-100">
            Resilient mode: {error}
          </div>
        ) : null}
      </motion.header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AnimatedKpiCard detail="Global launch posture across crisis, trust, data, and AI readiness." label="Readiness Score" suffix="%" value={readiness} />
        <AnimatedKpiCard detail="Modeled reduction from faster detection, routing, and AI dispatch." label="Risk Reduction" suffix="%" tone="green" value={riskReduction} />
        <AnimatedKpiCard detail="Annualized downtime, insurance, and recovery exposure avoided." label="Annual Savings" prefix="$" tone="violet" value={annualSavings} />
        <AnimatedKpiCard detail="Response acceleration versus manual command workflows." label="Response Speed" suffix="%" value={responseSpeed} />
        <AnimatedKpiCard detail="Calibrated confidence across council, MLOps, and behavior engines." label="AI Confidence" suffix="%" tone="green" value={aiConfidence} />
        <AnimatedKpiCard detail="Open threats requiring executive awareness this cycle." label="Active Threats" tone="red" value={activeThreats} />
      </section>

      <ExecutiveBriefingMode
        activeThreats={activeThreats}
        aiConfidence={aiConfidence}
        annualSavings={annualSavings}
        readiness={readiness}
        summary={summary}
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.95fr_0.75fr]">
        <PremiumEChart option={trendOption} title="Incidents vs resolved vs predicted" subtitle="Smooth trend view for operational pressure and forecast confidence." />
        <PremiumEChart option={revenueOption} title="Revenue and loss prevention" subtitle="Continuity value modeled from avoided downtime and faster recovery." />
        <PremiumEChart height={320} option={readinessGauge} title="Readiness gauge" subtitle="Board-level operating confidence." />
      </section>

      <CrisisIntelligenceVisuals />
      <ExecutiveStoryboard summary={summary} />
    </div>
  );
}

function ExecutiveBriefingMode({
  activeThreats,
  aiConfidence,
  annualSavings,
  readiness,
  summary,
}: {
  activeThreats: number;
  aiConfidence: number;
  annualSavings: number;
  readiness: number;
  summary: AnalyticsHubSummary;
}) {
  const exposureSaved = annualSavings >= 1_000_000 ? `$${(annualSavings / 1_000_000).toFixed(1)}M` : `$${annualSavings.toLocaleString()}`;
  const forecast = summary.scenario_simulator.confidence;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[34px] border border-cyan-100/12 bg-[linear-gradient(145deg,rgba(125,211,252,0.10),rgba(139,92,246,0.07),rgba(255,255,255,0.035))] p-6 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-7"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-cyan-100/56">
            Executive briefing mode
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl">
            Current risk posture is controlled, but still requires active command attention.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
            Sentra is holding a {readiness}% readiness posture with {activeThreats} executive-visible threat signals, {aiConfidence}% AI confidence, and {exposureSaved} in modeled continuity protection.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { label: "Top operational concern", value: summary.scenario_simulator.options[0] ?? "Readiness drift" },
            { label: "Recommended action", value: summary.scenario_simulator.recommended },
            { label: "24h intelligence summary", value: `Forecast confidence ${forecast}% with board-ready continuity evidence available.` },
            { label: "Board note", value: "Maintain AI-assisted response, preserve reserve capacity, and keep executive updates on a 15-minute cadence." },
          ].map((item) => (
            <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={item.label}>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/36">{item.label}</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function CrisisIntelligenceVisuals() {
  const heatmapOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      grid: { bottom: 28, left: 50, right: 24, top: 28 },
      tooltip: tooltip(),
      visualMap: {
        bottom: 0,
        calculable: false,
        inRange: { color: ["rgba(125,211,252,0.16)", "rgba(139,92,246,0.52)", "rgba(239,68,68,0.74)"] },
        max: 100,
        min: 0,
        show: false,
      },
      xAxis: { ...axis(), type: "category", data: ["Lobby", "North", "Atrium", "Level 8", "Garage"] },
      yAxis: { ...axis(), type: "category", data: ["Now", "+5m", "+15m", "+30m"] },
      series: [
        {
          data: [
            [0, 0, 32],
            [1, 0, 48],
            [2, 0, 66],
            [3, 0, 81],
            [4, 0, 52],
            [0, 1, 28],
            [1, 1, 42],
            [2, 1, 72],
            [3, 1, 88],
            [4, 1, 61],
            [0, 2, 22],
            [1, 2, 36],
            [2, 2, 58],
            [3, 2, 74],
            [4, 2, 47],
            [0, 3, 18],
            [1, 3, 28],
            [2, 3, 41],
            [3, 3, 63],
            [4, 3, 34],
          ],
          label: { color: "#fff", show: true },
          type: "heatmap",
        },
      ],
    }),
    [],
  );

  const timelineOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan],
      grid: baseGrid(),
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["Detect", "Verify", "Dispatch", "Route", "Contain", "Recover"] },
      yAxis: { ...axis(), type: "value", axisLabel: { color: chartMuted, formatter: "{value}m" } },
      series: [
        {
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              x2: 0,
              y: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(125,211,252,0.25)" },
                { offset: 1, color: "rgba(125,211,252,0.02)" },
              ],
            },
          },
          data: [0.4, 1.1, 2.2, 5.4, 9.8, 14],
          name: "Minutes",
          smooth: true,
          type: "line",
        },
      ],
    }),
    [],
  );

  const donutOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan, violet, success, warning],
      tooltip: tooltip(),
      series: [
        {
          data: [
            { name: "Security", value: 34 },
            { name: "Medical", value: 22 },
            { name: "Fire", value: 18 },
            { name: "Reserve", value: 26 },
          ],
          label: { color: chartText },
          radius: ["52%", "74%"],
          type: "pie",
        },
      ],
    }),
    [],
  );

  const severityOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [danger, warning, cyan],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["Hotel", "Hospital", "Campus", "Mall", "Metro"] },
      yAxis: { ...axis(), type: "value" },
      series: [
        { data: [3, 2, 1, 4, 2], name: "Critical", stack: "severity", type: "bar" },
        { data: [5, 4, 3, 6, 5], name: "High", stack: "severity", type: "bar" },
        { data: [8, 6, 7, 4, 8], name: "Watch", stack: "severity", type: "bar" },
      ],
    }),
    [],
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/46">Crisis intelligence visuals</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Readable pressure, movement, and response quality.</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <PremiumEChart option={heatmapOption} title="Incident zone heatmap" subtitle="Risk intensity by zone and forecast window." />
        <PremiumEChart option={timelineOption} title="Live response timeline" subtitle="From detection to recovery with command latency visible." />
        <PremiumEChart option={donutOption} title="Resource deployment" subtitle="Responder allocation by mission type." />
        <PremiumEChart option={severityOption} title="Severity stack" subtitle="Critical, high, and watch-load by protected vertical." />
      </div>
      <PremiumGeoSpreadMap />
    </section>
  );
}

export function PremiumGeoSpreadMap() {
  const locations = [
    { label: "Grand Meridian", x: 26, y: 42, risk: 74, state: "elevated" },
    { label: "MetroCare", x: 45, y: 33, risk: 58, state: "stable" },
    { label: "Nova Mall", x: 63, y: 52, risk: 84, state: "critical" },
    { label: "Skyline Campus", x: 38, y: 66, risk: 46, state: "stable" },
    { label: "SmartCity Hub", x: 74, y: 38, risk: 62, state: "elevated" },
  ];
  const routes = [
    "M18 48 C32 44 43 36 56 38 C68 40 76 34 86 28",
    "M27 30 C38 42 49 46 64 52",
    "M26 42 C38 39 48 41 63 52",
  ];

  return (
    <motion.section
      className="sentra-analytics-panel rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <h3 className="text-lg font-semibold tracking-[-0.025em] text-white">Geographic incident spread</h3>
      <p className="mt-1 text-sm leading-6 text-white/54">Dark tactical map with readable incident markers, safe zones, routes, and hover context.</p>
      <div className="sentra-map-card sentra-premium-map relative mt-5">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 70">
          <path className="sentra-map-safe-zone" d="M8 46 C19 34 28 37 38 22 C50 5 60 17 72 12 C84 8 92 20 89 34 C86 52 70 56 58 60 C42 65 34 56 24 58 C13 60 2 56 8 46Z" strokeWidth="0.45" />
          <path className="sentra-map-safe-zone" d="M17 50 C25 45 38 49 45 42 C55 34 68 38 78 31 C86 25 93 31 90 40 C86 52 69 54 57 58 C44 62 34 55 23 58 C13 60 10 55 17 50Z" strokeDasharray="1 2" strokeWidth="0.35" />
          {routes.map((route) => (
            <path className="sentra-map-route" d={route} fill="none" key={route} strokeDasharray="2 2" strokeWidth="0.62" />
          ))}
        </svg>
        {locations.map((item) => (
          <button
            aria-label={`${item.label} risk ${item.risk}`}
            className={`sentra-map-marker ${item.state === "critical" ? "is-critical" : item.state === "elevated" ? "is-elevated" : ""}`}
            key={item.label}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            type="button"
          >
            <span className="sentra-map-marker-dot" />
            <span className="sentra-map-tooltip">
              <strong className="block truncate text-xs text-white">{item.label}</strong>
              <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.16em] text-white/42">
                {item.state} | Risk {item.risk}
              </span>
            </span>
          </button>
        ))}
        <div className="absolute inset-x-5 bottom-5 grid gap-3 md:grid-cols-5">
          {locations.map((item) => (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3" key={item.label}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-white">{item.label}</p>
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.state === "critical" ? "bg-red-300" : item.state === "elevated" ? "bg-amber-200" : "bg-white/70"
                  }`}
                />
              </div>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-white/42">Risk {item.risk}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function SecurityCommandAnalytics() {
  const radarOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan],
      radar: {
        axisName: { color: chartText },
        indicator: [
          { name: "Identity", max: 100 },
          { name: "API", max: 100 },
          { name: "Tokens", max: 100 },
          { name: "Insider", max: 100 },
          { name: "Network", max: 100 },
          { name: "Devices", max: 100 },
        ],
        splitArea: { areaStyle: { color: ["rgba(255,255,255,0.025)", "rgba(255,255,255,0.045)"] } },
        splitLine: { lineStyle: { color: gridLine } },
      },
      tooltip: tooltip(),
      series: [
        {
          areaStyle: { color: "rgba(125,211,252,0.18)" },
          data: [{ name: "Threat pressure", value: [82, 68, 74, 61, 55, 70] }],
          type: "radar",
        },
      ],
    }),
    [],
  );

  const anomalyOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [warning, danger],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["00", "04", "08", "12", "16", "20", "24"] },
      yAxis: { ...axis(), type: "value" },
      series: [
        { data: [3, 8, 5, 4, 7, 11, 6], name: "Login anomalies", smooth: true, type: "line" },
        { data: [1, 2, 1, 3, 2, 4, 2], name: "Token replay", smooth: true, type: "line" },
      ],
    }),
    [],
  );

  const zeroTrustGauge = useMemo<EChartsOption>(
    () => ({
      series: [
        {
          axisLabel: { color: chartMuted },
          axisLine: { lineStyle: { color: [[0.5, danger], [0.75, warning], [1, success]], width: 13 } },
          detail: { color: "#fff", formatter: "{value}%", fontSize: 32, fontWeight: 700 },
          progress: { show: true, width: 13 },
          type: "gauge",
          data: [{ name: "Zero trust", value: 88 }],
        },
      ],
    }),
    [],
  );

  const containmentOption = useMemo<EChartsOption>(
    () => ({
      color: [success, cyan],
      tooltip: tooltip(),
      series: [
        {
          data: [
            { name: "Auto contained", value: 76 },
            { name: "Human review", value: 24 },
          ],
          label: { color: chartText },
          radius: ["54%", "76%"],
          type: "pie",
        },
      ],
    }),
    [],
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/46">Security command analytics</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">SOC posture that reads like an executive instrument panel.</h2>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <PremiumEChart option={radarOption} title="Threat radar" subtitle="Attack pressure across identity, API, token, insider, network, and device surfaces." />
        <PremiumEChart option={anomalyOption} title="Login anomaly timeline" subtitle="Suspicious access pressure by operating window." />
        <PremiumEChart option={zeroTrustGauge} title="Zero trust posture" subtitle="Current access confidence after device, network, and session checks." />
        <PremiumEChart option={containmentOption} title="Auto containment success" subtitle="How many suspicious actions were contained without manual delay." />
      </div>
    </section>
  );
}

export function AICouncilAnalytics({
  agents,
  summary,
}: {
  agents: AICouncilAgent[];
  summary: AICouncilSummary;
}) {
  const agentNames = agents.map((agent) => agent.name.replace(" Agent", ""));
  const agentConfidence = agents.map((agent) => agent.confidence);
  const agentTrust = agents.map((agent) => agent.trust_score);

  const confidenceOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan, violet],
      grid: { bottom: 40, left: 36, right: 18, top: 36 },
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: agentNames },
      yAxis: { ...axis(), max: 100, type: "value" },
      series: [
        { barMaxWidth: 18, data: agentConfidence, name: "Confidence", type: "bar" },
        { barMaxWidth: 18, data: agentTrust, name: "Trust", type: "bar" },
      ],
    }),
    [agentConfidence, agentNames, agentTrust],
  );

  const acceptanceOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [success, danger, cyan],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      yAxis: { ...axis(), max: 100, type: "value" },
      series: [
        { data: [72, 76, 81, 83, 86, 88, 91], name: "Accepted", smooth: true, type: "line" },
        { data: [18, 16, 13, 12, 10, 9, 8], name: "Overrides", smooth: true, type: "line" },
        { data: [22, 20, 17, 14, 13, 11, 9], name: "Drift", smooth: true, type: "line" },
      ],
    }),
    [],
  );

  const latencyOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [cyan],
      grid: baseGrid(),
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["Sense", "Debate", "Merge", "Govern", "Approve", "Act"] },
      yAxis: { ...axis(), type: "value", axisLabel: { color: chartMuted, formatter: "{value}s" } },
      series: [{ areaStyle: { color: "rgba(125,211,252,0.16)" }, data: [1.4, 3.8, 5.2, 6.1, 8.6, 11.4], smooth: true, type: "line" }],
    }),
    [],
  );

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnimatedKpiCard detail="Merged council consensus on the active objective." label="Consensus" suffix="%" value={summary.consensus_score} />
        <AnimatedKpiCard detail="Governance and objective alignment across active specialists." label="Alignment" suffix="%" tone="violet" value={summary.alignment_score} />
        <AnimatedKpiCard detail="Human trust calibration from accepted and overridden plans." label="Trust Score" suffix="/100" tone="green" value={summary.trust_score} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <PremiumEChart option={confidenceOption} title="Agent confidence comparison" subtitle="Confidence and trust by specialist agent." />
        <PremiumEChart option={acceptanceOption} title="Acceptance, override, and drift trend" subtitle="Human governance signal quality over the last week." />
        <PremiumEChart option={latencyOption} title="Decision latency" subtitle="Seconds from sensing to governed action." />
        <PremiumEChart option={modelDriftOption()} title="Model drift monitor" subtitle="Drift pressure across behavior, risk, routing, and comms models." />
      </div>
    </section>
  );
}

function modelDriftOption(): EChartsOption {
  return {
    animationDuration: 900,
    color: [warning],
    grid: baseGrid(),
    tooltip: { ...tooltip(), trigger: "axis" },
    xAxis: { ...axis(), type: "category", data: ["Behavior", "Risk", "Routing", "Comms", "Finance", "SOC"] },
    yAxis: { ...axis(), max: 100, type: "value" },
    series: [{ barMaxWidth: 22, data: [18, 11, 14, 9, 16, 13], name: "Drift", type: "bar" }],
  };
}

export function ExecutiveStoryboard({ summary }: { summary: AnalyticsHubSummary }) {
  const forecastOptions = summary.scenario_simulator.options.slice(0, 4);

  return (
    <motion.section
      className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/46">Executive storyboard</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">Continuity, reputation, saved cost, and next 7 days.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/54">{summary.scenario_simulator.recommended}</p>
        </div>
        <div className="rounded-full border border-cyan-200/18 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          PDF-ready board styling
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedKpiCard detail="Facilities and teams able to maintain safe operating state." label="Continuity" suffix="%" value={92} />
        <AnimatedKpiCard detail="Public trust exposure controlled by faster verified messaging." label="Reputation" suffix="%" tone="violet" value={86} />
        <AnimatedKpiCard detail="Forecasted annual protection from avoided downtime." label="Cost Saved" prefix="$" tone="green" value={readMetric(summary, "MET-ROI", 2100000)} />
        <AnimatedKpiCard detail="Confidence in forecast and next best move." label="7 Day Forecast" suffix="%" tone="amber" value={summary.scenario_simulator.confidence} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {forecastOptions.map((option) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/62" key={option}>
            {option}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function IncidentIntelligenceDashboard() {
  const incidentTrendOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [danger, warning, success],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"] },
      yAxis: { ...axis(), type: "value" },
      series: [
        { data: [2, 4, 7, 5, 4, 3], name: "Critical", smooth: true, type: "line" },
        { data: [6, 8, 9, 8, 7, 5], name: "High", smooth: true, type: "line" },
        { data: [12, 10, 8, 9, 7, 6], name: "Resolved", smooth: true, type: "line" },
      ],
    }),
    [],
  );

  const severityOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 900,
      color: [danger, warning, cyan],
      grid: baseGrid(),
      legend: { bottom: 0, textStyle: { color: chartMuted } },
      tooltip: { ...tooltip(), trigger: "axis" },
      xAxis: { ...axis(), type: "category", data: ["Fire", "Medical", "Crowd", "Cyber", "Utility"] },
      yAxis: { ...axis(), type: "value" },
      series: [
        { data: [3, 1, 2, 1, 2], name: "Critical", stack: "x", type: "bar" },
        { data: [5, 4, 4, 3, 5], name: "High", stack: "x", type: "bar" },
        { data: [7, 6, 5, 4, 6], name: "Watch", stack: "x", type: "bar" },
      ],
    }),
    [],
  );

  return (
    <div className="sentra-analytics-command space-y-6">
      <motion.header
        className="sentra-analytics-hero rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)] dark:backdrop-blur-2xl md:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-cyan-100/58">Incident intelligence</p>
        <h1 className="mt-3 max-w-5xl text-3xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
          Incident command, redesigned for clarity under pressure.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-white/58">
          Triage, severity, response timeline, resource load, and geographic spread in a premium operator-ready layout.
        </p>
      </motion.header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnimatedKpiCard detail="Open incidents requiring command attention." label="Active Incidents" tone="red" value={18} />
        <AnimatedKpiCard detail="Average response speed across critical workflows." label="Response Speed" suffix="%" value={64} />
        <AnimatedKpiCard detail="Responder and reserve teams currently deployed." label="Resources Live" tone="green" value={42} />
        <AnimatedKpiCard detail="AI confidence in next best triage action." label="AI Triage" suffix="%" tone="violet" value={91} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <PremiumEChart option={incidentTrendOption} title="Incident response timeline" subtitle="Critical, high, and resolved pressure through the operating day." />
        <PremiumEChart option={severityOption} title="Severity by incident class" subtitle="Stacked severity for crisis categories that drive resource planning." />
      </section>

      <CrisisIntelligenceVisuals />
    </div>
  );
}
