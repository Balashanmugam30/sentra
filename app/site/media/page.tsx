import type { Metadata } from "next";

import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteMedia } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Media Kit",
  description: "Sentra logos, brand colors, founder bio, company story, fact sheet, and press snippets.",
};

export default function SiteMediaPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Media Kit Engine" title="A press-ready brand kit for a category-defining company." subtitle={siteMedia.company_story}>
        <div className="grid gap-4 lg:grid-cols-3">
          {siteMedia.logos.map((logo) => (
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-8 text-center" key={logo}>
              <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-cyan-200/20 bg-cyan-200/10 text-3xl font-black text-cyan-100">S</div>
              <p className="mt-4 text-sm font-semibold text-white">{logo}</p>
            </div>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Brand system" title="Colors, story, facts, and press snippets." subtitle={siteMedia.founder_bio}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Brand colors" items={siteMedia.brand_colors} />
          <Panel title="Fact sheet" items={siteMedia.fact_sheet} />
          <Panel title="Press snippets" items={siteMedia.press_snippets} />
        </div>
      </SiteSection>
    </SiteShell>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
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
