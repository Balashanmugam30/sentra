import type { TwinFloor } from "@/lib/twin/types";
import { twinTone } from "@/lib/twin/runtime";

export function FloorMap({ floors }: { floors: TwinFloor[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Floor-By-Floor Command</p>
      <h2 className="mt-2 text-2xl font-black text-white">Live Floors</h2>
      <div className="mt-5 space-y-3">
        {floors.map((floor) => (
          <article key={floor.floor_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${twinTone(floor.risk)}`}>{floor.status.replaceAll("_", " ")}</span>
                <h3 className="mt-3 font-black text-white">{floor.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{floor.active_zone} · {floor.occupancy}/{floor.capacity} occupants</p>
              </div>
              <p className="text-right text-2xl font-black text-white">{floor.risk}</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Bar label="Readiness" value={floor.readiness} color="bg-emerald-300" />
              <Bar label="Evacuation" value={floor.evacuation_progress} color="bg-cyan-300" />
              <Bar label="Smoke" value={floor.smoke} color="bg-rose-300" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

