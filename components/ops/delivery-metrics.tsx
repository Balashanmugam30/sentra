import type { OpsCommunicationsSnapshot } from "@/lib/ops/types";

type DeliveryMetricsProps = {
  snapshot: OpsCommunicationsSnapshot;
};

export function DeliveryMetrics({ snapshot }: DeliveryMetricsProps) {
  const metrics = [
    ["Broadcasts", snapshot.summary.active_broadcasts],
    ["Reached", snapshot.summary.population_reached],
    ["Acked", snapshot.summary.acknowledged],
    ["Need help", snapshot.summary.need_help],
    ["Trapped", snapshot.summary.trapped],
    ["Silent", snapshot.summary.silent],
    ["Delivery", `${snapshot.summary.delivery_success_percent}%`],
    ["Avg ack", snapshot.analytics.avg_ack_time],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        </article>
      ))}
    </section>
  );
}
