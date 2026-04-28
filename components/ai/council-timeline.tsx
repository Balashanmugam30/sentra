import type { CouncilTimelineEvent } from "@/lib/ai/types";

type CouncilTimelineProps = {
  events: CouncilTimelineEvent[];
};

export function CouncilTimeline({ events }: CouncilTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Council Timeline</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Decision ledger</h2>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <article key={`${event.timestamp}-${event.event}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-white">{event.event}</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {event.severity}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{event.detail}</p>
            <p className="mt-2 text-xs text-slate-500">
              {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
