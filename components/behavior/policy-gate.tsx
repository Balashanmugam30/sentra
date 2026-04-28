import type { CouncilSnapshot } from "@/lib/behavior/learning";

type PolicyGateProps = {
  council: CouncilSnapshot;
  busy?: boolean;
  onApprove?: () => void;
};

export function PolicyGate({ council, busy = false, onApprove }: PolicyGateProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Human approval gate</p>
      <div className="mt-5 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5">
        <p className="text-xl font-black text-white">{council.human_approval_gate.required ? "Approval required" : "Autonomous scope clear"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{council.human_approval_gate.pending_action}</p>
        <p className="mt-2 text-sm text-cyan-100">Safe scope: {council.human_approval_gate.safe_autonomous_scope}</p>
        {onApprove ? (
          <button type="button" onClick={onApprove} disabled={busy} className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
            {busy ? "Approving..." : "Approve learned policy"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
