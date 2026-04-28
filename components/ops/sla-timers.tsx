import { formatRemainingMinutes } from "@/lib/ops/sla";
import type { OpsSlaTimer } from "@/lib/ops/types";

type SlaTimersProps = {
  timers: OpsSlaTimer[];
};

export function SlaTimers({ timers }: SlaTimersProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">SLA Timers</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Escalation countdowns</h2>
      <div className="mt-5 grid gap-3">
        {timers.map((timer) => (
          <article key={timer.task_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{timer.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{timer.owner}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-bold text-white">
                {formatRemainingMinutes(timer.remaining_minutes)}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Escalation level {timer.escalation_level}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
