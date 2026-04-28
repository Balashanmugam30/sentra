"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

const nodePositions = [
  ["Zone 1", "18%", "28%"],
  ["Zone 2", "42%", "18%"],
  ["Zone 3", "66%", "35%"],
  ["Zone 4", "34%", "64%"],
  ["Zone 5", "72%", "70%"],
] as const;

export function DigitalTwinCommandCore() {
  const { behavior, cascade, swarm, supremacy } = useAutonomousAI();
  const risk = cascade?.cascade_risk_score ?? 0;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-cyan-100/14 bg-[radial-gradient(circle_at_50%_30%,rgba(103,232,249,0.12),rgba(5,10,20,0.92)_46%,rgba(0,0,0,0.72))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
            Hyperreal Digital Twin Command Core
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            Live twin with swarm routes, hazard pulse, and crowd pressure
          </h2>
        </div>
        <div className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Supremacy {supremacy?.score ?? 0}%
        </div>
      </div>

      <div className="relative mt-6 h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,16,32,0.86),rgba(255,255,255,0.045))]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(103,232,249,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="absolute left-[38%] top-[18%] h-40 w-40 animate-pulse rounded-full border border-orange-200/22 bg-orange-400/10 blur-[1px]" style={{ transform: `scale(${1 + risk / 180})` }} />
        <svg className="absolute inset-0 h-full w-full" role="img" aria-label="Animated command routes">
          <path d="M 120 250 C 220 120, 360 120, 510 210" fill="none" stroke="rgba(103,232,249,0.5)" strokeDasharray="8 10" strokeWidth="2" />
          <path d="M 180 90 C 260 180, 310 230, 480 290" fill="none" stroke="rgba(245,158,11,0.55)" strokeDasharray="7 12" strokeWidth="2" />
          <path d="M 520 80 C 450 150, 420 220, 290 285" fill="none" stroke="rgba(251,113,133,0.45)" strokeDasharray="6 12" strokeWidth="2" />
        </svg>
        {nodePositions.map(([label, left, top], index) => (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/28 bg-cyan-300/12 px-3 py-2 text-xs font-semibold text-cyan-50 shadow-[0_0_30px_rgba(103,232,249,0.22)]"
            key={label}
            style={{ left, top }}
          >
            <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-200" />
            {label}
            {index === 1 ? <span className="ml-2 text-orange-100">hazard</span> : null}
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white/72">
            Swarm efficiency <span className="font-semibold text-cyan-50">{swarm?.global_efficiency ?? 0}%</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white/72">
            Cascade risk <span className="font-semibold text-orange-50">{risk}%</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-sm text-white/72">
            Behavior <span className="font-semibold text-amber-50">{behavior?.behavior_state ?? "syncing"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
