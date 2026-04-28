"use client";

import { getEscalationTone } from "@/lib/ops/escalation";
import type { OpsGovernanceEscalation } from "@/lib/ops/types";

type EscalationBoardProps = {
  escalations: OpsGovernanceEscalation[];
  busyAction: string | null;
  onEscalate: (approvalId: string) => void;
};

export function EscalationBoard({ escalations, busyAction, onEscalate }: EscalationBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-100/70">Escalated Decisions</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">SLA pressure routing</h2>
      <div className="mt-5 grid gap-3">
        {escalations.map((escalation) => (
          <article key={escalation.escalation_id} className={`rounded-3xl border p-4 ${getEscalationTone(escalation)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{escalation.title}</h3>
                <p className="mt-2 text-sm opacity-80">{escalation.reason} - next owner {escalation.next_owner}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-bold">L{escalation.level}</span>
            </div>
            <button
              type="button"
              onClick={() => onEscalate(escalation.approval_id)}
              disabled={busyAction === escalation.approval_id}
              className="mt-4 rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              Trigger Escalation
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
