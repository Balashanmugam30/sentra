import type { Metadata } from "next";

import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteStory } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Story | From Fragmented Crisis to Global Command",
  description: "The cinematic Sentra narrative: fragmented systems, rising crises, AI command, and global resilience.",
};

export default function SiteStoryPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Cinematic Story Mode" title="From fragmented crisis to global command." subtitle="A scroll narrative designed for demos, media, judges, and investors.">
        <div className="relative space-y-5">
          {siteStory.chapters.map((chapter) => (
            <article className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20" key={chapter.step}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 font-mono text-xl text-cyan-100">{chapter.step}</span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">{chapter.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/55">{chapter.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}
