"use client";

import type { MarketplaceAutomationsState } from "@/lib/marketplace/types";

export function AutomationGallery({ automations }: { automations: MarketplaceAutomationsState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Automation Templates</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Ready-to-launch event workflows</h3>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {automations.templates.map((template) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={template.template_id}>
            <p className="font-semibold text-white">{template.name}</p>
            <p className="mt-1 font-mono text-xs text-cyan-100/70">{template.trigger}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.actions.map((action) => (
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/55" key={action}>{action}</span>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/45">{template.installs} installs / {template.success_rate}% success</p>
          </article>
        ))}
      </div>
    </section>
  );
}

