import type { MasterIncident, MasterRegion } from "@/lib/master/types";
import { statusTone } from "@/lib/master/runtime";

type GlobalMapProps = {
  regions: MasterRegion[];
  incidents: MasterIncident[];
};

export function GlobalMap({ regions, incidents }: GlobalMapProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200/70">Global Command Cloud</p>
      <h2 className="mt-2 text-2xl font-black text-white">Regional Map & Incidents</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[330px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.22),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            {regions.map((region) => (
              <article key={region.region_id} className="rounded-3xl border border-blue-300/15 bg-blue-300/10 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white">{region.name}</h3>
                  <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Mini label="Tenants" value={region.tenants.toString()} />
                  <Mini label="SLA" value={`${region.sla_percent}%`} />
                  <Mini label="Latency" value={`${region.latency_ms}ms`} />
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <article key={incident.incident_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone(incident.severity)}`}>{incident.severity}</span>
              <h3 className="mt-3 font-black text-white">{incident.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{incident.status.replaceAll("_", " ")} · stability ETA {incident.eta_to_stability_min}m · {incident.actions_linked} actions</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
      <p className="text-base font-black text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}

