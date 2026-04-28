"use client";

import type { PlatformUsageState } from "@/lib/platform/types";

export function UsageChart({ usage }: { usage: PlatformUsageState }) {
  const maxRequests = Math.max(1, ...usage.top_endpoints.map((endpoint) => endpoint.requests));
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Usage Metering</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">API traffic intelligence</h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Daily</p>
          <p className="font-mono text-2xl text-white">{usage.daily_requests.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {usage.top_endpoints.map((endpoint) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={endpoint.endpoint}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-mono text-cyan-100/80">{endpoint.endpoint}</span>
              <span className="text-white/60">{endpoint.requests.toLocaleString()} req</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-200" style={{ width: `${(endpoint.requests / maxRequests) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="Monthly" value={usage.monthly_requests.toLocaleString()} />
        <Metric label="Error" value={`${usage.error_percent}%`} />
        <Metric label="Avg Latency" value={`${usage.avg_latency_ms}ms`} />
        <Metric label="P95" value={`${usage.p95_latency_ms}ms`} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}

