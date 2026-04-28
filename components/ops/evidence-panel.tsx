import type { OpsEvidenceRecord, OpsResolutionEvent } from "@/lib/ops/types";

type EvidencePanelProps = {
  evidence: OpsEvidenceRecord[];
  ledger: OpsResolutionEvent[];
};

export function EvidencePanel({ evidence, ledger }: EvidencePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Evidence Panel</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Audit-ready decision trail</h2>
      <div className="mt-5 grid gap-3">
        {evidence.map((record) => (
          <article key={record.evidence_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{record.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{record.source} - {record.hash}</p>
              </div>
              <span className="font-bold text-emerald-100">{record.completeness}%</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {ledger.slice(-4).map((event) => (
          <article key={`${event.timestamp}-${event.event}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-white">{event.event}</p>
              <span className="text-xs text-slate-500">{event.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{event.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
