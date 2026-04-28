import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { ViralCard } from "@/components/site/viral-card";

export const metadata: Metadata = {
  title: "Sentra Impact | Public Safety Outcomes",
  description: "Sentra public safety, continuity, and resilience impact.",
};

export default function SiteImpactPage() {
  return (
    <SiteShell>
      <ViralCard title="Protect people, reduce losses, restore faster." metric="240K" body="Sentra's seeded impact model spans campuses, hospitals, hotels, malls, and smart city districts with measurable response and recovery improvement." cta="Explore impact" />
    </SiteShell>
  );
}
