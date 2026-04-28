import type { TwinHazard, TwinResponder, TwinRoute, TwinZone } from "@/lib/twin/types";

type FacilityCanvasProps = {
  zones: TwinZone[];
  hazards: TwinHazard[];
  responders: TwinResponder[];
  routes: TwinRoute[];
};

export function FacilityCanvas({ zones, hazards, responders, routes }: FacilityCanvasProps) {
  const primaryRoute = routes[0];

  return (
    <section className="relative min-h-[460px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-5 shadow-2xl shadow-cyan-950/30">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">Hyperreal Facility Twin</p>
          <h2 className="mt-2 text-2xl font-black text-white">Live Facility View</h2>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">live linked</span>
      </div>

      <div className="relative mt-6 h-[340px] rounded-[2rem] border border-white/10 bg-black/25">
        {zones.map((zone) => (
          <div
            key={zone.zone_id}
            className={`absolute rounded-2xl border p-3 backdrop-blur ${
              zone.status === "hazard"
                ? "border-rose-300/40 bg-rose-400/20 shadow-[0_0_35px_rgba(251,113,133,0.28)]"
                : zone.status === "safe"
                  ? "border-emerald-300/35 bg-emerald-400/15"
                  : "border-cyan-300/25 bg-cyan-400/12"
            }`}
            style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.width}%`, height: `${zone.height}%` }}
          >
            <p className="text-xs font-black text-white">{zone.name}</p>
            <p className="mt-1 text-[11px] text-slate-300">{zone.occupancy} people · risk {zone.risk}</p>
          </div>
        ))}

        {primaryRoute?.path?.map((point, index) => (
          <div key={`${primaryRoute.route_id}-${point[0]}-${point[1]}`} className="absolute h-4 w-4 rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(103,232,249,0.75)]" style={{ left: `${point[0]}%`, top: `${point[1]}%` }}>
            <span className="absolute left-5 top-0 text-[10px] font-bold text-cyan-100">{index + 1}</span>
          </div>
        ))}

        {hazards.map((hazard) => (
          <div key={hazard.hazard_id} className="absolute left-[16%] top-[43%] h-28 w-28 animate-pulse rounded-full border border-rose-300/40 bg-rose-500/15 blur-[1px]" style={{ opacity: Math.min(0.75, hazard.severity / 100) }} />
        ))}

        {responders.map((responder) => (
          <div key={responder.responder_id} className="absolute rounded-full border border-white/30 bg-white/15 p-2 shadow-[0_0_25px_rgba(255,255,255,0.25)]" style={{ left: `${responder.x}%`, top: `${responder.y}%` }}>
            <div className="h-3 w-3 rounded-full bg-emerald-300" />
            <span className="absolute left-5 top-0 whitespace-nowrap text-[10px] font-bold text-white">{responder.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

