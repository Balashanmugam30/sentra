import type { OpsWorkflow } from "@/lib/ops/types";

type WorkflowQueueProps = {
  workflows: OpsWorkflow[];
};

export function WorkflowQueue({ workflows }: WorkflowQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Workflow Queue</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Executable playbooks</h2>
      <div className="mt-5 space-y-3">
        {workflows.map((workflow) => (
          <article key={workflow.workflow_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{workflow.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{workflow.owner} - {workflow.status}</p>
              </div>
              <span className="text-2xl font-black text-cyan-100">{workflow.progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${workflow.progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {workflow.tasks_completed}/{workflow.tasks_total} tasks completed
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
