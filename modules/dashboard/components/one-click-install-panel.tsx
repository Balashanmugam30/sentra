"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export function OneClickInstallPanel() {
  const { busyAction, install, recommendations } = useMarketplace();
  const recs = recommendations?.recommendations ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">AI Install Recommendations</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Suggested integrations based on tenant signals</h2>
      <div className="mt-5 grid gap-3">
        {recs.map((rec, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${rec.recommendation_id}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">{rec.title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/56">{rec.reason}</p>
                <p className="mt-2 text-xs text-cyan-50/60">{rec.estimated_impact}</p>
              </div>
              <button
                className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
                disabled={busyAction === `install-${rec.app_id}`}
                onClick={() => void install(rec.app_id)}
                type="button"
              >
                {busyAction === `install-${rec.app_id}` ? "Installing..." : rec.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

