"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export function TrustVerifiedAppsPanel() {
  const { apps } = useMarketplace();
  const verified = apps?.apps?.filter((app) => app.security_verified && app.enterprise_ready).slice(0, 8) ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Trust Verified Apps</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Security-reviewed enterprise connectors</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {verified.map((app, index) => (
          <article className="rounded-[20px] border border-cyan-100/10 bg-cyan-100/[0.035] p-4" key={`${app.app_id}-verified-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white">{app.name}</span>
              <span className="rounded-full bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">verified</span>
            </div>
            <p className="mt-2 text-xs text-white/48">{app.tags.join(" / ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

