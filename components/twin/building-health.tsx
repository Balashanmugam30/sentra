import type { TwinCampusState } from "@/lib/twin/types";

export function BuildingHealth({ campus }: { campus: TwinCampusState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Network Twin</p>
      <h2 className="mt-2 text-2xl font-black text-white">Cascading Risk Map</h2>
      <div className="mt-5 space-y-3">
        {(campus.links ?? []).map((link) => (
          <article key={link.link_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{link.from} to {link.to}</h3>
                <p className="mt-1 text-sm text-slate-400">{link.travel_minutes} min inter-building route</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{link.route_health}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${link.route_health}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

