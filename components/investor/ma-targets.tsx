import { formatCurrency } from "@/lib/revenue/helpers";

type MaTargetsProps = {
  mna: Record<string, unknown> | null;
};

function targets(mna: Record<string, unknown> | null) {
  const value = mna?.targets ?? mna?.ranked_targets;
  return Array.isArray(value)
    ? (value as Array<Record<string, unknown>>)
    : [
        { name: "OpsVision AI", ARR: 1_200_000, multiple: 4.8, strategic_fit: 93, integration_risk: "medium", cross_sell_value: 2_600_000 },
        { name: "CivicGrid Systems", ARR: 860_000, multiple: 3.9, strategic_fit: 89, integration_risk: "low", cross_sell_value: 1_900_000 },
        { name: "UrbanTwin Labs", ARR: 620_000, multiple: 3.4, strategic_fit: 84, integration_risk: "medium", cross_sell_value: 1_300_000 },
      ];
}

export function MaTargets({ mna }: MaTargetsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">M&A strategy</p>
      <div className="mt-4 space-y-3">
        {targets(mna).map((target) => (
          <article key={String(target.name)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{String(target.name)}</p>
                <p className="text-xs text-slate-500">
                  Multiple {String(target.multiple)}x - risk {String(target.integration_risk)}
                </p>
              </div>
              <p className="text-xl font-black text-violet-100">{String(target.strategic_fit)} fit</p>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              ARR {formatCurrency(Number(target.ARR ?? target.arr ?? 0))} - cross-sell {formatCurrency(Number(target.cross_sell_value ?? 0))}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

