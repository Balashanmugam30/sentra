import type { CrowdZone } from "@/lib/behavior/crowd";

type CrowdHeatmapProps = {
  zones: CrowdZone[];
};

function heatClass(score: number) {
  if (score >= 82) {
    return "border-rose-300/35 bg-rose-500/20 shadow-rose-950/40";
  }
  if (score >= 68) {
    return "border-amber-300/35 bg-amber-400/15 shadow-amber-950/30";
  }
  return "border-cyan-300/20 bg-cyan-400/10 shadow-cyan-950/25";
}

export function CrowdHeatmap({ zones }: CrowdHeatmapProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Live occupancy grid</p>
          <h2 className="mt-2 text-2xl font-black text-white">Crowd density heatmap</h2>
        </div>
        <p className="text-sm text-slate-400">Density, panic, congestion, and blocked-zone pressure</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {zones.map((zone) => (
          <article key={zone.zone_id} className={`rounded-3xl border p-4 shadow-2xl ${heatClass(zone.congestion_score)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{zone.name}</p>
                <p className="mt-1 text-xs text-slate-300">Floor {zone.floor} - {zone.occupancy.toLocaleString()} people</p>
              </div>
              <span className="rounded-2xl bg-black/30 px-3 py-1 text-sm font-black text-white">{zone.congestion_score}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400" style={{ width: `${Math.min(zone.density, 100)}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-200">
              <span>Density {zone.density}</span>
              <span>Panic {zone.panic}</span>
              <span>Smoke {zone.smoke}</span>
              <span>Stampede {zone.stampede_risk}</span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">{zone.blocked ? "blocked route logic active" : zone.pressure_label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
