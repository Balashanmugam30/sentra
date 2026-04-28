"use client";

import type { OpsCommunicationsSnapshot } from "@/lib/ops/types";

type AckDashboardProps = {
  snapshot: OpsCommunicationsSnapshot;
  busyAction: string | null;
  onRespond: (response: string) => void;
};

const responses = ["SAFE", "NEED_HELP", "TRAPPED", "EVACUATED", "ON_ROUTE", "ACKNOWLEDGED"];

export function AckDashboard({ snapshot, busyAction, onRespond }: AckDashboardProps) {
  const counts = snapshot.response_counts;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Ack Dashboard</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Two-way response status</h2>
      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
        <span className="rounded-2xl bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">Safe {counts.safe}</span>
        <span className="rounded-2xl bg-rose-400/10 px-3 py-3 text-sm text-rose-100">Need help {counts.need_help}</span>
        <span className="rounded-2xl bg-rose-400/10 px-3 py-3 text-sm text-rose-100">Trapped {counts.trapped}</span>
        <span className="rounded-2xl bg-cyan-400/10 px-3 py-3 text-sm text-cyan-100">Evacuated {counts.evacuated}</span>
        <span className="rounded-2xl bg-blue-400/10 px-3 py-3 text-sm text-blue-100">On route {counts.on_route}</span>
        <span className="rounded-2xl bg-amber-400/10 px-3 py-3 text-sm text-amber-100">Silent {counts.silent}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {responses.map((response) => (
          <button
            key={response}
            type="button"
            onClick={() => onRespond(response)}
            disabled={busyAction === response}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {response.replaceAll("_", " ")}
          </button>
        ))}
      </div>
    </section>
  );
}
