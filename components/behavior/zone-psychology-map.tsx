import type { BehaviorZone } from "@/lib/behavior/types";

type ZonePsychologyMapProps = {
  zones: BehaviorZone[];
};

function heatClass(score: number) {
  if (score >= 70) {
    return "border-rose-300/30 bg-rose-400/15 text-rose-50";
  }
  if (score >= 50) {
    return "border-amber-300/30 bg-amber-400/15 text-amber-50";
  }
  return "border-emerald-300/25 bg-emerald-400/10 text-emerald-50";
}

export function ZonePsychologyMap({ zones }: ZonePsychologyMapProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Zone psychology map</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((zone) => {
          const score = Math.round((zone.panic_score + zone.freeze_score + zone.herd_score + zone.bottleneck_score) / 4);
          return (
            <article key={zone.zone_id} className={`rounded-3xl border p-4 ${heatClass(score)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{zone.name}</p>
                  <p className="mt-1 text-xs opacity-80">{zone.population.toLocaleString()} people - density {zone.density}</p>
                </div>
                <span className="text-2xl font-black">{score}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span>Panic {zone.panic_score}</span>
                <span>Freeze {zone.freeze_score}</span>
                <span>Herd {zone.herd_score}</span>
                <span>Bottleneck {zone.bottleneck_score}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">{zone.explanation}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

