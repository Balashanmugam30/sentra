type OverrideCenterProps = {
  status: string;
  mode: string;
  busyAction?: string | null;
  onApprove: () => void;
  onOverride: () => void;
};

export function OverrideCenter({ status, mode, busyAction, onApprove, onOverride }: OverrideCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Human override</p>
      <h2 className="mt-2 text-2xl font-black text-white">Governance gate</h2>
      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode</p>
        <p className="mt-2 text-2xl font-black text-white">{mode.replaceAll("_", " ")}</p>
        <p className="mt-1 text-sm text-slate-400">Status: {status.replaceAll("_", " ")}</p>
      </div>
      <div className="mt-5 grid gap-3">
        <button type="button" onClick={onApprove} disabled={Boolean(busyAction)} className="rounded-2xl bg-emerald-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60">
          {busyAction === "approve" ? "Approving..." : "Approve recommendation"}
        </button>
        <button type="button" onClick={onOverride} disabled={Boolean(busyAction)} className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-400/20 disabled:opacity-60">
          Manual override
        </button>
      </div>
    </section>
  );
}

