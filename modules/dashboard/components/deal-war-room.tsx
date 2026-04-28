"use client";

import { useMemo } from "react";

import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function DealWarRoom() {
  const { deals } = useCrm();
  const executiveDeals = useMemo(
    () =>
      (deals?.deals ?? [])
        .filter((deal) => deal.stage !== "closed_lost")
        .slice()
        .sort((left, right) => right.value - left.value)
        .slice(0, 5),
    [deals?.deals],
  );

  return (
    <section className="rounded-[30px] border border-amber-100/12 bg-[linear-gradient(135deg,rgba(5,10,20,0.78),rgba(245,158,11,0.07))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">
        Deal War Room
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Largest deals requiring executive leverage
      </h2>
      <div className="mt-5 grid gap-3">
        {executiveDeals.map((deal, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${deal.id}-${deal.updated_at}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{deal.company_name}</h3>
                <p className="mt-1 text-xs text-white/45">
                  {deal.stage} · {deal.owner} · {deal.risk} risk
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xl font-semibold text-white">{money.format(deal.value)}</p>
                <p className="text-xs text-cyan-50/58">{deal.probability}% probability</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {[
                "Executive sponsor needed",
                deal.competitors[0] ? `Displace ${deal.competitors[0]}` : "Competitive map clean",
                deal.timeline[deal.timeline.length - 1] ?? "Next step pending",
              ].map((item, itemIndex) => (
                <p className="rounded-[16px] border border-white/10 bg-black/18 p-3 text-xs leading-5 text-white/54" key={`${deal.id}-war-${itemIndex}`}>
                  {item}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
