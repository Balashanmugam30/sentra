import type { OpsExecutionSnapshot } from "@/lib/ops/types";

type ExecutiveKpisProps = {
  snapshot: OpsExecutionSnapshot;
};

export function ExecutiveKpis({ snapshot }: ExecutiveKpisProps) {
  const summary = snapshot.executive_summary;
  const metrics = [
    ["Active incidents", summary.incidents_active],
    ["Avg response", summary.avg_response_time],
    ["Tasks done", summary.tasks_completed],
    ["SLA success", summary.sla_success],
    ["Losses avoided", summary.estimated_losses_avoided],
    ["Recovery ETA", summary.recovery_eta],
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
