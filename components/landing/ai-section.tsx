"use client";

import { motion } from "framer-motion";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

export function AISection() {
  return (
    <SectionWrapper className="bg-slate-50/50 py-24 border-t border-slate-200/60" id="ai-engine">
      <motion.div
        className="grid items-center gap-12 lg:grid-cols-2"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div variants={fadeUp} className="order-2 lg:order-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600">AI Council Advisory</span>
                <h4 className="font-display text-lg font-bold text-slate-900">Explainable Decision Log</h4>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Confidence 94.2%
              </span>
            </div>

            <div className="space-y-4">
              {[
                { label: "Hazard Spread Model", score: "94%", detail: "Chemical plume dispersion bounded to Zone C corridor" },
                { label: "Evacuation Path Clearance", score: "88%", detail: "Alternative stairwell Route-2 validated unobstructed" },
                { label: "Resource Allocation Feasibility", score: "97%", detail: "3 Hazmat crews dispatched within 4-minute radius" },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>{item.label}</span>
                    <span className="text-blue-600">{item.score}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: item.score }} />
                  </div>
                  <p className="text-[0.75rem] text-slate-500 leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Explainable AI
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Evidence-backed recommendations under extreme pressure
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            Sentra AI does not make opaque decisions. Every ranking provides mathematical confidence, blast radius projections, source telemetry citations, and plain-language reasoning.
          </p>
          <div className="pt-2">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Explore AI Council audit trails</span>
              <span>&rarr;</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
