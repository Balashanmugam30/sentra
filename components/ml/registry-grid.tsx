import { modelPromotionScore } from "@/lib/ml/training";
import type { MLModel } from "@/lib/ml/types";

type RegistryGridProps = {
  models: MLModel[];
  busy?: boolean;
  onPromote?: (modelId: string) => void;
  onArchive?: (modelId: string) => void;
};

export function RegistryGrid({ models, busy = false, onPromote, onArchive }: RegistryGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Model registry</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <article key={model.model_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{model.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{model.version} - {model.status}</p>
              </div>
              <span className="text-xl font-black text-emerald-100">{modelPromotionScore(model)}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{model.domain}</p>
            <p className="mt-1 text-xs text-slate-500">Rollback {model.rollback_to} - {model.latency_ms}ms</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {onPromote ? (
                <button type="button" onClick={() => onPromote(model.model_id)} disabled={busy || model.production} className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-50">
                  Promote
                </button>
              ) : null}
              {onArchive ? (
                <button type="button" onClick={() => onArchive(model.model_id)} disabled={busy || model.status === "archived"} className="rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-300/20 disabled:opacity-50">
                  Archive
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
