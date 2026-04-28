import type { OpsCommunicationsSnapshot } from "@/lib/ops/types";

type CommsLedgerProps = {
  snapshot: OpsCommunicationsSnapshot;
};

export function CommsLedger({ snapshot }: CommsLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Communications Audit Ledger</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Executive trust view</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">Confidence</p>
          <p className="mt-2 text-4xl font-black text-white">{snapshot.trust.communication_confidence}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Accountability</p>
          <p className="mt-2 text-4xl font-black text-white">{snapshot.trust.accountability_score}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Public risk</p>
          <p className="mt-2 text-4xl font-black text-cyan-100">{snapshot.trust.public_risk_lowered}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Board visibility</p>
          <p className="mt-2 text-xl font-bold text-amber-100">{snapshot.trust.board_visibility}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {snapshot.ledger.slice(-6).map((item) => (
          <article key={`${item.timestamp}-${item.event}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-white">{item.event}</p>
              <span className="text-xs text-slate-500">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
