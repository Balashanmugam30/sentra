import type { CrowdRoute } from "@/lib/behavior/crowd";

type RouteEngineProps = {
  routes: CrowdRoute[];
  busy?: boolean;
  onRecompute?: () => void;
};

export function RouteEngine({ routes, busy = false, onRecompute }: RouteEngineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Safe route engine</p>
          <h2 className="mt-2 text-2xl font-black text-white">Best evacuation plans</h2>
        </div>
        {onRecompute ? (
          <button type="button" onClick={onRecompute} disabled={busy} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60">
            {busy ? "Recomputing..." : "Recompute routes"}
          </button>
        ) : null}
      </div>
      <div className="mt-5 space-y-3">
        {routes.map((route, index) => (
          <article key={route.route_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Plan {index + 1} - {route.status}</p>
                <p className="mt-1 text-lg font-black text-white">{route.from_zone} to {route.target_exit}</p>
                <p className="mt-1 text-sm text-slate-300">{route.assembly_point}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-cyan-100">{route.eta_minutes}m</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ETA</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
              <span>Safety {route.safety_score}%</span>
              <span>Flow {route.people_per_minute}/min</span>
              <span>Compliance {route.compliance_score}%</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              {route.instructions.map((instruction) => (
                <li key={instruction}>- {instruction}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
