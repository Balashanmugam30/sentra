"use client";

import { useGrowth } from "@/lib/growth/use-growth";

export function ExpansionAiCopilot() {
  const { recommendations } = useGrowth();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Expansion AI Copilot</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Where to launch, price, hire, and partner next</h2>
      <div className="mt-5 grid gap-3">
        {recommendations.map((item, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${item.recommendation_id}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/56">{item.reason}</p>
                <p className="mt-2 text-xs text-cyan-50/60">{item.impact}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">{item.confidence}%</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

