"use client";

import { motion } from "framer-motion";

import { InteractiveCard } from "@/components/landing/interactive-card";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

export function AISection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-transparent via-black/60 to-black" id="ai-engine">
      <motion.div
        className="grid items-center gap-16 md:grid-cols-2"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div
          className="order-2 md:order-1"
          variants={fadeUp}
        >
          <InteractiveCard className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-white/45">AI Model Surface</p>
              <p className="text-xl font-medium text-white">Explainable recommendations under pressure</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(168,85,247,0.14),rgba(255,255,255,0.02))] p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded-full bg-white/15" />
                    <div className="h-2 w-32 rounded-full bg-white/10" />
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">
                    Active
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { label: "Hazard spread confidence", width: "84%" },
                    { label: "Occupancy routing confidence", width: "72%" },
                    { label: "Alert dispatch readiness", width: "91%" },
                  ].map((bar) => (
                    <div className="space-y-2" key={bar.label}>
                      <div className="flex items-center justify-between text-xs text-white/55">
                        <span>{bar.label}</span>
                        <span>{bar.width}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div
                          animate={{ opacity: [0.7, 1, 0.8] }}
                          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.9),rgba(34,211,238,0.55),rgba(59,130,246,0.35))]"
                          style={{ width: bar.width }}
                          transition={{ duration: 4.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["Fuse", "Model", "Recommend"].map((item) => (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4" key={item}>
                    <div className="h-2 w-12 rounded-full bg-white/15" />
                    <p className="mt-4 text-sm text-white/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </InteractiveCard>
        </motion.div>

        <motion.div className="order-1 max-w-xl space-y-6 md:order-2" variants={staggerContainer}>
          <motion.h2 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl" variants={fadeUp}>
            Product depth beyond a dashboard
          </motion.h2>
          <motion.p className="max-w-xl text-base leading-7 text-white/70" variants={fadeUp}>
            Sentra interprets live inputs, models consequence, and turns operational complexity into decisions a responder, executive, or judge can understand quickly.
          </motion.p>

          <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer}>
            {[
              "Live signal fusion",
              "Predictive impact modeling",
              "Adaptive route recommendations",
              "Executive-ready summaries",
            ].map((item) => (
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 backdrop-blur-xl"
                key={item}
                variants={fadeUp}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
