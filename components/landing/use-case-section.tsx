"use client";

import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { SENTRA_USE_CASES } from "@/lib/product-positioning";

export function UseCaseSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#030711] to-black" id="use-cases">
      <motion.div
        className="space-y-12"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div className="max-w-3xl space-y-5" variants={fadeUp}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Real operating environments
          </p>
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
            Built for teams where delay, confusion, and fragmented systems are expensive.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-white/62">
            Sentra is positioned for high-stakes operations: facilities, cities, security teams, and executives who need shared truth during pressure.
          </p>
        </motion.div>

        <motion.div className="grid gap-5 md:grid-cols-2" variants={staggerContainer}>
          {SENTRA_USE_CASES.map((useCase) => (
            <motion.article
              className="group rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-cyan-100/20 hover:bg-white/[0.065]"
              key={useCase.title}
              variants={fadeUp}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{useCase.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{useCase.outcome}</p>
                </div>
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(125,211,252,0.46)]" />
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Signals unified
                </p>
                <p className="mt-2 text-sm leading-6 text-white/72">{useCase.signal}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
