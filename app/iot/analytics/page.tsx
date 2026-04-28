"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TelemetryChart } from "@/components/iot/telemetry-chart";
import { ZoneHeatmap } from "@/components/iot/zone-heatmap";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotAnalytics, getIotFleet, getIotHealth } from "@/lib/iot/api";
import { buildMockAnalytics, buildMockIotSnapshot } from "@/lib/iot/mock";
import type { IotAnalyticsResponse, IotAnalyticsTimeRange, IotHealthResponse, IotNode } from "@/lib/iot/types";

const ranges: IotAnalyticsTimeRange[] = ["1h", "24h", "7d", "30d"];

export default function IotAnalyticsPage() {
  const [range, setRange] = useState<IotAnalyticsTimeRange>("24h");
  const [analytics, setAnalytics] = useState<IotAnalyticsResponse>(buildMockAnalytics());
  const [nodes, setNodes] = useState<IotNode[]>(buildMockIotSnapshot().fleet.nodes);
  const [health, setHealth] = useState<IotHealthResponse>(buildMockIotSnapshot().health);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAnalytics() {
      try {
        const [analyticsResponse, fleet, healthResponse] = await Promise.all([
          getIotAnalytics(range),
          getIotFleet(),
          getIotHealth(),
        ]);
        if (cancelled) {
          return;
        }
        setAnalytics(analyticsResponse);
        setNodes(fleet.nodes);
        setHealth(healthResponse);
        setNotice(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const fallback = buildMockIotSnapshot();
        setAnalytics({ ...buildMockAnalytics(), time_range: range });
        setNodes(fallback.fleet.nodes);
        setHealth(fallback.health);
        setNotice(error instanceof Error ? `${error.message}. Showing demo analytics.` : "Showing demo analytics.");
      }
    }
    void loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const metricCards = [
    ["Hourly Incidents", analytics.metrics.hourly_incidents],
    ["Gas Peak", `${analytics.metrics.gas_trend_peak} ADC`],
    ["Temp Peak", `${analytics.metrics.temp_trend_peak} C`],
    ["False Alarms", analytics.metrics.false_alarms],
    ["Offline Minutes", analytics.metrics.offline_durations_minutes],
    ["Avg Response", `${analytics.metrics.avg_response_time_seconds}s`],
    ["Camera Requests", analytics.metrics.camera_request_frequency],
    ["Fleet Health", `${health.fleet_health_score}%`],
  ];

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(239,68,68,0.1),transparent_28%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">IoT Analytics</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  Historical telemetry intelligence.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Trends, response quality, camera requests, false alarms, zone density, and device reliability.
                </p>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/iot">
                Back to IoT
              </Link>
            </div>
          </header>

          {notice ? <div className="rounded-3xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">{notice}</div> : null}

          <div className="flex flex-wrap gap-2">
            {ranges.map((item) => (
              <button
                aria-pressed={range === item}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  range === item ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
                }`}
                key={item}
                onClick={() => setRange(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <section className="grid gap-3 md:grid-cols-4">
            {metricCards.map(([label, value]) => (
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4" key={label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <TelemetryChart points={analytics.series.gas} title="Gas trend" tone="amber" unit="ADC" />
            <TelemetryChart points={analytics.series.temperature} title="Temperature trend" tone="cyan" unit="C" />
            <TelemetryChart points={analytics.series.incidents} title="Incident frequency" tone="red" unit="events" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <ZoneHeatmap nodes={nodes} />
            <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Diagnostics</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Health AI recommendations</h2>
              <div className="mt-5 grid gap-3">
                {health.diagnostics.map((item) => (
                  <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={item.node_id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-sm text-white/45">{item.recommendation}</p>
                      </div>
                      <span className="text-2xl font-semibold text-white">{item.health_score}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
