import type { LearnedIncident, MemoryGraph } from "@/lib/behavior/learning";

type MemoryLedgerProps = {
  incidents: LearnedIncident[];
  memory: MemoryGraph;
};

export function MemoryLedger({ incidents, memory }: MemoryLedgerProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Incident memory ledger</p>
          <h2 className="mt-2 text-2xl font-black text-white">Behavior memory graph depth {memory.memory_depth}</h2>
        </div>
        <p className="text-sm text-slate-400">{memory.nodes.length} nodes / {memory.edges.length} links</p>
      </div>
      <div className="mt-5 space-y-3">
        {incidents.map((incident) => (
          <article key={incident.incident_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{incident.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{incident.action_chosen} led to {incident.crowd_outcome}.</p>
              </div>
              <span className="rounded-2xl bg-emerald-400/15 px-3 py-1 text-sm font-black text-emerald-100">{incident.success_score}</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
              <span>Panic -{incident.panic_reduction_percent}%</span>
              <span>Compliance {incident.compliance_percent}%</span>
              <span>Trust +{incident.trust_delta}</span>
              <span>Saved ${Math.round(incident.roi_saved / 1000)}K</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
