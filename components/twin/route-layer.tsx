import type { TwinRoute } from "@/lib/twin/types";

export function RouteLayer({ routes }: { routes: TwinRoute[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Command Overlay Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Route Guidance</h2>
      <div className="mt-5 space-y-3">
        {routes.map((route) => (
          <article key={route.route_id} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{route.name}</h3>
                <p className="mt-1 text-sm text-cyan-100/75">{route.distance_m}m · ETA {route.eta_minutes}m · {route.status}</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{route.confidence}%</p>
            </div>
            <ol className="mt-4 space-y-2">
              {route.steps.map((step) => (
                <li key={`${route.route_id}-${step}`} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200">{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

