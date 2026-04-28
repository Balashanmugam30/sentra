"use client";

import { useOpsObservability } from "@/lib/ops/use-ops";

function statusClass(status: string) {
  if (status === "healthy" || status === "configured" || status === "idle") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100";
  }
  if (status === "watch" || status === "degraded") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-100";
  }
  return "border-rose-400/20 bg-rose-500/10 text-rose-100";
}

export function OperationsControlCenter() {
  const ops = useOpsObservability();
  const snapshot = ops.snapshot;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Operations Control Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Release health, backups, alerts, cache, queue, and deployment readiness
            </h2>
          </div>
          <button
            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-50"
            disabled={ops.isRefreshing}
            onClick={() => void ops.refresh()}
            type="button"
          >
            {ops.isRefreshing ? "Syncing ops" : "Refresh Ops"}
          </button>
        </div>

        {ops.error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {ops.error}
          </div>
        ) : null}

        {!snapshot && ops.isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/55">
            Syncing production operations telemetry
          </div>
        ) : null}

        {snapshot ? (
          <>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {[
                ["Version", snapshot.deployment.version],
                ["Environment", snapshot.deployment.environment],
                ["Uptime", `${Math.round(snapshot.uptime_seconds / 60)}m`],
                ["Nodes", String(snapshot.active_nodes)],
                ["DB Size", `${snapshot.database.size_mb} MB`],
                ["Queue Depth", String(snapshot.queue.depth)],
                ["Cache Hit", `${snapshot.cache.hit_ratio}%`],
                ["Cache Entries", String(snapshot.cache.entries)],
                ["Requests/min", String(snapshot.metrics.requests_last_min)],
                ["P95 Latency", `${snapshot.metrics.latency.p95} ms`],
                ["WebSockets", String(snapshot.metrics.websocket_clients)],
                ["Rollback", snapshot.release.rollback_ready ? "ready" : "blocked"],
              ].map(([label, value]) => (
                <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={label}>
                  <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
                  <div className="mt-2 text-sm font-medium text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.16em] text-white/45">Health Map</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(snapshot.health.checks).map(([name, check]) => (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${statusClass(
                        String(check.status),
                      )}`}
                      key={name}
                    >
                      {name}: {String(check.status)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.16em] text-white/45">Active Alerts</div>
                <div className="space-y-2">
                  {snapshot.alerts.slice(0, 4).map((alert) => (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" key={alert.alert_id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-white">{alert.title}</span>
                        <span className={`rounded-full border px-2 py-1 text-[0.65rem] uppercase ${statusClass(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/55">{alert.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
