import type { OpsResolutionEvent } from "@/lib/ops/types";

type TrustLedgerProps = {
  ledger: OpsResolutionEvent[];
};

export function TrustLedger({ ledger }: TrustLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Audit + Trust Layer</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Explainable action history</h2>
      <div className="mt-5 grid gap-3">
        {ledger.map((event) => (
          <article key={`${event.timestamp}-${event.event}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{event.event}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{event.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
