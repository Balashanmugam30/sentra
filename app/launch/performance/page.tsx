"use client";

import { LaunchKpis } from "@/components/launch/launch-kpis";
import { LaunchPanel } from "@/components/launch/launch-panel";
import { LaunchShell } from "@/components/launch/launch-shell";
import { PerformanceBoard } from "@/components/launch/performance-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useLaunch } from "@/lib/launch/use-launch";

export default function LaunchPerformancePage() {
  const { performance, loading, error, busyAction, lastAction, refresh, optimize } = useLaunch();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Performance Domination"
        title="Fast, smooth, cache-aware launch posture"
        subtitle="Route speed, API latency, cache hit ratio, websocket health, hydration speed, slow widgets, and optimization queues for final product polish."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <LaunchKpis
          items={[
            { label: "Performance Score", value: performance.performance_score, tone: "emerald" },
            { label: "Avg Route P95", value: `${performance.avg_route_p95_ms}ms`, tone: "cyan" },
            { label: "Cache Hit", value: `${performance.cache.hit_ratio}%`, tone: "blue" },
            { label: "WS Health", value: `${performance.websocket.health_percent}%`, tone: "emerald" },
          ]}
        />
        <PerformanceBoard performance={performance} />
        <LaunchPanel eyebrow="Optimization Queue" title="Frontend and backend hardening levers">
          <div className="mb-5">
            <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={() => void optimize("performance")} type="button">
              Queue optimization pass
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {performance.optimizations.map((optimization) => (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/65" key={optimization}>{optimization}</div>
            ))}
          </div>
        </LaunchPanel>
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
