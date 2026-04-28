import type { OpsTeam } from "@/lib/ops/types";

type TeamGridProps = {
  teams: OpsTeam[];
};

export function TeamGrid({ teams }: TeamGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Team Allocation</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Capacity and readiness</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {teams.map((team) => (
          <article key={team.department} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{team.department}</h3>
                <p className="mt-1 text-xs text-slate-500">{team.lead} - {team.status}</p>
              </div>
              <span className="text-2xl font-black text-emerald-100">{team.readiness}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${team.readiness}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-400">Load {team.load}/{team.capacity}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
