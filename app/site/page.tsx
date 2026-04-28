import type { Metadata } from "next";

import { Hero } from "@/components/site/hero";
import { MetricStrip } from "@/components/site/metric-strip";
import { PillarGrid } from "@/components/site/pillar-grid";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteSummary } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra | Autonomous Crisis Intelligence OS",
  description: "Sentra is a global crisis intelligence operating system for AI command, digital twins, operations automation, and resilience.",
  openGraph: {
    title: "Sentra | Autonomous Crisis Intelligence OS",
    description: "AI command, digital twin, operations automation, and enterprise trust in one global resilience platform.",
  },
};

export default function SiteHomePage() {
  return (
    <SiteShell>
      <Hero summary={siteSummary} />
      <MetricStrip metrics={siteSummary.live_metrics} />
      <SiteSection eyebrow="Trust strip" title="Built for institutions that cannot afford confusion." subtitle="Sentra presents as enterprise-ready, government-ready, privacy-first, realtime, and AI-powered from the first glance.">
        <div className="grid gap-3 md:grid-cols-5">
          {siteSummary.trust_strip.map((item) => (
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-center text-sm font-semibold text-white/75" key={item}>{item}</div>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Product overview" title="One operating system from detection to recovery." subtitle="The public story now compresses Sentra's enormous product depth into a clear, memorable buying narrative.">
        <PillarGrid items={siteSummary.product_overview} />
      </SiteSection>
      <SiteSection eyebrow="Outcomes" title="The result is speed, safety, continuity, and proof." subtitle="Sentra is positioned around measurable outcomes, not generic dashboard value.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {siteSummary.outcomes.map((outcome) => (
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={outcome.label}>
              <h3 className="text-xl font-semibold text-white">{outcome.label}</h3>
              <p className="mt-3 text-sm leading-6 text-white/54">{outcome.proof}</p>
            </article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Social proof" title="Seeded pilot narrative with credible buyer language." subtitle="Logos remain placeholders, but the quotes and roles tell a believable enterprise story.">
        <div className="grid gap-4 md:grid-cols-3">
          {siteSummary.social_proof.map((proof) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-6" key={proof.organization}>
              <div className="mb-5 h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/45">{proof.organization}</div>
              <p className="text-lg leading-8 text-white/76">&quot;{proof.quote}&quot;</p>
              <p className="mt-4 text-sm text-cyan-100/60">{proof.persona}</p>
            </article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Next move" title="Request a demo, join the waitlist, invest, or partner." subtitle="The CTA footer turns prestige into pipeline.">
        <div className="grid gap-3 md:grid-cols-4">
          {siteSummary.cta.map((item) => (
            <a className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.055] p-5 text-center font-semibold text-cyan-50 transition hover:bg-cyan-200/10" href="/site/request-demo" key={item}>{item}</a>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}
