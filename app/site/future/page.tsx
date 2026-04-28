import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { ViralCard } from "@/components/site/viral-card";

export const metadata: Metadata = {
  title: "Sentra Future | Global Resilience OS",
  description: "The Sentra future: every facility, city, and institution with autonomous resilience command.",
};

export default function SiteFuturePage() {
  return (
    <SiteShell>
      <ViralCard title="The future is human-aware autonomous resilience." metric="14" body="From India to the UAE, Singapore, the UK, and the US, Sentra is positioned as the global command layer for critical places." cta="Join the future" />
    </SiteShell>
  );
}
