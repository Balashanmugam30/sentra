import type { TwinCampusState } from "@/lib/twin/types";
import { twinTone } from "@/lib/twin/runtime";

export function CampusGrid({ campus }: { campus: TwinCampusState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/70">Multi-Building Twin Mode</p>
      <h2 className="mt-2 text-2xl font-black text-white">Campus Grid</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {campus.buildings.map((building) => (
          <article key={building.building_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${twinTone(building.pressure)}`}>{building.incident}</span>
            <h3 className="mt-3 font-black text-white">{building.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{building.campus} · {building.occupancy.toLocaleString()} occupants</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Mini label="Health" value={`${building.health}%`} />
              <Mini label="Pressure" value={`${building.pressure}%`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

