import { canCloseIncident } from "@/lib/ops/governance";
import type { OpsExecutionSnapshot } from "@/lib/ops/types";

type ResolutionLedgerProps = {
  snapshot: OpsExecutionSnapshot;
  busyAction: string | null;
  onCloseIncident: (incidentId: string) => void;
};

export function ResolutionLedger({ snapshot, busyAction, onCloseIncident }: ResolutionLedgerProps) {
  const incident = snapshot.active_incidents[0];
  const gates = snapshot.close_result?.gates;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Final Resolution Ledger</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Verified closure gates</h2>
        </div>
        {incident ? (
          <button
            type="button"
            onClick={() => onCloseIncident(incident.incident_id)}
            disabled={busyAction === incident.incident_id}
            className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-60"
          >
            {busyAction === incident.incident_id ? "Checking..." : "Close Incident"}
          </button>
        ) : null}
      </div>
      {gates ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(gates).map(([gate, passed]) => (
            <span key={gate} className={`rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.16em] ${passed ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-amber-300/25 bg-amber-400/10 text-amber-100"}`}>
              {gate.replaceAll("_", " ")} {passed ? "ok" : "waiting"}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
          Closure requires hazards cleared, tasks complete, human approval, audit trail, and confidence acceptable.
        </p>
      )}
      <p className="mt-3 text-xs text-slate-500">Closure eligible: {canCloseIncident(gates) ? "yes" : "not yet"}</p>
      <div className="mt-5 grid gap-3">
        {snapshot.resolution_ledger.map((event) => (
          <article key={`${event.timestamp}-${event.event}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{event.event}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{event.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
