"use client";

import type { ZeroTrustPolicy } from "@/lib/securitydefense/types";

export function PolicyGrid({ policies }: { policies: ZeroTrustPolicy[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Policy Blocks</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Zero trust guardrails</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {policies.map((policy) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={policy.policy_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{policy.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{policy.control}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{policy.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Coverage" value={`${policy.coverage}%`} />
              <Metric label="Blocks" value={`${policy.blocks}`} />
              <Metric label="Step-up" value={`${policy.step_up_count}`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}
