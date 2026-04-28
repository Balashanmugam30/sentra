"use client";

import type { UseSocResult } from "@/lib/soc/use-soc";

function healthTone(status: string) {
  if (status === "critical") {
    return "border-rose-400/30 bg-rose-500/12";
  }
  if (status === "degraded") {
    return "border-amber-400/30 bg-amber-500/12";
  }
  if (status === "watch") {
    return "border-sky-400/30 bg-sky-500/12";
  }
  if (status === "offline") {
    return "border-slate-500/30 bg-slate-700/25";
  }
  return "border-cyan-300/22 bg-cyan-400/10";
}

type SystemHealthPanelProps = {
  soc: UseSocResult;
};

export function SystemHealthPanel({ soc }: SystemHealthPanelProps) {
  const { error, health, loading } = soc;
  const modules = health?.modules ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            System Health Grid
          </p>
          <h2 className="text-lg font-semibold text-white">
            Per-module latency, error pressure, uptime, and operating state
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module, index) => (
            <div
              className={`rounded-[22px] border p-4 ${healthTone(module.status)}`}
              key={`${module.module}-${index}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  {module.module}
                </div>
                <div className="text-[0.65rem] uppercase tracking-[0.14em] text-white/70">
                  {module.status}
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-white/80">
                <div>Requests: {module.request_count}</div>
                <div>Errors: {module.error_count}</div>
                <div>Avg Latency: {module.avg_latency_ms}ms</div>
                <div>P95 Latency: {module.p95_latency_ms}ms</div>
              </div>
            </div>
          ))}
          {!modules.length ? (
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              {loading
                ? "Syncing module telemetry"
                : error
                ? "System health is reconnecting to the last verified telemetry snapshot."
                : "No module telemetry events detected."}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
