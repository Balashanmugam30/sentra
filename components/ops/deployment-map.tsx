"use client";

import { getResourceTone } from "@/lib/ops/resources";
import type { OpsMissionAssignment, OpsResourceIncident } from "@/lib/ops/types";

type DeploymentMapProps = {
  incidents: OpsResourceIncident[];
  assignments: OpsMissionAssignment[];
  busyAction: string | null;
  onDispatch: (incidentId: string, unitId?: string) => void;
};

export function DeploymentMap({ incidents, assignments, busyAction, onDispatch }: DeploymentMapProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Responder Deployment Map</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Live incident to unit routing</h2>
      <div className="mt-5 grid gap-3">
        {incidents.map((incident) => {
          const assignment = assignments.find((item) => item.incident_id === incident.incident_id);
          return (
            <article key={incident.incident_id} className={`rounded-3xl border p-4 ${getResourceTone(incident.severity)}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                  <p className="mt-1 text-sm opacity-80">{incident.building} - {incident.zone}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                  {incident.severity}
                </span>
              </div>
              {assignment ? (
                <p className="mt-3 text-sm opacity-85">
                  {assignment.unit} ETA {assignment.eta_minutes}m. Confidence {assignment.confidence}%. {assignment.rationale}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => onDispatch(incident.incident_id, assignment?.unit_id)}
                disabled={busyAction === incident.incident_id}
                className="mt-4 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
              >
                {busyAction === incident.incident_id ? "Dispatching..." : "Dispatch Best Unit"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
