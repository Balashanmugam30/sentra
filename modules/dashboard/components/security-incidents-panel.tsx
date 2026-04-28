"use client";

import type { UseSocResult } from "@/lib/soc/use-soc";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type SecurityIncidentsPanelProps = {
  soc: UseSocResult;
};

export function SecurityIncidentsPanel({ soc }: SecurityIncidentsPanelProps) {
  const { busyAction, error, incidents, loading, resolveIncident } = soc;
  const rows = incidents?.incidents ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Security Incident Queue
          </p>
          <h2 className="text-lg font-semibold text-white">
            Open SOC incidents created from detections, abuse patterns, and observability failures
          </h2>
        </div>

        <div className="space-y-3">
          {rows.map((incident, index) => (
            <div
              className="rounded-[22px] border border-white/10 bg-white/5 p-4"
              key={`${incident.incident_id}-${incident.created_at}-${index}`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-medium text-white">
                    [{formatTime(incident.created_at)}] {incident.incident_id} {incident.title}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {incident.severity} | {incident.source_rule}
                    {incident.affected_user ? ` | ${incident.affected_user}` : ""}
                    {incident.affected_module ? ` | ${incident.affected_module}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/70">
                    {incident.status}
                  </div>
                  {incident.status !== "resolved" ? (
                    <button
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100 disabled:opacity-50"
                      disabled={busyAction !== null}
                      onClick={() => {
                        void resolveIncident(incident.incident_id);
                      }}
                      type="button"
                    >
                      {busyAction === `resolve-${incident.incident_id}` ? "Resolving" : "Resolve"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {!rows.length ? (
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              {loading
                ? "Syncing SOC incident queue"
                : error
                ? "Incident queue is reconnecting to the last verified SOC snapshot."
                : "No open SOC incidents in the current command window."}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
