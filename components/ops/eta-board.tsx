import type { OpsMissionAssignment } from "@/lib/ops/types";

type EtaBoardProps = {
  assignments: OpsMissionAssignment[];
};

export function EtaBoard({ assignments }: EtaBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">ETA Board</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Arrival predictions</h2>
      <div className="mt-5 grid gap-3">
        {assignments.map((assignment) => (
          <article key={assignment.assignment_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{assignment.unit}</h3>
                <p className="mt-1 text-sm text-slate-300">{assignment.incident}</p>
              </div>
              <span className="text-3xl font-black text-amber-100">{assignment.eta_minutes}m</span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{assignment.status} - {assignment.confidence}% confidence</p>
          </article>
        ))}
      </div>
    </section>
  );
}
