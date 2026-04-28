"use client";

import { motion } from "framer-motion";

import { InteractiveCard } from "@/components/landing/interactive-card";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

const cards = [
  {
    title: "AI Decision Engine",
    description: "Ranked response options that explain urgency, confidence, impact, and next action.",
    preview: "decision",
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous signal fusion across incidents, facilities, responders, alerts, and live risk.",
    preview: "monitoring",
  },
  {
    title: "Smart Routing",
    description: "Adaptive route logic for responders, evacuation paths, disabled occupants, and blocked exits.",
    preview: "routing",
  },
  {
    title: "Digital Twin Operations",
    description: "Facility state, hazards, occupancy, responders, and routes in one operational twin.",
    preview: "sensor",
  },
  {
    title: "Predictive Modeling",
    description: "Forward-looking spread, congestion, ETA drift, and business exposure before teams commit.",
    preview: "prediction",
  },
  {
    title: "Executive Storytelling",
    description: "Board-ready summaries that translate response quality into risk, recovery, and continuity.",
    preview: "coordination",
  },
] as const;

export function FeatureSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-transparent via-black/60 to-black" id="features">
      <motion.div
        className="w-full space-y-12"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div className="max-w-2xl space-y-6" variants={fadeUp}>
          <motion.h2 className="text-4xl font-semibold leading-tight tracking-tight text-white/90">
            Built for intelligent response
          </motion.h2>
          <p className="max-w-xl text-base leading-7 text-white/70">
            Sentra unifies live operations, AI reasoning, executive reporting, and digital twin awareness in a system designed for high-consequence environments.
          </p>
        </motion.div>

        <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            transition={{ staggerChildren: 0.15 }}
            variants={staggerContainer}
          >
          {cards.map((card, index) => (
            <InteractiveCard
              key={card.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
            >
              <motion.div
                transition={{ ...revealTransition, delay: index * 0.02 }}
                variants={fadeUp}
              >
                <div className="space-y-4">
                  <div className="relative h-14 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                    <div className="absolute left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[linear-gradient(135deg,rgba(168,85,247,0.75),rgba(34,211,238,0.55),rgba(59,130,246,0.38))]" />
                    <div className="absolute right-4 top-1/2 h-1.5 w-20 -translate-y-1/2 rounded-full bg-white/10" />
                    <div className="absolute right-4 top-1/2 h-1.5 w-12 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.65),rgba(34,211,238,0.45))]" />
                  </div>
                  <p className="text-lg font-medium text-white/90">{card.title}</p>
                  <p className="text-sm leading-6 text-white/70">{card.description}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{card.preview}</p>
                </div>
              </motion.div>
            </InteractiveCard>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
