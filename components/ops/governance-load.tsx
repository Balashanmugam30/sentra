import type { OpsRoleWorkload } from "@/lib/ops/types";

type GovernanceLoadProps = {
  workloads: OpsRoleWorkload[];
};

export function GovernanceLoad({ workloads }: GovernanceLoadProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Role Workload</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Governance load balancer</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {workloads.map((workload) => (
          <article key={workload.role} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{workload.role}</h3>
                <p className="mt-1 text-xs text-slate-500">{workload.pending} pending - {workload.avg_decision_time} avg</p>
              </div>
              <span className={workload.bottleneck ? "font-bold text-amber-100" : "font-bold text-emerald-100"}>{workload.load}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${workload.load}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
