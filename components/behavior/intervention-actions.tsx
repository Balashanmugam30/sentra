import type { BehaviorZone } from "@/lib/behavior/types";

type InterventionActionsProps = {
  zones: BehaviorZone[];
};

export function InterventionActions({ zones }: InterventionActionsProps) {
  const actions = zones
    .slice()
    .sort((left, right) => right.bottleneck_score + right.panic_score - (left.bottleneck_score + left.panic_score))
    .slice(0, 6);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Intervention actions</p>
      <div className="mt-4 grid gap-3">
        {actions.map((zone, index) => (
          <article key={zone.zone_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-sm font-black text-emerald-100">{index + 1}</span>
              <div>
                <p className="font-semibold text-white">{zone.intervention}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{zone.name} - {zone.recommended_communication}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

