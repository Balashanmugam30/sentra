type CapTableChartProps = {
  captable: Record<string, unknown> | null;
  busyAction: string | null;
  onUpdate: () => void;
};

function ownershipRows(captable: Record<string, unknown> | null) {
  const heatmap = captable?.dilution_heatmap;
  if (Array.isArray(heatmap)) {
    return heatmap as Array<Record<string, unknown>>;
  }

  const rows = captable?.ownership_waterfall ?? captable?.current_ownership;
  return Array.isArray(rows)
    ? (rows as Array<Record<string, unknown>>)
    : [
        { holder: "Founders", ownership_percent: 72 },
        { holder: "Employee pool", ownership_percent: 12 },
        { holder: "SAFE investors", ownership_percent: 8 },
        { holder: "Seed investors", ownership_percent: 8 },
      ];
}

export function CapTableChart({ captable, busyAction, onUpdate }: CapTableChartProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Ownership engine</p>
          <h2 className="mt-2 text-2xl font-black text-white">Cap table model</h2>
        </div>
        <button
          type="button"
          onClick={onUpdate}
          disabled={busyAction === "cap-table"}
          className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-60"
        >
          Simulate round
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {ownershipRows(captable).map((row) => {
          const label = String(row.holder ?? row.name ?? row.label ?? row.stakeholder);
          const value = Number(row.ownership_percent ?? row.percent ?? row.series_b ?? row.post_seed_percent ?? 0);
          return (
            <article key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xl font-black text-amber-100">{value}%</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-300" style={{ width: `${Math.min(100, value)}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

