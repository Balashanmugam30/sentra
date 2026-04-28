import { resourceLoad, resourceTone } from "@/lib/twin/resources";
import type { TwinResourcesState } from "@/lib/twin/types";

type SwarmBoardProps = {
  resources: TwinResourcesState;
  busyAction: string | null;
  onRebalance: () => void;
};

export function SwarmBoard({ resources, busyAction, onRebalance }: SwarmBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Swarm Resource Coordination</p>
          <h2 className="mt-2 text-2xl font-black text-white">Resource Swarm</h2>
        </div>
        <button type="button" onClick={onRebalance} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-50 transition hover:bg-emerald-300/20">
          {busyAction === "rebalance-resources" ? "Rebalancing..." : "Rebalance swarm"}
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {resources.resources.map((resource) => (
          <article key={resource.resource_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white">{resource.name}</h3>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">{resourceTone(resource)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{resource.best_move}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Mini label="Load" value={`${resourceLoad(resource)}%`} />
              <Mini label="Idle" value={resource.idle.toString()} />
              <Mini label="Reserve" value={`${resource.reserve_health}%`} />
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

