type IpoScoreProps = {
  ipo: Record<string, unknown> | null;
};

export function IpoScore({ ipo }: IpoScoreProps) {
  const score = Number(ipo?.score ?? 69);
  const factors = ipo?.factors && typeof ipo.factors === "object" ? ipo.factors as Record<string, unknown> : {
    revenue_scale: 32,
    governance_maturity: 64,
    controls_maturity: 68,
    retention: 86,
    margins: 81,
    audit_readiness: 71,
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">IPO readiness</p>
      <div className="mt-4 flex items-center gap-5">
        <div className="grid h-32 w-32 place-items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 shadow-2xl shadow-cyan-950/30">
          <div className="text-center">
            <p className="text-4xl font-black text-white">{score}</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100">score</p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {Object.entries(factors).slice(0, 6).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[1fr_48px] items-center gap-3 text-sm">
              <span className="capitalize text-slate-300">{label.replaceAll("_", " ")}</span>
              <span className="font-black text-white">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

