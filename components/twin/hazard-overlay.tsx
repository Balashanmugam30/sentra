import type { TwinHazard } from "@/lib/twin/types";

export function HazardOverlay({ hazards }: { hazards: TwinHazard[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/70">Hazard Propagation Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Hazard Overlay</h2>
      <div className="mt-5 space-y-3">
        {hazards.map((hazard) => (
          <article key={hazard.hazard_id} className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black capitalize text-white">{hazard.type.replaceAll("_", " ")}</h3>
                <p className="mt-1 text-sm text-rose-100/75">{hazard.projection_10m}</p>
              </div>
              <p className="text-2xl font-black text-rose-100">{hazard.severity}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-rose-300 shadow-[0_0_20px_rgba(253,164,175,0.45)]" style={{ width: `${hazard.severity}%` }} />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-rose-200/60">Spread {hazard.spread_rate}% / 10m</p>
          </article>
        ))}
      </div>
    </section>
  );
}

