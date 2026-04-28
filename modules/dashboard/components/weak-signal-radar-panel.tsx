"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function probabilityTone(value: number) {
  if (value >= 72) {
    return "border-rose-300/28 bg-rose-400/12 text-rose-50";
  }
  if (value >= 52) {
    return "border-amber-300/28 bg-amber-400/12 text-amber-50";
  }
  return "border-cyan-300/24 bg-cyan-400/10 text-cyan-50";
}

export function WeakSignalRadarPanel() {
  const { busyAction, testWeakSignal, weakSignals } = useAutonomousAI();
  const signals = weakSignals?.weak_signals ?? [];

  return (
    <section className="rounded-[30px] border border-amber-100/14 bg-[rgba(8,10,18,0.78)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-amber-100/58">
            Weak Signal Radar
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Pre-incident anomalies before official incident creation
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            {weakSignals?.preventive_summary ?? "Scanning environment, public safety, OSINT, SOC, and incident patterns."}
          </p>
        </div>
        <button
          className="rounded-full border border-amber-200/24 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/16 disabled:opacity-55"
          disabled={busyAction?.startsWith("weak-signal")}
          onClick={() => {
            void testWeakSignal("fire_corridor_blocked");
          }}
          type="button"
        >
          {busyAction?.startsWith("weak-signal") ? "Injecting..." : "Test Fire Signal"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {signals.slice(0, 4).map((signal) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={signal.signal_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{signal.weak_signal}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                  {signal.source} • {signal.time_to_risk}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${probabilityTone(signal.probability_of_incident)}`}>
                {signal.probability_of_incident}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">{signal.suggested_preventive_action}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {signal.affected_zones.map((zone) => (
                <span className="rounded-full border border-cyan-200/14 bg-cyan-200/8 px-2 py-1 text-xs text-cyan-50/80" key={`${signal.signal_id}-${zone}`}>
                  {zone}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
