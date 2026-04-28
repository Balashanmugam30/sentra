"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { SENTRA_CASE_STUDY } from "@/lib/product-positioning";

const storySteps = [
  {
    label: "Problem",
    title: "Crisis work is fragmented.",
    body: SENTRA_CASE_STUDY.problem,
  },
  {
    label: "Solution",
    title: "One command product connects the response.",
    body: "Sentra gives operators, executives, and demo audiences a shared system for live state, AI reasoning, twin context, and recovery evidence.",
  },
  {
    label: "Impact",
    title: "The product explains what matters.",
    body: "The interface turns incidents into decisions, routes, confidence, business exposure, and a concise executive narrative.",
  },
] as const;

export function CaseStudySection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#05070b] to-black" id="case-study">
      <motion.div
        className="space-y-12"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end" variants={fadeUp}>
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
              Product case study
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
              From student project to credible enterprise product narrative.
            </h2>
          </div>
          <p className="text-base leading-7 text-white/62">
            This section is built for portfolio readers: it makes the product thinking, engineering scope, and real-world value understandable without needing a live walkthrough.
          </p>
        </motion.div>

        <motion.div className="grid gap-5 lg:grid-cols-3" variants={staggerContainer}>
          {storySteps.map((step) => (
            <motion.article
              className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_26px_78px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
              key={step.label}
              variants={fadeUp}
            >
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-white/38">{step.label}</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{step.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/62">{step.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div className="grid gap-5 lg:grid-cols-[1fr_1fr]" variants={staggerContainer}>
          <motion.article
            className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-100/50">
              Why existing systems fail
            </p>
            <div className="mt-5 space-y-3">
              {SENTRA_CASE_STUDY.whySystemsFail.map((item) => (
                <div className="rounded-2xl border border-white/10 bg-black/[0.22] px-4 py-3 text-sm leading-6 text-white/66" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/50">
              How Sentra responds
            </p>
            <div className="mt-5 space-y-3">
              {SENTRA_CASE_STUDY.response.map((item) => (
                <div className="rounded-2xl border border-white/10 bg-black/[0.22] px-4 py-3 text-sm leading-6 text-white/66" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </motion.article>
        </motion.div>

        <motion.div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]" variants={staggerContainer}>
          <motion.article
            className="rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(125,211,252,0.11),rgba(139,92,246,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_30px_92px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
              Technical depth
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SENTRA_CASE_STUDY.stack.map((item) => (
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white/72" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </motion.article>

          <motion.article
            className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_28px_86px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            variants={fadeUp}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/58">
              AI capabilities
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {SENTRA_CASE_STUDY.aiCapabilities.map((item) => (
                <span className="rounded-2xl border border-white/10 bg-black/[0.22] px-3 py-2 text-sm text-white/68" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </motion.article>
        </motion.div>

        <motion.div className="flex flex-col gap-3 rounded-[34px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between" variants={fadeUp}>
          <p className="text-sm leading-6 text-white/64">
            Want the short version? Open the guided showcase and follow Executive → Crisis → Demo → Analytics.
          </p>
          <Link
            className="inline-flex w-fit items-center justify-center rounded-full border border-cyan-100/18 bg-cyan-200/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-100/18"
            href="/demo"
          >
            Run the story
          </Link>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
