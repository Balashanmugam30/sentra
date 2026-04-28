"use client";

import type { OpsCommunicationsSnapshot, OpsCommsChannelId } from "@/lib/ops/types";

type AlertComposerProps = {
  snapshot: OpsCommunicationsSnapshot;
  busyAction: string | null;
  onSend: (templateId: string, audienceId: string, channels: OpsCommsChannelId[]) => void;
};

export function AlertComposer({ snapshot, busyAction, onSend }: AlertComposerProps) {
  const template = snapshot.templates.find((item) => item.template_id === snapshot.composer.default_template_id) ?? snapshot.templates[0];
  const audience = snapshot.audiences.find((item) => item.audience_id === snapshot.composer.default_audience_id) ?? snapshot.audiences[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Alert Composer</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Mass notification launch</h2>
      {template && audience ? (
        <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">{template.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cyan-50/80">{template.body}</p>
            </div>
            <span className="rounded-full border border-rose-300/25 bg-rose-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-100">
              {template.severity}
            </span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            <span className="rounded-2xl bg-black/20 px-3 py-2 text-sm text-slate-200">Audience {audience.label}</span>
            <span className="rounded-2xl bg-black/20 px-3 py-2 text-sm text-slate-200">Reach {audience.count}</span>
          </div>
          <button
            type="button"
            onClick={() => onSend(template.template_id, audience.audience_id, template.recommended_channels)}
            disabled={busyAction === template.template_id}
            className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
          >
            {busyAction === template.template_id ? "Broadcasting..." : "Send Verified Broadcast"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
