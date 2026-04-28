"use client";

import type { SecuritySummary } from "@/lib/securitycenter/types";

export function MfaMeter({ summary }: { summary: SecuritySummary }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">MFA + SSO</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Enterprise sign-in posture</h2>
        </div>
        <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-2 font-mono text-2xl text-emerald-100">
          {summary.mfa_coverage}%
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${summary.mfa_coverage}%` }} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {summary.auth_methods.map((method) => (
          <div key={method.method} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{method.method}</p>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                {method.status}
              </span>
            </div>
            <p className="mt-3 font-mono text-xl text-cyan-100">{method.coverage}%</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {summary.mfa_methods.map((method) => (
          <span key={method.method} className="rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-50/75">
            {method.method}: {method.status}
          </span>
        ))}
      </div>
    </section>
  );
}
