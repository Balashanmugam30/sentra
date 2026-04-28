import type { MLOpsMonitoring } from "@/lib/mlops/types";

type RetrainCenterProps = {
  monitoring: MLOpsMonitoring;
  busy?: boolean;
  onRetrain: (domain: string) => void;
};

export function RetrainCenter({ monitoring, busy = false, onRetrain }: RetrainCenterProps) {
  return (
    <section className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100/80">Auto retrain</p>
      <h2 className="mt-2 text-2xl font-black text-white">Recommendations</h2>
      <div className="mt-5 space-y-3">
        {monitoring.retrain_recommendations.map((recommendation) => (
          <article key={recommendation.domain} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{recommendation.domain}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{recommendation.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-100">{recommendation.trigger}</p>
              </div>
              <button type="button" onClick={() => onRetrain(recommendation.domain)} disabled={busy} className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20 disabled:opacity-60">
                Trigger retrain
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

