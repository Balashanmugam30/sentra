"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "syncing" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function StrategyAdaptationTimeline() {
  const { timeline } = useAutonomousAI();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
        Strategy Adaptation Timeline
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Decisions changed over time as Sentra observes, predicts, acts, and learns
      </h2>
      <div className="mt-5 space-y-3">
        {(timeline?.events ?? []).map((event) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={event.event_id}>
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/42">
                  {formatTime(event.timestamp)} · {event.event_type}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">{event.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{event.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

