"use client";

import { getRecoveryTone } from "@/lib/ops/recovery";
import type { OpsReopenGate } from "@/lib/ops/types";

type ReopenChecklistProps = {
  gates: OpsReopenGate[];
  busyAction: string | null;
  onApprove: (gateId: string) => void;
};

export function ReopenChecklist({ gates, busyAction, onApprove }: ReopenChecklistProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Reopen Checklist</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Governance gates</h2>
      <div className="mt-5 grid gap-3">
        {gates.map((gate) => (
          <article key={gate.gate_id} className={`rounded-3xl border p-4 ${getRecoveryTone(gate.status)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{gate.title}</h3>
                <p className="mt-2 text-sm opacity-80">{gate.required_for}. {gate.evidence}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em]">{gate.status}</span>
            </div>
            <button
              type="button"
              onClick={() => onApprove(gate.gate_id)}
              disabled={busyAction === gate.gate_id}
              className="mt-4 rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
            >
              Approve Gate
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
