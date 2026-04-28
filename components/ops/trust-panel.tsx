import type { OpsGovernanceSnapshot } from "@/lib/ops/types";

type TrustPanelProps = {
  snapshot: OpsGovernanceSnapshot;
};

export function TrustPanel({ snapshot }: TrustPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Executive Trust Panel</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Autonomy with control</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Trust Score</p>
          <p className="mt-2 text-5xl font-black text-white">{snapshot.trust.trust_score}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Maturity</p>
          <p className="mt-2 text-xl font-semibold text-cyan-100">{snapshot.trust.autonomy_maturity}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Decisions governed: {snapshot.trust.decisions_governed}</span>
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Unsafe actions blocked: {snapshot.trust.unsafe_actions_blocked}</span>
        <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-sm text-slate-300">Audit completeness: {snapshot.trust.audit_completeness}</span>
      </div>
    </section>
  );
}
