"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTrends } from "@/lib/analytics/use-trends";
import type { AnalyticsHourlyCountPoint, HotspotMovement } from "@/lib/analytics/types";
import { ChartCard } from "@/modules/dashboard/components/chart-card";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for trend intelligence";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Waiting for trend intelligence";
  }

  return date.toLocaleString();
}

function movementStyles(movement: HotspotMovement) {
  if (movement === "up") {
    return {
      color: "#fca5a5",
      borderColor: "rgba(248, 113, 113, 0.24)",
      background: "rgba(127, 29, 29, 0.18)",
    };
  }

  if (movement === "down") {
    return {
      color: "#93c5fd",
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.18)",
    };
  }

  return {
    color: "#fde68a",
    borderColor: "rgba(245, 158, 11, 0.24)",
    background: "rgba(120, 53, 15, 0.18)",
  };
}

function tooltipStyle() {
  return {
    background: "rgba(15, 23, 42, 0.96)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "16px",
    color: "#e2e8f0",
  };
}

function totalCount(data: AnalyticsHourlyCountPoint[] | undefined) {
  return (data ?? []).reduce((sum, item) => sum + item.count, 0);
}

export function TrendsPanel() {
  const { trends, hotspots, loading, error } = useTrends();

  return (
    <>
      <section
        className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          boxShadow: "var(--sentra-shadow-panel)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-[1px] rounded-[27px]"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface-soft)",
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p
                className="text-[0.7rem] uppercase tracking-[0.26em]"
                style={{ color: "var(--sentra-text-soft)" }}
              >
                Trend Intelligence Center
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                Live Patterns + Forecasting Signals
              </h2>
              <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Refreshed {formatTimestamp(trends?.generated_at)}
              </p>
            </div>
            <div className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {loading ? "Refreshing charts" : `Window ${trends?.window ?? "24h"}`}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Incident Volume"
              subtitle={`24h total ${totalCount(trends?.incident_volume)}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.incident_volume ?? []}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Response Time"
              subtitle="Average response minutes per hour"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.response_time ?? []}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Alert Traffic"
              subtitle="Communication volume by hour"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.alerts_sent ?? []}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Resource Load"
              subtitle="Operational utilization trend"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.resource_load ?? []}>
                  <defs>
                    <linearGradient id="resourceLoadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148, 163, 184, 0.45)" tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Area
                    type="monotone"
                    dataKey="percent"
                    stroke="#ef4444"
                    fill="url(#resourceLoadFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-6 rounded-[22px] border p-4" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface-soft)" }}>
            <h3 className="text-sm font-medium text-[var(--text)]">Trend Flags</h3>
            <div className="mt-3 space-y-3">
              {(trends?.trend_flags ?? []).map((flag, index) => (
                <div
                  className="rounded-[18px] border px-4 py-3 text-sm"
                  key={`${flag}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  {flag}
                </div>
              ))}
              {error ? (
                <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
          boxShadow: "var(--sentra-shadow-panel)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-[1px] rounded-[27px]"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface-soft)",
          }}
        />

        <div className="relative z-10">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Hotspot Movement Tracker
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Recurring Zone Risk Patterns
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Ranked by fused risk and recurrence
            </p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              {(hotspots?.zones ?? []).map((zone, index) => {
                const styles = movementStyles(zone.movement);
                return (
                  <div
                    className="rounded-[22px] border p-4"
                    key={`${zone.zone}-${zone.risk_score}-${zone.movement}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface-soft)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-medium text-[var(--text)]">{zone.zone}</h3>
                        <p className="mt-1 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                          Risk {zone.risk_score} - Incidents {zone.incident_count}
                        </p>
                      </div>
                      <span
                        className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]"
                        style={{
                          color: styles.color,
                          borderColor: styles.borderColor,
                          background: styles.background,
                        }}
                      >
                        {zone.movement}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div
                className="rounded-[22px] border p-4"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <h3 className="text-sm font-medium text-[var(--text)]">Recurring Patterns</h3>
                <div className="mt-3 space-y-3">
                  {(hotspots?.recurring_patterns ?? []).map((pattern, index) => (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      key={`${pattern}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[22px] border p-4"
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <h3 className="text-sm font-medium text-[var(--text)]">Recommended Focus</h3>
                <div className="mt-3 space-y-3">
                  {(hotspots?.recommended_focus ?? []).map((focus, index) => (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      key={`${focus}-${index}`}
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      {focus}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
