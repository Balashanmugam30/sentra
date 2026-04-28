"use client";

import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { SENTRA_POSITIONING, SENTRA_TRUST_SIGNALS } from "@/lib/product-positioning";

const maturitySignals = [
  "Real-time state architecture",
  "Protected command routes",
  "Premium chart system",
  "Digital twin workspace",
  "Executive storytelling layer",
  "Graceful degraded-data UX",
] as const;

export function TrustSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#040813] to-black" id="trust">
      <motion.div
        className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div
          className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          variants={fadeUp}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Enterprise credibility
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
            Credible enough to pitch. Clear enough to evaluate.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/62">{SENTRA_POSITIONING.trustLine}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SENTRA_TRUST_SIGNALS.map((signal) => (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70" key={signal}>
                {signal}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="grid gap-5" variants={staggerContainer}>
          <motion.article
            className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/58">
                  Live operations status
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
                  Stable foundation for demos and portfolio review.
                </h3>
              </div>
              <div className="rounded-full border border-emerald-100/16 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50">
                Systems healthy
              </div>
            </div>
          </motion.article>

          <motion.article
            className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">
              Engineering maturity visible in the product
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {maturitySignals.map((signal) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3" key={signal}>
                  <span className="h-2 w-2 rounded-full bg-violet-200 shadow-[0_0_18px_rgba(158,140,255,0.4)]" />
                  <span className="text-sm text-white/70">{signal}</span>
                </div>
              ))}
            </div>
          </motion.article>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
