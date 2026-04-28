"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { SENTRA_SHOWCASE_PATH } from "@/lib/product-positioning";

export function DemoPathSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#05070b] to-black" id="demo-path">
      <motion.div
        className="space-y-12"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" variants={fadeUp}>
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">
              Two-minute showcase path
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
              A guided product story for recruiters, judges, founders, and investors.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-white/62">
              The best demo path moves from strategic clarity to emergency execution, then closes with evidence and product depth.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center justify-center rounded-full border border-violet-100/18 bg-violet-200/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-100/18"
            href="/demo"
          >
            Run 2-min demo
          </Link>
        </motion.div>

        <motion.div className="grid gap-4 lg:grid-cols-4" variants={staggerContainer}>
          {SENTRA_SHOWCASE_PATH.map((step, index) => (
            <motion.article
              className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_64px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
              key={step.label}
              variants={fadeUp}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-200/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/42">
                    {index === 0 ? "Begin" : index === 3 ? "Close" : "Then"}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-white">{step.label}</h3>
                <p className="mt-3 min-h-24 text-sm leading-6 text-white/58">{step.summary}</p>
                <Link
                  className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                  href={step.href}
                >
                  Open view
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
