import type { OpsEscalation } from "@/lib/ops/types";

type EscalationQueueProps = {
  escalations: OpsEscalation[];
};

export function EscalationQueue({ escalations }: EscalationQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Escalation Queue</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Backup triggers</h2>
      <div className="mt-5 grid gap-3">
        {escalations.map((item) => (
          <article key={item.escalation_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.action}</p>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-100">
                L{item.level}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{item.owner}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
