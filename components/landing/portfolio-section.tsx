"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

const recruiterSignals = [
  "Product positioning and launch narrative",
  "Premium frontend architecture",
  "Real-time system thinking",
  "Protected multi-workspace app shell",
  "Executive-grade analytics and charts",
  "Firebase and FastAPI integration foundation",
] as const;

export function PortfolioSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#040713] to-black" id="portfolio">
      <motion.div
        className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div
          className="rounded-[38px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_32px_96px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
          variants={fadeUp}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Portfolio-ready showcase
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
            Built to be evaluated in public.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/62">
            Sentra is structured to show product taste, engineering maturity, design systems, live-data thinking, and founder-level storytelling in one polished experience.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-cyan-100/18 bg-cyan-200/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-100/18"
              href="/landing#case-study"
            >
              View case study
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/[0.08] hover:text-white"
              href="/executive"
            >
              Explore live product
            </Link>
          </div>
        </motion.div>

        <motion.div className="grid gap-4 sm:grid-cols-2" variants={staggerContainer}>
          {recruiterSignals.map((signal) => (
            <motion.div
              className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_68px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
              key={signal}
              variants={fadeUp}
            >
              <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-cyan-50">
                S
              </span>
              <p className="text-sm leading-6 text-white/70">{signal}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="mx-auto mt-10 max-w-3xl rounded-[30px] border border-white/10 bg-black/[0.24] px-6 py-5 text-center text-sm leading-6 text-white/56 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 16 }}
        transition={revealTransition}
        viewport={revealViewport}
        whileInView={{ opacity: 1, y: 0 }}
      >
        Built by Balashanmugam as a product-grade AI systems showcase for crisis intelligence, enterprise UX, and real-time operations.
      </motion.div>
    </SectionWrapper>
  );
}
