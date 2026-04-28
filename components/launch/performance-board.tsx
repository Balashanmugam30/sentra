import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchPerformance } from "@/lib/launch/types";

export function PerformanceBoard({ performance }: { performance: LaunchPerformance }) {
  return (
    <LaunchPanel eyebrow="Performance Domination" title="Route speed, cache posture, hydration, websockets, and optimization targets">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {performance.routes.map((route) => (
            <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={route.route}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-sm text-white">{route.route}</p>
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{route.status}</span>
              </div>
              <p className="mt-2 text-sm text-white/55">{route.p95_ms}ms p95 | {route.chunk_kb}KB chunk | {route.cache}</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          {performance.slow_components.map((component) => (
            <article className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-4" key={component.name}>
              <p className="font-semibold text-amber-50">{component.name} | {component.cost_ms}ms</p>
              <p className="mt-2 text-sm leading-6 text-amber-100/65">{component.fix}</p>
            </article>
          ))}
          <div className="rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.06] p-4">
            <p className="font-semibold text-emerald-50">Cache hit ratio {performance.cache.hit_ratio}%</p>
            <p className="mt-2 text-sm text-emerald-100/65">{performance.cache.dedupe_saves_today.toLocaleString()} duplicate requests prevented today</p>
          </div>
        </div>
      </div>
    </LaunchPanel>
  );
}
