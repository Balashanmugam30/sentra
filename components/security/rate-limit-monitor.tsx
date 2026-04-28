"use client";

import { useEffect, useState } from "react";

import { buildRateLimitSnapshot } from "@/lib/security/rateLimit";

export function RateLimitMonitor() {
  const [snapshot, setSnapshot] = useState(() => buildRateLimitSnapshot());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSnapshot(buildRateLimitSnapshot());
    }, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Rate Limit Monitor
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Abuse prevention rules</h2>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold uppercase text-emerald-100">
          {snapshot.posture}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Requests/min", snapshot.requestsPerMinute],
          ["P95 latency", `${snapshot.p95LatencyMs}ms`],
          ["Dedupe blocks", snapshot.duplicateRequestsPrevented],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4" key={label}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {snapshot.rules.map((rule) => (
          <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={rule.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">{rule.route}</h3>
                <p className="mt-1 text-xs text-white/45">
                  {rule.limit} per {rule.window}
                </p>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100">
                {rule.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
