import type { CrowdExit } from "@/lib/behavior/crowd";

type ExitMonitorProps = {
  exits: CrowdExit[];
};

function tone(pressure: number) {
  if (pressure >= 86) {
    return "text-rose-100 bg-rose-500/15 border-rose-300/30";
  }
  if (pressure >= 70) {
    return "text-amber-100 bg-amber-400/15 border-amber-300/30";
  }
  return "text-emerald-100 bg-emerald-400/10 border-emerald-300/25";
}

export function ExitMonitor({ exits }: ExitMonitorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Exit pressure monitor</p>
      <div className="mt-5 space-y-3">
        {exits.map((exit) => (
          <article key={exit.exit_id} className={`rounded-3xl border p-4 ${tone(exit.pressure)}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{exit.name}</p>
                <p className="mt-1 text-xs opacity-80">{exit.assembly_point} - {exit.distance_m}m</p>
              </div>
              <span className="text-2xl font-black">{exit.pressure}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-current" style={{ width: `${Math.min(exit.pressure, 100)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span>Load {exit.current_load}/{exit.capacity_per_min}/min</span>
              <span>Collapse risk {exit.collapse_risk}</span>
              <span>{exit.control_action}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
