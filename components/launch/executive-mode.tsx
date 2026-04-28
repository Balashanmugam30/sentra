import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchExecutive } from "@/lib/launch/types";

export function ExecutiveMode({ executive }: { executive: LaunchExecutive }) {
  return (
    <LaunchPanel eyebrow="Executive Mode 2.0" title="One-screen boardroom summary without technical clutter" subtitle={`${executive.export_cta.label} is ${executive.export_cta.status} as ${executive.export_cta.format}.`}>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-cyan-200/15 bg-cyan-200/[0.06] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/55">Board summary</p>
          <div className="mt-5 space-y-3">
            {executive.board_summary.map((summary) => (
              <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/65" key={summary}>{summary}</p>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {executive.top_next_actions.map((action) => (
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={action.action_id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-semibold text-white">{action.title}</p>
                <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{action.urgency}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/55">{action.impact}</p>
            </article>
          ))}
        </div>
      </div>
    </LaunchPanel>
  );
}
