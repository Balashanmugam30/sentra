"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { WaveAccent } from "@/components/brand/wave-accent";

export function CTASection() {
  return (
    <section
      className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-white px-4 sm:px-6 lg:px-8 py-28 text-center border-t border-slate-200/60"
      id="open"
    >
      <WaveAccent variant="subtle" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.div
          className="space-y-8"
          initial="hidden"
          transition={revealTransition}
          variants={staggerContainer}
          viewport={revealViewport}
          whileInView="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
            Enterprise Deployment Ready
          </motion.div>

          <motion.h2
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight"
            variants={fadeUp}
          >
            Ready for calm, auditable crisis intelligence?
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600"
            variants={fadeUp}
          >
            Access the Sentra Command OS. Explore live telemetry streams, execute deterministic crisis scenarios, and inspect AI Council reasoning.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
            variants={fadeUp}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow active:scale-[0.98]"
            >
              Get Started with Sentra
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
            >
              Enter Live Console
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
