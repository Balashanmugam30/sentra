"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";
import { SENTRA_LAUNCH_READINESS } from "@/lib/product-positioning";

export function LaunchReadinessSection() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-black via-[#040916] to-black" id="launch-readiness">
      <motion.div
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:p-8"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(125,211,252,0.14),transparent_26rem),radial-gradient(circle_at_88%_18%,rgba(139,92,246,0.1),transparent_28rem)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <motion.div className="max-w-2xl" variants={fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
              Launch readiness
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] text-white md:text-5xl">
              Polished for public review, recruiter screens, and live product demos.
            </h2>
            <p className="mt-5 text-base leading-7 text-white/62">
              Sentra now presents like a finished command product: clear positioning, protected app routes, a guided story path, and a premium UI that stays composed during review.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-200/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-100/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200/70"
                href="/landing#demo-path"
              >
                Follow demo path
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200/70"
                href="/executive"
              >
                Open executive view
              </Link>
            </div>
          </motion.div>

          <motion.div className="grid gap-3 sm:grid-cols-2" variants={staggerContainer}>
            {SENTRA_LAUNCH_READINESS.map((item) => (
              <motion.article
                className="group rounded-[28px] border border-white/10 bg-black/24 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/18 hover:bg-white/[0.055]"
                key={item.label}
                variants={fadeUp}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                    {item.label}
                  </p>
                  <span className="rounded-full border border-cyan-100/14 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                    {item.metric}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/64">{item.summary}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
