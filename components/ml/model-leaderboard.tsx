import type { MLModel } from "@/lib/ml/types";

type ModelLeaderboardProps = {
  models: MLModel[];
};

export function ModelLeaderboard({ models }: ModelLeaderboardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Accuracy leaderboard</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {models.slice(0, 6).map((model) => (
          <article key={model.model_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{model.name} {model.version}</p>
                <p className="mt-1 text-xs text-slate-400">{model.domain} - {model.owner}</p>
              </div>
              <span className="text-2xl font-black text-emerald-100">{model.score}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{model.status} - {model.latency_ms}ms latency</p>
          </article>
        ))}
      </div>
    </section>
  );
}
