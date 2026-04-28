import type { OpsBoardSummary, OpsExecutionTunerRecord, OpsExecutiveRisk, OpsFinancialExposure, OpsReputationExposure, OpsTeamUtilization, OpsSlaHealthSummary } from "@/lib/ops/types";

type BoardSummaryProps = {
  summary: OpsBoardSummary;
  risks: OpsExecutiveRisk[];
  financial: OpsFinancialExposure;
  reputation: OpsReputationExposure;
  teams: OpsTeamUtilization[];
  sla: OpsSlaHealthSummary;
  tuner: OpsExecutionTunerRecord[];
};

export function BoardSummary({ summary, risks, financial, reputation, teams, sla, tuner }: BoardSummaryProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Board Summary</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Export-ready executive narrative</h2>
      <p className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-lg leading-8 text-cyan-50">
        {summary.headline}
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {summary.talking_points.map((point) => (
          <p key={point} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{point}</p>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Exposure {financial.current}</span>
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Avoidable {financial.avoidable}</span>
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Reputation {reputation.customer_confidence}</span>
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">SLA {sla.success_rate}%</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {risks.map((risk) => <p key={risk.risk_id} className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">{risk.title}: {risk.mitigation}</p>)}
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-2">
        {teams.map((team) => <p key={team.team} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{team.team}: {team.utilization}% {team.status}</p>)}
        {tuner.map((item) => <p key={item.lever} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{item.lever}: {item.gain}</p>)}
      </div>
    </section>
  );
}
