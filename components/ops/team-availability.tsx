import type { OpsReserveUnit, OpsResourceTeam } from "@/lib/ops/types";

type TeamAvailabilityProps = {
  teams: OpsResourceTeam[];
  reserves: OpsReserveUnit[];
};

export function TeamAvailability({ teams, reserves }: TeamAvailabilityProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Team Availability</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Capacity, skills, reserves</h2>
      <div className="mt-5 grid gap-3">
        {teams.map((team) => (
          <article key={team.unit_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{team.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{team.location} - {team.skills.join(", ")}</p>
              </div>
              <span className={team.availability === "available" ? "font-bold text-emerald-100" : "font-bold text-amber-100"}>
                {team.availability}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Workload {team.workload}% - fatigue {team.fatigue_score} - ETA {team.eta_minutes}m</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        {reserves.map((reserve) => (
          <div key={reserve.reserve_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
            <span className="text-slate-300">{reserve.name}</span>
            <span className={reserve.recommended ? "font-bold text-cyan-100" : "font-bold text-slate-300"}>
              {reserve.available} ready - {reserve.activation_eta}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
