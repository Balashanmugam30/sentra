"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function tone(value: number) {
  if (value >= 80) {
    return "text-rose-100 border-rose-300/28 bg-rose-400/12";
  }
  if (value >= 60) {
    return "text-amber-100 border-amber-300/28 bg-amber-400/12";
  }
  return "text-cyan-100 border-cyan-300/24 bg-cyan-400/10";
}

export function AutonomousIntelligencePanel() {
  const { error, lastAction, live, loading, refresh, runCycle, testScenario } = useAutonomousAI();
  const topDecision = live?.top_decision;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(8,18,36,0.86),rgba(255,255,255,0.045))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(103,232,249,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(245,158,11,0.12),transparent_28%)]" />
      <div className="relative z-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/56">
              Autonomous Intelligence Core
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
              Sentra is actively reasoning over live crisis signals.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {live?.reasoning_summary ?? "Syncing autonomous decision cycle from the latest verified state."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
              disabled={loading}
              onClick={() => {
                void refresh();
              }}
              type="button"
            >
              {loading ? "Syncing core" : "Refresh Core"}
            </button>
            <button
              className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/16"
              onClick={() => {
                void runCycle();
              }}
              type="button"
            >
              Run Cycle
            </button>
            <button
              className="rounded-full border border-rose-200/22 bg-rose-200/10 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-200/16"
              onClick={() => {
                void testScenario("zone_fire_escalation");
              }}
              type="button"
            >
              Fire Scenario
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["AI Posture", live?.ai_posture?.replaceAll("_", " ") ?? "syncing"],
            ["Top Threat", live?.top_threat ?? "evaluating"],
            ["Urgency", `${live?.urgency_score ?? 0}%`],
            ["Confidence", `${live?.confidence_score ?? 0}%`],
            ["Recovery ETA", live?.recovery_eta ?? "--"],
          ].map(([label, value]) => (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={label}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/42">
                {label}
              </p>
              <div className="mt-3 text-lg font-semibold capitalize text-white">{value}</div>
            </div>
          ))}
        </div>

        {topDecision ? (
          <div className="mt-5 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-cyan-100/48">
                  Top Decision
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{topDecision.title}</h3>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-white/62">{topDecision.why}</p>
              </div>
              <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${tone(topDecision.urgency)}`}>
                {topDecision.approval_required ? "Approval Required" : "Ready to Execute"}
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-200/18 bg-amber-200/8 px-4 py-3 text-sm text-amber-50/82">
            {error}
          </div>
        ) : null}
        {lastAction ? (
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-100/44">
            Last action: {lastAction}
          </p>
        ) : null}
      </div>
    </section>
  );
}

