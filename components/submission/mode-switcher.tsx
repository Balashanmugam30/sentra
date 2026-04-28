import { SubmissionPanel } from "@/components/submission/submission-panel";
import type { SubmissionMode } from "@/lib/submission/types";

export function ModeSwitcher({ modes, selectedMode }: { modes: SubmissionMode[]; selectedMode: string }) {
  return (
    <SubmissionPanel eyebrow="Competition Mode Switcher" title="Tune the story for the room" subtitle="The selected mode changes which proof points matter most: social impact, ARR, compliance, procurement, or technical depth.">
      <div className="grid gap-4 lg:grid-cols-3">
        {modes.map((mode) => (
          <article className={`rounded-3xl border p-5 ${mode.mode_id === selectedMode ? "border-cyan-200/35 bg-cyan-200/[0.08]" : "border-white/10 bg-black/25"}`} key={mode.mode_id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{mode.name}</h3>
              {mode.mode_id === selectedMode && <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">selected</span>}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{mode.priority}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(mode.score_weight).slice(0, 4).map(([key, value]) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60" key={`${mode.mode_id}-${key}`}>{key}: {value}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SubmissionPanel>
  );
}
