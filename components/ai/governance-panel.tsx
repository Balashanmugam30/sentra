"use client";

import type { CouncilGovernance } from "@/lib/ai/types";

type GovernancePanelProps = {
  governance: CouncilGovernance;
  busyAction: string | null;
  onApprove: () => void;
  onReject: () => void;
  onPause: () => void;
};

export function GovernancePanel({ governance, busyAction, onApprove, onReject, onPause }: GovernancePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Human Governance</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Command override panel</h2>
      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current mode</p>
        <p className="mt-2 text-2xl font-black text-white">{governance.mode.replaceAll("_", " ")}</p>
        <p className="mt-1 text-sm text-slate-400">Status: {governance.status}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {governance.available_modes.map((mode) => (
          <span key={mode} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-slate-300">
            {mode.replaceAll("_", " ")}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={Boolean(busyAction)}
          className="rounded-2xl bg-emerald-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyAction === "approve" ? "Approving..." : "Approve Plan"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReject}
            disabled={Boolean(busyAction)}
            className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onPause}
            disabled={Boolean(busyAction)}
            className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Pause Agents
          </button>
        </div>
      </div>
    </section>
  );
}
