"use client";

import { useBilling } from "@/lib/billing/use-billing";

export function SeatLicensePanel() {
  const { addSeats, busyAction, usage } = useBilling();
  const percent = usage?.seat_utilization_percent ?? 0;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Seat Licensing
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        {usage?.seats_used ?? 0} of {usage?.seat_limit ?? 0} seats used
      </h2>
      <div className="mt-5 h-3 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-300/75 shadow-[0_0_22px_rgba(103,232,249,0.35)]" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Utilization", `${percent}%`],
          ["API Calls", `${usage?.api_calls_month?.toLocaleString() ?? 0}`],
          ["Reports", `${usage?.reports_generated ?? 0}`],
        ].map(([label, value]) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <button
        className="mt-5 rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
        disabled={busyAction === "add-seats"}
        onClick={() => void addSeats(5)}
        type="button"
      >
        {busyAction === "add-seats" ? "Adding..." : "Add 5 Seats"}
      </button>
    </section>
  );
}
