type TrustLedgerProps = {
  ledger: Array<Record<string, unknown>>;
};

export function TrustLedger({ ledger }: TrustLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/70">Trust + explainability ledger</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ledger.map((item) => (
          <article key={String(item.signal)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{String(item.signal)}</p>
              <p className="text-xl font-black text-indigo-100">{String(item.confidence)}%</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{String(item.explanation)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

