import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchReadiness } from "@/lib/launch/types";

export function ReadinessBoard({ readiness }: { readiness: LaunchReadiness }) {
  return (
    <LaunchPanel eyebrow="Launch Readiness Center" title="Single launch score across product, trust, investor, and demo readiness" subtitle={readiness.recommendation}>
      <div className="grid gap-4 lg:grid-cols-2">
        {readiness.dimensions.map((dimension) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={dimension.dimension}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{dimension.dimension}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{dimension.evidence}</p>
              </div>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs font-semibold text-emerald-100">{dimension.status}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-emerald-200" style={{ width: `${dimension.score}%` }} />
            </div>
            <p className="mt-2 font-mono text-sm text-white/60">{dimension.score}/100</p>
          </article>
        ))}
      </div>
    </LaunchPanel>
  );
}
