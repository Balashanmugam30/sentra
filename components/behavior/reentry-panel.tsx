import type { EvacuationSnapshot } from "@/lib/behavior/crowd";

type ReentryPanelProps = {
  evacuation: EvacuationSnapshot;
};

export function ReentryPanel({ evacuation }: ReentryPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Re-entry readiness</p>
      <div className="mt-5 space-y-3">
        {evacuation.reentry.zones.map((zone) => (
          <article key={zone.zone} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{zone.zone}</p>
                <p className="mt-1 text-xs text-slate-400">{zone.requirement}</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{zone.readiness}</p>
            </div>
            <p className="mt-3 text-sm text-slate-300">{zone.status} - earliest {zone.earliest_reentry_minutes} min</p>
          </article>
        ))}
      </div>
    </section>
  );
}
