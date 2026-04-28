import type { TwinZone } from "@/lib/twin/types";

export function OccupancyHeatmap({ zones }: { zones: TwinZone[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-orange-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200/70">Crowd Visualization Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Occupancy Heatmap</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {zones.map((zone) => (
          <article key={zone.zone_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">{zone.name}</h3>
              <span className="text-xl font-black text-orange-200">{zone.density}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-400" style={{ width: `${zone.density}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-400">{zone.occupancy} people · flow {zone.flow}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

