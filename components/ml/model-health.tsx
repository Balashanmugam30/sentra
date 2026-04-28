import { modelStateTone } from "@/lib/mlops/runtime";
import type { LiveModel } from "@/lib/mlops/types";

type ModelHealthProps = {
  models: LiveModel[];
};

export function ModelHealth({ models }: ModelHealthProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Model health</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {models.map((model) => (
          <article key={model.model_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{model.name}</p>
                <p className="mt-1 text-xs text-slate-400">{model.version} - {model.owner}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${modelStateTone(model.state)}`}>{model.state}</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Accuracy <b className="text-white">{model.accuracy}%</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Latency <b className="text-white">{model.latency_ms}ms</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Errors <b className="text-white">{model.error_rate}%</b></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

