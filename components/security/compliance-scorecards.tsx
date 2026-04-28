"use client";

import { trustTone } from "@/lib/securitytrust/runtime";
import type { ComplianceFramework } from "@/lib/securitytrust/types";

export function ComplianceScorecards({ frameworks }: { frameworks: ComplianceFramework[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {frameworks.map((framework) => (
        <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl" key={framework.framework_id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/65">{framework.framework_id}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{framework.name}</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 font-mono text-xs ${trustTone(framework.score)}`}>{framework.score}%</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${framework.score}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Metric label="Pass" value={`${framework.control_pass_rate}%`} />
            <Metric label="Gaps" value={`${framework.open_gaps}`} />
            <Metric label="ETA" value={`${framework.remediation_eta_days}d`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {framework.controls.map((control) => (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55" key={control}>{control}</span>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}
