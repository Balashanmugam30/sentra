"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function AppStoreGrid() {
  const { apps, busyAction, install } = useMarketplace();
  const catalog = apps?.apps?.slice(0, 12) ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">App Store Grid</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Verified integrations ready for one-click install</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {catalog.map((app, index) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={`${app.app_id}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{app.name}</h3>
                <p className="mt-1 text-xs text-white/45">{app.vendor} - {app.category.replaceAll("_", " ")}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
                {app.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{app.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-cyan-50">{money.format(app.monthly_price)}/mo</span>
              <button
                className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
                disabled={busyAction === `install-${app.app_id}`}
                onClick={() => void install(app.app_id)}
                type="button"
              >
                {busyAction === `install-${app.app_id}` ? "Installing..." : "Install"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

