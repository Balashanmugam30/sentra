import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionDemoScriptState } from "@/lib/submission/types";

export function DemoScriptBoard({ demoScripts }: { demoScripts: SubmissionDemoScriptState }) {
  return (
    <SubmissionPanel eyebrow="Demo Script Engine" title="Exact talking points, screen order, wow moments, and break-glass recovery" subtitle={demoScripts.recovery_line}>
      <div className="space-y-4">
        {demoScripts.scripts.map((script) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={script.script_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{script.mode}</h3>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{script.timing}</span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <List title="Talking points" items={script.talking_points} />
              <List title="Screen sequence" items={script.screen_sequence} />
              <List title="Wow moments" items={script.wow_moments} />
              <List title="Likely objections" items={script.objections} />
            </div>
            <p className="mt-4 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-4 text-sm leading-6 text-amber-100/70">{script.break_glass}</p>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/45">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p className="text-sm text-white/58" key={`${title}-${item}`}>{item}</p>
        ))}
      </div>
    </div>
  );
}
