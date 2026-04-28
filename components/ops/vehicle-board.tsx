import type { OpsVehicle } from "@/lib/ops/types";

type VehicleBoardProps = {
  vehicles: OpsVehicle[];
};

export function VehicleBoard({ vehicles }: VehicleBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Vehicle Fleet</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">ETA and reroute engine</h2>
      <div className="mt-5 grid gap-3">
        {vehicles.map((vehicle) => (
          <article key={vehicle.vehicle_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{vehicle.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{vehicle.type} - {vehicle.route}</p>
              </div>
              <span className={vehicle.blocked_route ? "font-bold text-amber-100" : "font-bold text-cyan-100"}>{vehicle.eta_minutes}m</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{vehicle.blocked_route ? vehicle.reroute : vehicle.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
