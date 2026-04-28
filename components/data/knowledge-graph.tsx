import type { DataHubGraph } from "@/lib/data/types";

export function KnowledgeGraph({ graph }: { graph: DataHubGraph }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/60">Knowledge Graph</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">People, zones, devices, incidents, vendors, risks</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {graph.entities.map((entity) => (
          <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-5" key={entity.entity_id}>
            <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-cyan-300/10 blur-2xl" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{entity.type}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{entity.label}</h3>
                </div>
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">risk {entity.risk_score}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/60">{entity.insight}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entity.linked_to.map((link) => (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55" key={`${entity.entity_id}-${link}`}>
                    {link}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
