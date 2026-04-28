import type { BehaviorSummary, BehaviorZone } from "@/lib/behavior/types";

type VulnerablePanelProps = {
  summary: BehaviorSummary;
  zones: BehaviorZone[];
};

export function VulnerablePanel({ summary, zones }: VulnerablePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Vulnerable occupants</p>
      <p className="mt-4 text-5xl font-black text-white">{summary.vulnerable_occupants.toLocaleString()}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">Estimated occupants needing assistance, slower evacuation lanes, responder escort, or simplified instructions.</p>
      <div className="mt-5 grid gap-3">
        {zones
          .slice()
          .sort((left, right) => right.vulnerable_occupants - left.vulnerable_occupants)
          .slice(0, 4)
          .map((zone) => (
            <div key={zone.zone_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{zone.name}</p>
                <p className="text-xl font-black text-amber-100">{zone.vulnerable_occupants}</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">{zone.avg_age_band} - mobility {zone.mobility_percent}%</p>
            </div>
          ))}
      </div>
    </section>
  );
}

