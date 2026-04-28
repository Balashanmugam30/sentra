"use client";

import { motion } from "framer-motion";

import { AuroraBackground } from "@/components/landing/aurora-background";
import { MagneticButton } from "@/components/landing/magnetic-button";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";

export function CTASection() {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-transparent via-black/60 to-black px-5 py-24 sm:px-8"
      id="open"
    >
      <AuroraBackground className="absolute inset-0 z-20" placement="cta" />
      <div className="relative z-30 mx-auto w-full max-w-[1200px] text-center">
        <div className="absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
        <div className="absolute left-[18%] top-[28%] -z-10 h-24 w-24 rounded-full border border-white/10 bg-white/[0.035] blur-[1px]" />
        <div className="absolute bottom-[22%] right-[20%] -z-10 h-16 w-16 rounded-full border border-white/10 bg-cyan-200/[0.055] blur-[0.5px]" />
        <div className="relative z-30 w-full">
          <motion.div
            className="relative z-10 space-y-7"
            initial="hidden"
            transition={revealTransition}
            variants={staggerContainer}
            viewport={revealViewport}
            whileInView="show"
          >
            <motion.p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/46" variants={fadeUp}>
              Sentra Command OS
            </motion.p>
            <motion.h2
              className="mx-auto max-w-5xl text-5xl font-semibold tracking-[-0.07em] text-white md:text-7xl lg:text-8xl"
              variants={fadeUp}
            >
              Command clarity is here.
            </motion.h2>
            <motion.p className="mx-auto max-w-xl text-base leading-7 text-white/58 md:text-lg" variants={fadeUp}>
              Step into a calmer way to see incidents, decisions, and response in one intelligent operating surface.
            </motion.p>
            <motion.div
              className="mx-auto inline-flex items-center justify-center pt-1"
              variants={fadeUp}
            >
              <MagneticButton
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-8 py-4 text-[1.25rem] font-semibold text-white shadow-[0_0_44px_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:bg-white/[0.13]"
                href="/login"
              >
                Get Started
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
