import { getCommsRiskTone } from "@/lib/ops/communications";
import type { OpsCommsZoneStatus } from "@/lib/ops/types";

type StatusMapProps = {
  zones: OpsCommsZoneStatus[];
};

export function StatusMap({ zones }: StatusMapProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Geo / Zone Alerts</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Live status map</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {zones.map((zone) => (
          <article key={zone.zone} className={`rounded-3xl border p-4 ${getCommsRiskTone(zone.risk)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{zone.zone}</h3>
                <p className="mt-1 text-xs opacity-70">{zone.building}</p>
              </div>
              <span className="text-2xl font-black text-white">{zone.evacuation_complete}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/20">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${zone.evacuation_complete}%` }} />
            </div>
            <p className="mt-3 text-sm opacity-80">
              Ack {zone.acknowledged}% - Silent {zone.silent} - Help {zone.help_requests} - Trapped {zone.trapped}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
