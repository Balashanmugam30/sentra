import type { UpdatedPlaybook } from "@/lib/behavior/learning";

type PlaybookEvolutionProps = {
  playbooks: UpdatedPlaybook[];
};

export function PlaybookEvolution({ playbooks }: PlaybookEvolutionProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Updated playbooks</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {playbooks.map((playbook) => (
          <article key={playbook.playbook_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{playbook.population_type}</p>
            <p className="mt-2 font-black text-white">{playbook.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{playbook.improvement}</p>
            <p className="mt-3 text-lg font-black text-cyan-100">{playbook.confidence}% confidence</p>
          </article>
        ))}
      </div>
    </section>
  );
}
