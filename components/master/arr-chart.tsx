import { formatCurrency } from "@/lib/master/runtime";
import type { MasterBoardSummary, MasterRevenueRow } from "@/lib/master/types";

type ARRChartProps = {
  summary: MasterBoardSummary;
  revenue: MasterRevenueRow[];
};

export function ARRChart({ summary, revenue }: ARRChartProps) {
  const maxArr = Math.max(...revenue.map((row) => row.arr), 1);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Board Intelligence</p>
      <h2 className="mt-2 text-2xl font-black text-white">ARR Dashboard</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Metric label="ARR" value={formatCurrency(summary.arr)} tone="text-emerald-200" />
        <Metric label="MRR" value={formatCurrency(summary.mrr)} tone="text-cyan-200" />
        <Metric label="Growth" value={`${summary.growth_percent}%`} tone="text-blue-200" />
        <Metric label="NRR" value={`${summary.nrr}%`} tone="text-amber-200" />
      </div>
      <div className="mt-5 space-y-3">
        {revenue.slice(0, 6).map((row) => (
          <div key={row.revenue_id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">{row.tenant_name}</span>
              <span className="text-emerald-200">{formatCurrency(row.arr)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.max(8, (row.arr / maxArr) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

