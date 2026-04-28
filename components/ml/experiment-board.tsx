import type { MLExperiment } from "@/lib/ml/types";

type ExperimentBoardProps = {
  experiments: MLExperiment[];
};

export function ExperimentBoard({ experiments }: ExperimentBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Experiment runs</p>
      <div className="mt-5 space-y-3">
        {experiments.map((experiment) => (
          <article key={experiment.experiment_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{experiment.name}</p>
                <p className="mt-1 text-xs text-slate-400">{experiment.model_domain} - {experiment.runs} runs</p>
              </div>
              <span className="text-xl font-black text-cyan-100">{experiment.best_accuracy}%</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Winner {experiment.winner_run} using {experiment.feature_count} features - {experiment.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
