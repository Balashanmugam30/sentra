"use client";

import { useState } from "react";

import type { MarketplaceApp } from "@/lib/marketplace/types";
import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export function MarketplaceSearchPanel() {
  const { apps, search } = useMarketplace();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketplaceApp[] | null>(null);
  const visibleApps = results ?? apps?.apps?.slice(0, 8) ?? [];

  async function runSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults(null);
      return;
    }
    const response = await search(value);
    setResults(response.apps);
  }

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Marketplace Search</p>
      <input
        aria-label="Search marketplace apps"
        className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-200/40"
        onChange={(event) => void runSearch(event.target.value)}
        placeholder="Search Slack, Okta, cameras, ITSM, maps..."
        value={query}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {visibleApps.map((app, index) => (
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/70" key={`${app.app_id}-${index}`}>
            {app.name}
          </span>
        ))}
      </div>
    </section>
  );
}

