"use client";

import { motion } from "framer-motion";

const journeySteps = [
  {
    label: "Incident detected",
    detail: "Signals converge from sensor, CCTV, and operational context.",
  },
  {
    label: "AI analyzes",
    detail: "Sentra estimates spread, congestion, ETA drift, and business exposure.",
  },
  {
    label: "Risk escalates",
    detail: "The command layer prioritizes severity, responder pressure, and zone impact.",
  },
  {
    label: "Sentra responds",
    detail: "Routes, alerts, and recommended actions move into an auditable command flow.",
  },
  {
    label: "Briefing generated",
    detail: "Executives get a concise recovery posture with confidence and next action.",
  },
] as const;

export function CinematicDemoJourney({ activeIndex }: { activeIndex: number }) {
  const activeStep = activeIndex % journeySteps.length;

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_76px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/48">
            Smart interactive demo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
            The product story moves like an incident timeline.
          </h2>
        </div>
        <span className="w-fit rounded-full border border-cyan-100/16 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-50">
          Presentation ready
        </span>
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {journeySteps.map((step, index) => {
          const active = index === activeStep;
          return (
            <motion.article
              animate={{ opacity: active ? 1 : 0.72, y: active ? -3 : 0 }}
              className={`relative overflow-hidden rounded-3xl border p-4 ${
                active
                  ? "border-cyan-100/24 bg-cyan-200/[0.085]"
                  : "border-white/10 bg-black/20"
              }`}
              key={step.label}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {active ? (
                <motion.span
                  animate={{ x: ["-30%", "120%"] }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  transition={{ duration: 2.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                />
              ) : null}
              <div className="relative">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/36">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-sm font-semibold text-white">{step.label}</h3>
                <p className="mt-2 min-h-16 text-xs leading-5 text-white/52">{step.detail}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
