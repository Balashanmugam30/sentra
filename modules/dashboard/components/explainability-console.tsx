"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function ExplainabilityConsole() {
  const { explanations, live } = useAutonomousAI();
  const explanation = explanations?.explanations?.[0] ?? live?.explanation ?? null;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
        Explainability Console
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Why the autonomous core chose this decision
      </h2>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">Why this action?</p>
          <p className="mt-2 text-sm leading-6 text-white/64">
            {explanation?.why_this_action ?? "Syncing reasoning trace from the autonomous core."}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">Why not alternatives?</p>
          <div className="mt-3 space-y-2">
            {(explanation?.rejected_alternatives ?? []).map((item, index) => (
              <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-2 text-sm text-white/62" key={`${item}-${index}`}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-cyan-200/12 bg-cyan-200/6 p-4">
          <p className="text-sm font-semibold text-cyan-50">Signals considered</p>
          <div className="mt-3 space-y-2">
            {(explanation?.signals_considered ?? []).map((signal, index) => (
              <div className="rounded-2xl border border-cyan-200/12 bg-black/16 px-3 py-2 text-sm text-cyan-50/72" key={`${signal}-${index}`}>
                {signal}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-amber-200/12 bg-amber-200/6 p-4">
          <p className="text-sm font-semibold text-amber-50">Human-readable trace</p>
          <div className="mt-3 space-y-2">
            {(explanation?.human_readable_trace ?? []).map((item, index) => (
              <div className="rounded-2xl border border-amber-200/12 bg-black/16 px-3 py-2 text-sm text-amber-50/74" key={`${item}-${index}`}>
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

