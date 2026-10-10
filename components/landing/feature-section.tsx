"use client";

import { motion } from "framer-motion";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

const cards = [
  {
    title: "AI Decision Engine",
    description: "Ranked response options that explain urgency, confidence, blast radius impact, and immediate next action.",
    tag: "Intelligence",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    title: "Real-time Sensor Monitoring",
    description: "Continuous telemetry fusion across structural detectors, facility gates, atmospheric monitors, and live risk states.",
    tag: "Telemetry",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    title: "Smart Evacuation Routing",
    description: "Dynamic route calculation adapting in real time to fire progression, structural debris, and occupancy density.",
    tag: "Operations",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    title: "Digital Twin TwinOps",
    description: "Interactive 3D and 2D spatial layouts displaying live hazard plumes, responder locations, and facility barriers.",
    tag: "Spatial",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    title: "Predictive Spread Modeling",
    description: "Forward-looking simulation models calculating chemical and thermal diffusion before teams commit resources.",
    tag: "Prediction",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    title: "Executive Crisis Governance",
    description: "Automated boardroom summaries, timeline auditing, compliance logging, and operational SLA reporting.",
    tag: "Governance",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
] as const;

export function FeatureSection() {
  return (
    <SectionWrapper className="bg-slate-50/50 py-24 border-t border-slate-200/60" id="features">
      <motion.div
        className="w-full space-y-16"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div className="max-w-2xl space-y-4" variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            Core Architecture
          </div>
          <motion.h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Engineered for high-consequence operations
          </motion.h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            Sentra unifies telemetry, spatial digital twins, autonomous AI advisory, and executive oversight into one calm, reliable operating surface.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          transition={{ staggerChildren: 0.1 }}
          variants={staggerContainer}
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              transition={{ ...revealTransition, delay: index * 0.03 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.08)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${card.badgeColor}`}>
                    {card.tag}
                  </span>
                  <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-blue-600">
                <span>View capability telemetry</span>
                <span>&rarr;</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
