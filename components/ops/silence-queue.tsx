import { getCommsRiskTone } from "@/lib/ops/communications";
import type { OpsSilenceEscalation } from "@/lib/ops/types";

type SilenceQueueProps = {
  escalations: OpsSilenceEscalation[];
};

export function SilenceQueue({ escalations }: SilenceQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-100/70">Silence Escalation Queue</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Non-response rescue paths</h2>
      <div className="mt-5 grid gap-3">
        {escalations.map((escalation) => (
          <article key={escalation.escalation_id} className={`rounded-3xl border p-4 ${getCommsRiskTone(escalation.priority)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{escalation.target}</h3>
                <p className="mt-2 text-sm opacity-80">{escalation.next_action}</p>
              </div>
              <span className="text-2xl font-black text-white">{escalation.silent_count}</span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] opacity-70">{escalation.owner} - last {escalation.last_channel}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
