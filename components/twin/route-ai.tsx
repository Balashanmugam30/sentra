import { routeEfficiency, routePressure } from "@/lib/twin/routes";
import type { TwinLiveRoutes } from "@/lib/twin/types";

type RouteAIProps = {
  routes: TwinLiveRoutes;
  busyAction: string | null;
  onCompute: (useCase?: string) => void;
};

export function RouteAI({ routes, busyAction, onCompute }: RouteAIProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Autonomous Route Optimization</p>
          <h2 className="mt-2 text-2xl font-black text-white">Route AI</h2>
        </div>
        <button type="button" onClick={() => onCompute("fire_team_pathing")} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/20">
          {busyAction === "compute-route" ? "Computing..." : "Compute route"}
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {routes.routes.map((route) => (
          <article key={route.route_id} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{route.name}</h3>
                <p className="mt-1 text-sm text-cyan-100/75">{route.from} to {route.to} · {route.owner}</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{route.score}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Mini label="ETA" value={`${route.eta_minutes}m`} />
              <Mini label="Efficiency" value={`${routeEfficiency(route)}%`} />
              <Mini label="Pressure" value={`${routePressure(route)}%`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

