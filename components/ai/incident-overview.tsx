import type { AIDecisionIncident, AIDecisionScores } from "@/lib/ai/types";

export function IncidentOverview({
  incident,
  scores,
}: {
  incident: AIDecisionIncident;
  scores: AIDecisionScores;
}) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Active Incident Overview</p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white">{incident.label}</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {incident.building} - Floor {incident.floor} - {incident.zone}
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold uppercase text-cyan-100">
          {scores.urgency_level}
        </span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Occupancy", incident.occupancy],
          ["Responder ETA", `${incident.responders_eta_minutes}m`],
          ["Blocked Exits", incident.blocked_exits.length],
          ["Prior Incidents", incident.prior_incidents],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {incident.signals.map((signal) => (
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/60" key={signal}>
            {signal.replaceAll("_", " ")}
          </span>
        ))}
      </div>
    </section>
  );
}
