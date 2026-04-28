import type { Metadata } from "next";

import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteInvestors } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Investor Interest Portal",
  description: "Sentra market size, ARR scenarios, moat engine, capital ask, and board metrics.",
};

export default function SiteInvestorsPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Investor Interest Portal" title="The company story behind the product." subtitle={siteInvestors.market_size}>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(siteInvestors.board_metrics).map(([label, value]) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5" key={label}>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
              <p className="mt-3 font-mono text-3xl text-cyan-100">{value}</p>
            </article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="ARR scenarios" title="A credible expansion curve, not a vague dream." subtitle={siteInvestors.capital_ask}>
        <div className="grid gap-4 md:grid-cols-3">
          {siteInvestors.arr_scenarios.map((scenario) => (
            <article className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.055] p-6" key={scenario.scenario}>
              <p className="text-sm font-semibold text-white">{scenario.scenario}</p>
              <p className="mt-4 font-mono text-4xl text-cyan-100">{scenario.year_3_arr}</p>
              <p className="mt-4 text-sm leading-6 text-white/55">{scenario.assumption}</p>
            </article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Moat engine" title="Why Sentra becomes harder to replace over time.">
        <div className="grid gap-4 md:grid-cols-2">
          <ListCard title="Moat" items={siteInvestors.moat_engine} />
          <ListCard title="Roadmap" items={siteInvestors.roadmap} />
        </div>
      </SiteSection>
    </SiteShell>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60" key={item}>{item}</p>
        ))}
      </div>
    </article>
  );
}
