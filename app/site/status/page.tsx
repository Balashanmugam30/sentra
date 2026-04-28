import type { Metadata } from "next";

import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { StatusBoard } from "@/components/site/status-board";
import { siteStatus } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Status | Public Trust Page",
  description: "Sentra uptime, platform health, security readiness, privacy commitments, and public trust posture.",
};

export default function SiteStatusPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Live Status + Trust Page" title="Public trust should be visible before procurement asks." subtitle="Uptime, resolved incidents, compliance posture, privacy commitments, platform health, and security readiness.">
        <StatusBoard status={siteStatus} />
      </SiteSection>
      <SiteSection eyebrow="Privacy commitments" title="Clear promises for buyers and institutions.">
        <div className="grid gap-3 md:grid-cols-5">
          {siteStatus.privacy_commitments.map((item) => (
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-center text-sm text-white/66" key={item}>{item}</div>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}
