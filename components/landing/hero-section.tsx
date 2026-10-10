"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { WaveAccent } from "@/components/brand/wave-accent";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      aria-labelledby="sentra-landing-hero-title"
      className="relative z-20 flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center"
      id="hero"
    >
      <WaveAccent variant="hero" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mx-auto flex max-w-4xl flex-col items-center"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Sentra OS 3.2 • Enterprise Crisis Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08]"
          id="sentra-landing-hero-title"
        >
          Real-time Crisis Intelligence.
          <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
            Calm, coordinated, verified.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-lg sm:text-xl font-normal leading-relaxed text-slate-600">
          Monitor multi-facility operations, predict hazard spread, and execute high-consequence emergency response in one unified, auditable command surface.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            aria-label="Launch Sentra console"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow active:scale-[0.98]"
            onClick={() => router.push("/login")}
            type="button"
          >
            Launch Command Console
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <a
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
            href="#features"
          >
            Explore Scenarios
          </a>
        </div>

        {/* Operational Proof Highlights Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-3xl pt-8 border-t border-slate-200/70">
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-slate-900">5</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Crisis Demo Scenarios</div>
          </div>
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-slate-900">&lt;15ms</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Realtime Socket Sync</div>
          </div>
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-slate-900">99.99%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">High-Availability SLA</div>
          </div>
          <div className="text-left">
            <div className="font-display text-2xl font-bold text-slate-900">100%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Air-Gapped Simulation</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
