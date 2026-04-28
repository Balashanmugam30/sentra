"use client";

import { motion } from "framer-motion";

import { InteractiveCard } from "@/components/landing/interactive-card";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

export function SystemPreviewSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-transparent via-black/60 to-black" id="system">
      <motion.div
        className="grid items-center gap-16 md:grid-cols-2"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div variants={fadeUp}>
          <div className="max-w-xl space-y-6">
            <motion.h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              One product surface for command, trust, and action
            </motion.h2>
            <p className="max-w-xl text-base leading-7 text-white/70">
              Sentra brings live monitoring, operational context, AI recommendations, and executive evidence into a single coordinated interface.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-6"
          transition={{ staggerChildren: 0.15 }}
          variants={staggerContainer}
        >
          <InteractiveCard className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10">
            <motion.div
              className="space-y-6"
              transition={revealTransition}
              variants={fadeUp}
            >
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/45">Command Surface</p>
                  <p className="text-xl font-medium text-white/90">Unified operational intelligence</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Live
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(168,85,247,0.22),rgba(34,211,238,0.1),rgba(255,255,255,0.02))] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-2 w-24 rounded-full bg-white/20" />
                      <div className="h-2 w-44 rounded-full bg-white/10" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-white/30" />
                      <div className="h-2 w-2 rounded-full bg-white/20" />
                      <div className="h-2 w-2 rounded-full bg-white/15" />
                    </div>
                  </div>

                  <div className="mt-6 h-40 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
                    <div className="space-y-3">
                      <div className="h-2 w-28 rounded-full bg-white/15" />
                      <div className="h-2 w-3/4 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-6 space-y-4">
                      {["78%", "64%", "91%"].map((width, index) => (
                        <div className="space-y-2" key={width}>
                          <div className="h-2 rounded-full bg-white/10">
                            <motion.div
                              animate={{ opacity: [0.82, 1, 0.86] }}
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.9),rgba(34,211,238,0.55),rgba(59,130,246,0.36))]"
                              style={{ width }}
                              transition={{
                                duration: 4 + index,
                                ease: "easeInOut",
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            />
                          </div>
                          <div className="h-2 w-1/3 rounded-full bg-white/8" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 h-2 w-20 rounded-full bg-white/15" />
                    <div className="h-24 rounded-2xl bg-[linear-gradient(180deg,rgba(168,85,247,0.18),rgba(255,255,255,0.03))]" />
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 h-2 w-16 rounded-full bg-white/15" />
                    <div className="grid gap-2">
                      <div className="h-2 rounded-full bg-white/10" />
                      <div className="h-2 w-4/5 rounded-full bg-white/10" />
                      <div className="h-2 w-3/5 rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.65),rgba(34,211,238,0.35))]" />
                    </div>
                    <div className="mt-5 flex gap-2">
                      <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5" />
                      <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5" />
                      <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/5" />
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-2 w-16 rounded-full bg-white/15" />
                      <div className="h-2 w-10 rounded-full bg-white/10" />
                    </div>
                    <div className="relative h-24 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
                      <div className="absolute left-[14%] top-[24%] h-10 w-14 rounded-2xl border border-white/10 bg-white/5" />
                      <div className="absolute right-[14%] top-[28%] h-10 w-16 rounded-2xl border border-white/10 bg-white/5" />
                      <div className="absolute bottom-[24%] left-[20%] h-2 w-[50%] rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.82),rgba(34,211,238,0.56),rgba(59,130,246,0.36))]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </InteractiveCard>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
