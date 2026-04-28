import type { ModelDeployment } from "@/lib/mlops/types";

type CanaryPanelProps = {
  deployments: ModelDeployment[];
  busy?: boolean;
  onCanary: (modelId: string, percent: number) => void;
};

export function CanaryPanel({ deployments, busy = false, onCanary }: CanaryPanelProps) {
  const canaryModels = deployments.filter((deployment) => deployment.state === "canary" || deployment.state === "staging" || deployment.state === "shadow");
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">Canary control</p>
      <h2 className="mt-2 text-2xl font-black text-white">Progressive release gates</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">Move staging and shadow models through 10, 25, and 50 percent governed traffic while production models continue serving live decisions.</p>
      <div className="mt-5 space-y-3">
        {canaryModels.map((deployment) => (
          <article key={deployment.deployment_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-white">{deployment.name}</p>
                <p className="mt-1 text-sm text-slate-400">{deployment.canary_percent}% active canary</p>
              </div>
              <div className="flex gap-2">
                {[10, 25, 50].map((percent) => (
                  <button key={percent} type="button" onClick={() => onCanary(deployment.model_id, percent)} disabled={busy} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60">
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

