"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function labelTone(label: string) {
  if (label === "dominant") {
    return "border-cyan-200/28 bg-cyan-300/12 text-cyan-50";
  }
  if (label === "strong") {
    return "border-blue-200/24 bg-blue-300/10 text-blue-50";
  }
  if (label === "pressured") {
    return "border-amber-200/28 bg-amber-300/12 text-amber-50";
  }
  return "border-rose-200/28 bg-rose-300/12 text-rose-50";
}

export function SupremacyScorePanel() {
  const { supremacy } = useAutonomousAI();
  const score = supremacy?.score ?? 0;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-cyan-100/14 bg-[linear-gradient(135deg,rgba(5,12,26,0.9),rgba(103,232,249,0.07))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(103,232,249,0.2),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.12),transparent_28%)]" />
      <div className="relative z-10 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
            Decision Supremacy Score
          </p>
          <div className="mt-5 flex items-end gap-4">
            <span className="text-7xl font-semibold tracking-[-0.08em] text-white">{score}</span>
            <span className={`mb-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${labelTone(supremacy?.label ?? "fragile")}`}>
              {supremacy?.label ?? "calibrating"}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/62">
            {supremacy?.summary ?? "Composite decision strength is syncing from readiness, confidence, trust, containment, speed, and system health."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(supremacy?.components ?? {}).map(([key, value]) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={key}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
                  {key.replaceAll("_", " ")}
                </p>
                <span className="text-sm font-semibold text-cyan-50">{value}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
