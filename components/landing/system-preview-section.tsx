"use client";

import { motion } from "framer-motion";
import { fadeUp, revealTransition, revealViewport, staggerContainer } from "@/components/landing/motion";
import { SectionWrapper } from "@/components/landing/section-wrapper";

export function SystemPreviewSection() {
  return (
    <SectionWrapper className="bg-white py-24 border-t border-slate-200/60" id="system">
      <motion.div
        className="grid items-center gap-12 lg:grid-cols-2"
        initial="hidden"
        transition={revealTransition}
        variants={staggerContainer}
        viewport={revealViewport}
        whileInView="show"
      >
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            Unified Interface
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            One single surface for command, trust, and execution
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600">
            Sentra eliminates fragmented tool chains. Field telemetry, spatial geometry, autonomous AI recommendations, and executive timelines synchronize across every role simultaneously.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              { title: "Deterministic Crisis Scenarios", desc: "Chemical spill, flash flood, structural collapse, cyber-physical fault, and fire." },
              { title: "Sub-Second State Synchronization", desc: "WebSocket backplane delivering real-time telemetry across all open nodes." },
              { title: "Safe Actuator Safeguards", desc: "Simulations remain fully sandboxed; no genuine actuators or public alerts trigger without human confirmation." },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Surface Mockup / Visual Card */}
        <motion.div variants={fadeUp} className="relative">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs font-semibold text-slate-500">sentra-command://live-twin</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Telemetry
              </span>
            </div>

            {/* Simulated Operations Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600">Active Incidents</div>
                  <div className="mt-1 font-display text-xl font-bold text-slate-900">03</div>
                  <div className="text-[0.65rem] text-blue-600 mt-0.5">All monitored</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600">Response Readiness</div>
                  <div className="mt-1 font-display text-xl font-bold text-emerald-600">98.4%</div>
                  <div className="text-[0.65rem] text-slate-600 mt-0.5">Optimal state</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600">Digital Twin Health</div>
                  <div className="mt-1 font-display text-xl font-bold text-slate-900">100%</div>
                  <div className="text-[0.65rem] text-slate-600 mt-0.5">8 Nodes online</div>
                </div>
              </div>

              {/* Feed Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Incident Feed • Sector Delta 4</span>
                  <span className="font-mono text-[0.65rem] text-slate-600">14:02:18 UTC</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs">
                    <span className="font-semibold text-amber-900">Warning: Thermal Threshold 42°C</span>
                    <span className="font-medium text-amber-700">Zone B West</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-xs">
                    <span className="font-semibold text-blue-900">AI Dispatch: Auto-Route Unit R-04</span>
                    <span className="font-medium text-blue-700">ETA 3.2m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
