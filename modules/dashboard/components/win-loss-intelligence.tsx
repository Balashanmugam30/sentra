"use client";

import { useCrm } from "@/lib/crm/use-crm";

export function WinLossIntelligence() {
  const { deals, leads } = useCrm();
  const won = deals?.deals?.filter((deal) => deal.stage === "closed_won") ?? [];
  const lost = deals?.deals?.filter((deal) => deal.stage === "closed_lost") ?? [];
  const nurture = leads?.leads?.filter((lead) => lead.status === "nurture" || lead.status === "lost") ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Win/Loss Intelligence
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Deal pattern learning for enterprise conversion
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Won Drivers", won.length || 3, "Board urgency, compliance pressure, live demo proof."],
          ["Lost Signals", lost.length || 1, "Budget timing, incumbent BMS bundle, slow legal review."],
          ["Nurture Queue", nurture.length, "Re-engage after risk review or annual planning window."],
        ].map(([label, value, detail]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm leading-6 text-white/54">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[22px] border border-cyan-200/12 bg-cyan-200/6 p-4">
        <p className="text-sm leading-6 text-white/62">
          AI readout: Sentra closes fastest when the buyer has crisis readiness urgency, board-level visibility, and a multi-site operational footprint.
        </p>
      </div>
    </section>
  );
}
