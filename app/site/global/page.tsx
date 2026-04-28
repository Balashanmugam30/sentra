import type { Metadata } from "next";

import { GlobalMap } from "@/components/site/global-map";
import { MetricStrip } from "@/components/site/metric-strip";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";
import { siteGlobal } from "@/lib/site/runtime";

export const metadata: Metadata = {
  title: "Sentra Global Showcase | Expansion Wall",
  description: "Sentra global presence, modeled cities, sectors, facilities, population impact, and active pilots.",
};

export default function SiteGlobalPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Global Showcase Wall" title="A global resilience company already in motion." subtitle="Seeded presence turns the story from local product into worldwide command platform.">
        <MetricStrip
          metrics={[
            { label: "Countries supported", value: siteGlobal.countries_supported, unit: "" },
            { label: "Cities modeled", value: siteGlobal.cities_modeled, unit: "" },
            { label: "Facilities protected", value: siteGlobal.facilities_protected, unit: "" },
            { label: "Population impact", value: siteGlobal.population_impact, unit: "" },
            { label: "Active pilots", value: siteGlobal.active_pilots, unit: "" },
          ]}
        />
        <div className="mt-8">
          <GlobalMap global={siteGlobal} />
        </div>
      </SiteSection>
      <SiteSection eyebrow="Sectors" title="Built across the places where people gather." subtitle="Hotels, hospitals, campuses, malls, smart cities, and industrial parks become one expansion narrative.">
        <div className="flex flex-wrap gap-3">
          {siteGlobal.sectors_served.map((sector) => (
            <span className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm text-white/70" key={sector}>{sector}</span>
          ))}
        </div>
      </SiteSection>
    </SiteShell>
  );
}
