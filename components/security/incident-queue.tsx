"use client";

import { defenseTone, formatDefenseDate } from "@/lib/securitydefense/runtime";
import type { DefenseIncident } from "@/lib/securitydefense/types";

type IncidentQueueProps = {
  incidents: DefenseIncident[];
  busyAction: string | null;
  onRevokeSession: () => void;
  onStepUpAuth: () => void;
  onLockUser: () => void;
};

export function IncidentQueue({ incidents, busyAction, onRevokeSession, onStepUpAuth, onLockUser }: IncidentQueueProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Analyst Queue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Open threat incidents</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={onStepUpAuth} type="button">
            Step-up Auth
          </button>
          <button className="rounded-xl border border-red-200/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/10 disabled:opacity-50" disabled={busyAction !== null} onClick={onRevokeSession} type="button">
            Revoke Session
          </button>
          <button className="rounded-xl border border-amber-200/20 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={onLockUser} type="button">
            Lock User
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {incidents.map((incident) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={incident.incident_id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{incident.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{incident.org} / {incident.category}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 font-mono text-xs ${defenseTone(incident.risk_score)}`}>Risk {incident.risk_score}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{incident.containment_action}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Status" value={incident.status} />
              <Metric label="Detections" value={`${incident.detections}`} />
              <Metric label="MTTD" value={`${incident.mttd_seconds}s`} />
              <Metric label="MTTR" value={`${incident.mttr_minutes}m`} />
            </div>
            <p className="mt-3 font-mono text-xs text-white/40">{formatDefenseDate(incident.created_at)} / {incident.analyst_owner}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 truncate font-mono text-sm text-white">{value}</p>
    </div>
  );
}
