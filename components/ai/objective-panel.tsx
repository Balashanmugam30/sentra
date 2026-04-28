type ObjectivePanelProps = {
  activeObjective: string;
  busyAction?: string | null;
  onSelect: (objective: string) => void;
};

const objectives = ["minimize casualties", "fastest recovery", "preserve revenue", "protect reputation", "maintain continuity"];

export function ObjectivePanel({ activeObjective, busyAction, onSelect }: ObjectivePanelProps) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70">Objective engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Executive goal</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">Changing the objective reweights every agent, option, action, and approval threshold.</p>
      <div className="mt-5 grid gap-3">
        {objectives.map((objective) => (
          <button key={objective} type="button" onClick={() => onSelect(objective)} disabled={Boolean(busyAction)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition disabled:opacity-60 ${objective === activeObjective ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"}`}>
            {objective}
          </button>
        ))}
      </div>
    </section>
  );
}

