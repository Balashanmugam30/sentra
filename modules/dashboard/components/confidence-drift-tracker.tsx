"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function ConfidenceDriftTracker() {
  const { confidence } = useAutonomousAI();
  const before = confidence?.confidence_before ?? 0;
  const after = confidence?.confidence_after ?? 0;

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[rgba(6,12,24,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Confidence Drift Tracker
      </p>
      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            Confidence changed from {before}% to {after}%
          </h2>
          <p className="mt-2 text-sm text-white/56">
            Decision {confidence?.decision_id ?? "syncing"} • {confidence?.direction ?? "stable"} {confidence?.delta ?? 0} points
          </p>
        </div>
        <div className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Current confidence {after}%
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/38">
            <span>Before</span>
            <span>After</span>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${after}%` }} />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">
            The model preserves a visible confidence trail instead of zero-state claims.
          </p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
          <p className="text-sm font-semibold text-white">Why confidence changed</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
            {(confidence?.changed_because ?? []).map((factor, index) => (
              <li key={`${factor}-${index}`}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
