import type { IotNetworkData } from "@/lib/iot/types";

export function BuildingNetwork({ data }: { data: IotNetworkData }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-5">
        {[
          ["Buildings Online", data.summary.buildings_online],
          ["Floors Monitored", data.summary.floors_monitored],
          ["Devices Active", data.summary.devices_active],
          ["Critical Incidents", data.summary.critical_incidents],
          ["Avg Response", `${data.summary.avg_response_time_seconds}s`],
        ].map(([label, value]) => (
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.buildings.map((building) => (
          <article className="rounded-[32px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]" key={building.name}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/55">{building.type}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{building.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white/65">{building.risk}</span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2 text-sm text-white/55">
              <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-white">{building.floors}</strong>floors</div>
              <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-white">{building.rooms}</strong>rooms</div>
              <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-white">{building.nodes}</strong>nodes</div>
              <div className="rounded-2xl bg-black/20 p-3"><strong className="block text-white">{building.camera_zones}</strong>camera zones</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
