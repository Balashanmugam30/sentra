"use client";

import { platformStatusTone } from "@/lib/platform/runtime";
import type { PlatformRateLimitState } from "@/lib/platform/types";

export function RateLimitBoard({ rateLimits }: { rateLimits: PlatformRateLimitState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Rate Limits</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Abuse defense by tenant</h3>
      <div className="mt-5 space-y-3">
        {rateLimits.limits.map((limit) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={limit.tenant_id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{limit.tenant_id}</p>
                <p className="mt-1 text-xs text-white/45">{limit.plan} / {limit.per_minute.toLocaleString()} per minute</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${platformStatusTone(limit.status)}`}>{limit.status}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-200" style={{ width: `${limit.usage_percent}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
              <span>{limit.usage_percent}% used</span>
              <span>{limit.blocked_requests} blocked</span>
              <span>abuse {limit.abuse_score}/100</span>
              <span>{limit.burst_mode ? "burst enabled" : "burst off"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

