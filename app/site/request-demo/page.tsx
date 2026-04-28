import type { Metadata } from "next";

import { RequestDemoForm } from "@/components/site/request-demo-form";
import { SiteSection } from "@/components/site/site-section";
import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Request a Sentra Demo",
  description: "Request an enterprise, government, investor, partner, or media demo for Sentra.",
};

export default function SiteRequestDemoPage() {
  return (
    <SiteShell>
      <SiteSection eyebrow="Waitlist + Demo Request Engine" title="Turn prestige into pipeline." subtitle="Capture enterprise, government, investor, partner, and media interest with lead scoring and source attribution.">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Lead scoring</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">High-urgency buyers get routed first.</h2>
            <p className="mt-4 text-sm leading-6 text-white/54">Government, hospital, smart city, investor, and enterprise inquiries receive stronger deterministic scores so demos feel prioritized and operationally mature.</p>
            <div className="mt-6 grid gap-3">
              {["Enterprise inquiry", "Government inquiry", "Investor inquiry", "Partner inquiry", "Media inquiry"].map((item) => (
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/68" key={item}>{item}</div>
              ))}
            </div>
          </div>
          <RequestDemoForm />
        </div>
      </SiteSection>
    </SiteShell>
  );
}
