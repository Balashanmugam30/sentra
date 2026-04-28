import type { OpsExecutiveSnapshot, OpsResilienceSnapshot } from "@/lib/ops/types";

type ExecutiveKpisEliteProps = {
  executive?: OpsExecutiveSnapshot;
  resilience?: OpsResilienceSnapshot;
};

export function ExecutiveKpisElite({ executive, resilience }: ExecutiveKpisEliteProps) {
  const metrics = executive
    ? [
        ["Readiness", executive.summary.operational_readiness],
        ["Risks", executive.summary.active_risks],
        ["Exposure", executive.summary.financial_exposure],
        ["Reputation", executive.summary.reputation_score],
        ["Recovery", executive.summary.recovery_eta],
        ["Board confidence", executive.summary.board_confidence],
      ]
    : [
        ["Health", resilience?.summary?.health_score ?? 0],
        ["Degraded", resilience?.summary?.systems_degraded ?? 0],
        ["Ready heals", resilience?.summary?.auto_heal_ready ?? 0],
        ["Healed", resilience?.summary?.auto_healed ?? 0],
        ["Collapse risk", resilience?.summary?.collapse_risk ?? 0],
        ["Uptime", resilience?.summary?.uptime_protection ?? "0%"],
      ];

  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        </article>
      ))}
    </section>
  );
}
