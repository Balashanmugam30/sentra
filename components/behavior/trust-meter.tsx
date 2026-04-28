import type { DecisionSnapshot } from "@/lib/behavior/decision";

type TrustMeterProps = {
  decision: DecisionSnapshot;
};

export function TrustMeter({ decision }: TrustMeterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Human trust engine</p>
      <div className="mt-5 grid gap-3">
        {decision.zone_messaging_orders.map((order) => (
          <article key={order.zone} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{order.zone}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{order.tone}</p>
              </div>
              <span className="text-xl font-black text-emerald-100">{order.confidence}%</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{order.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
