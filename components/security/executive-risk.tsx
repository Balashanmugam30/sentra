"use client";

import type { ExecutiveDefense } from "@/lib/securitydefense/types";

export function ExecutiveRisk({ executive }: { executive: ExecutiveDefense }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">Boardroom Cyber Summary</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Security-serious posture for enterprise and government review</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{executive.board_summary}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        <Metric label="Maturity" value={`${executive.security_maturity}%`} />
        <Metric label="Risk exposure" value={`${executive.risk_exposure}%`} />
        <Metric label="SLA response" value={`${executive.sla_response_score}%`} />
        <Metric label="Readiness" value={`${executive.readiness_index}%`} />
        <Metric label="Audit" value={`${executive.audit_integrity}%`} />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {executive.recommended_actions.map((action) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65" key={action}>{action}</div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 font-mono text-2xl text-white">{value}</p>
    </div>
  );
}
