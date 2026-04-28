import type { CrowdSnapshot } from "@/lib/behavior/crowd";

type FlowBoardProps = {
  crowd: CrowdSnapshot;
};

export function FlowBoard({ crowd }: FlowBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Flow speed tracker</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {crowd.occupancy_grid.map((zone) => (
          <div key={zone.zone_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-white">{zone.name}</p>
                <p className="mt-1 text-xs text-slate-400">Exit width {zone.exit_width_m}m - visibility {zone.visibility}</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{zone.people_per_minute}</p>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">people / minute</p>
          </div>
        ))}
      </div>
    </section>
  );
}
