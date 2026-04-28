import type { Metadata } from "next";

import { AuthorityMeters } from "@/components/site/authority-meters";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteAuthority } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Authority | Category Leadership",
  description: "Market leadership, innovation, ROI, product depth, and trust readiness for Sentra.",
};

export default function SiteAuthorityPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Brand Authority Engine" title="Prestige meters for category leadership." subtitle="Sentra is framed as an emerging category creator with benchmark wins against fragmented legacy tools.">
        <AuthorityMeters authority={siteAuthority} />
      </SiteSection>
      <SiteSection eyebrow="Benchmark wins" title="Why Sentra feels inevitable." subtitle="The comparison is intentionally simple: legacy systems alert, Sentra coordinates.">
        <div className="grid gap-4 md:grid-cols-2">
          {siteAuthority.benchmark_wins.map((benchmark) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5" key={benchmark.benchmark}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{benchmark.benchmark}</h3>
                <span className="font-mono text-cyan-100">{benchmark.sentra}</span>
              </div>
              <div className="mt-5 grid gap-3">
                <Bar label="Sentra" value={benchmark.sentra} tone="cyan" />
                <Bar label="Legacy" value={benchmark.legacy} tone="slate" />
              </div>
            </article>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "cyan" | "slate" }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/45">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone === "cyan" ? "bg-cyan-200" : "bg-white/35"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
