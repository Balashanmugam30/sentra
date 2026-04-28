"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function DemoCinematicPanel() {
  const { busyAction, cinematicDemo, runCinematicDemo } = useAutonomousAI();

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-cyan-100/14 bg-[linear-gradient(135deg,rgba(5,12,25,0.9),rgba(103,232,249,0.08),rgba(245,158,11,0.08))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(103,232,249,0.18),transparent_32%),radial-gradient(circle_at_80%_16%,rgba(245,158,11,0.14),transparent_30%)]" />
      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
            Demo Cinematic Mode
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.065em] text-white">
            A guided crisis story from calm campus to AI-stabilized recovery
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
            {cinematicDemo
              ? `Active chapter: ${cinematicDemo.active_chapter}. Supremacy score ${cinematicDemo.supremacy_score}%.`
              : "Run the cinematic demo to advance Sentra through detection, cascade forecasting, swarm response, copilot decisioning, and recovery."}
          </p>
        </div>
        <button
          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
          disabled={busyAction === "cinematic-demo"}
          onClick={() => {
            void runCinematicDemo();
          }}
          type="button"
        >
          {busyAction === "cinematic-demo" ? "Launching story..." : "Run Cinematic Demo"}
        </button>
      </div>

      <div className="relative z-10 mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(cinematicDemo?.chapters ?? [
          "Calm campus baseline",
          "Crisis detected",
          "Chain reaction forecast",
          "Swarm response launches",
          "Copilot decides",
          "Recovery metrics shown",
        ]).map((chapter, index) => (
          <div
            className={`rounded-[20px] border p-3 text-xs leading-5 ${
              chapter === cinematicDemo?.active_chapter
                ? "border-cyan-200/26 bg-cyan-200/12 text-cyan-50"
                : "border-white/10 bg-white/[0.045] text-white/54"
            }`}
            key={`${chapter}-${index}`}
          >
            <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.16em] opacity-60">
              Chapter {index + 1}
            </span>
            {chapter}
          </div>
        ))}
      </div>
    </section>
  );
}
