"use client";

import type { MarketplaceCategoriesResponse, MarketplaceSummary } from "@/lib/marketplace/types";

export function InstallCenter({ categories, summary }: { categories: MarketplaceCategoriesResponse; summary: MarketplaceSummary }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Install Center</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Categories and install signals</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {categories.categories.map((category) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={category.key}>
            <p className="font-semibold text-white">{category.label}</p>
            <p className="mt-2 text-xs text-white/45">Enterprise vetted connectors for {category.key.replaceAll("_", " ")}.</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
        <p className="text-sm font-semibold text-emerald-100">{summary.certified_count} certified apps ready</p>
        <p className="mt-2 text-xs leading-5 text-white/55">Recommended apps are ranked by security verification, tenant adoption, and add-on expansion signal.</p>
      </div>
    </section>
  );
}

