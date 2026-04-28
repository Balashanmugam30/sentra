import type { EvacuationSnapshot } from "@/lib/behavior/crowd";

type EvacProgressProps = {
  evacuation: EvacuationSnapshot;
};

export function EvacProgress({ evacuation }: EvacProgressProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Evacuation progress</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className="grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-emerald-300 text-slate-950 shadow-2xl shadow-cyan-950/40">
          <div className="text-center">
            <p className="text-5xl font-black">{evacuation.people_cleared_percent}%</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">cleared</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-black text-white">{evacuation.estimated_full_evac_minutes} min full evacuation</h2>
          <p className="mt-2 text-sm text-slate-300">{evacuation.people_cleared.toLocaleString()} cleared, {evacuation.people_remaining.toLocaleString()} remaining, {evacuation.special_assistance_queue} in assistance queue.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Blocked</p>
              <p className="mt-1 text-lg font-black text-white">{evacuation.blocked_zones.length || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk zones</p>
              <p className="mt-1 text-lg font-black text-white">{evacuation.risk_zones.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Environment</p>
              <p className="mt-1 text-lg font-black text-white">{evacuation.environment.name}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
