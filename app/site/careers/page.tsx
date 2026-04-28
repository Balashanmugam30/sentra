import type { Metadata } from "next";

import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteCareers } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Careers | Build Crisis Intelligence",
  description: "Join Sentra to build frontier AI, digital twins, and enterprise safety infrastructure.",
};

export default function SiteCareersPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Careers" title="Build the operating system for moments that matter." subtitle={siteCareers.mission}>
        <div className="grid gap-4 md:grid-cols-3">
          {siteCareers.why_join.map((reason) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-lg font-semibold text-white" key={reason}>{reason}</article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Open roles" title="Seeded founding team needs.">
        <div className="grid gap-4 md:grid-cols-2">
          {siteCareers.roles.map((role) => (
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={role.role}>
              <h3 className="text-xl font-semibold text-white">{role.role}</h3>
              <p className="mt-2 text-sm text-cyan-100/60">{role.location}</p>
              <p className="mt-4 text-sm leading-6 text-white/55">{role.focus}</p>
            </article>
          ))}
        </div>
      </SiteSection>
      <SiteSection eyebrow="Culture" title="The behaviors that make Sentra feel inevitable.">
        <div className="flex flex-wrap gap-3">
          {siteCareers.culture.map((item) => (
            <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-sm text-emerald-100" key={item}>{item}</span>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}
