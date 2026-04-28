import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { ViralCard } from "@/components/site/viral-card";

export const metadata: Metadata = {
  title: "Sentra Wow | Crisis Intelligence Demo",
  description: "A shareable one-screen Sentra prestige showcase.",
};

export default function SiteWowPage() {
  return (
    <SiteShell>
      <ViralCard title="One AI command OS from incident to recovery." metric="99" body="Sentra combines AI council, digital twin, behavior intelligence, operations execution, and executive proof into one unforgettable demo." cta="See the flagship" />
    </SiteShell>
  );
}
