import { modelStateTone } from "@/lib/mlops/runtime";
import type { ModelDeployment } from "@/lib/mlops/types";

type DeploymentBoardProps = {
  deployments: ModelDeployment[];
  busy?: boolean;
  onPromote: (modelId: string) => void;
  onRollback: (modelId: string) => void;
};

export function DeploymentBoard({ deployments, busy = false, onPromote, onRollback }: DeploymentBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Release center</p>
      <div className="mt-5 grid gap-3">
        {deployments.map((deployment) => (
          <article key={deployment.deployment_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{deployment.name} {deployment.version}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{deployment.release_notes}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${modelStateTone(deployment.state)}`}>{deployment.state}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Canary <b className="text-white">{deployment.canary_percent}%</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Health <b className="text-white">{deployment.version_health}</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Approval <b className="text-white">{deployment.approval_status}</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Shadow <b className="text-white">{deployment.shadow_model}</b></span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => onPromote(deployment.model_id)} disabled={busy} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
                Promote
              </button>
              <button type="button" onClick={() => onRollback(deployment.model_id)} disabled={busy || !deployment.rollback_available} className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-300/20 disabled:opacity-50">
                Rollback
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

