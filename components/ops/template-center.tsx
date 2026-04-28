"use client";

import type { OpsCommsAudience, OpsCommsChannelId, OpsCommsTemplate } from "@/lib/ops/types";

type TemplateCenterProps = {
  templates: OpsCommsTemplate[];
  defaultAudience: OpsCommsAudience | undefined;
  busyAction: string | null;
  onSend: (templateId: string, audienceId: string, channels: OpsCommsChannelId[]) => void;
};

export function TemplateCenter({ templates, defaultAudience, busyAction, onSend }: TemplateCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Message Templates</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Smart crisis messaging</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <article key={template.template_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{template.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{template.body}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-200">
                {template.severity}
              </span>
            </div>
            {defaultAudience ? (
              <button
                type="button"
                onClick={() => onSend(template.template_id, defaultAudience.audience_id, template.recommended_channels)}
                disabled={busyAction === template.template_id}
                className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
              >
                Send Template
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
