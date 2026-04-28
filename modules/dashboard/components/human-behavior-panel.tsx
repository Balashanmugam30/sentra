"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function formatMetric(value: string) {
  return value.replaceAll("_", " ");
}

export function HumanBehaviorPanel() {
  const { behavior } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(6,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Human Behavior Prediction Engine
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Predicting panic, compliance, hesitation, fatigue, and rumor velocity
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/58">
        {behavior?.summary ?? "Behavior model is syncing from OSINT, public safety, trust, and current urgency."}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(behavior?.metrics ?? []).map((metric) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={metric.metric}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold capitalize text-white">{formatMetric(metric.metric)}</p>
              <span className="text-sm font-semibold text-cyan-50">{metric.score}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${metric.score}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/46">{metric.driver}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
