"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { AuroraBackground } from "@/components/landing/aurora-background";
import { DotGrid } from "@/components/landing/dot-grid";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      aria-labelledby="sentra-landing-hero-title"
      className="relative z-20 flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-24 text-center"
      id="hero"
    >
      <div className="absolute inset-0 z-0 bg-[#010101]" />
      <AuroraBackground className="z-10" placement="hero" />
      <div className="landing-hero-dot-mask pointer-events-none absolute inset-x-0 top-0 z-[15] h-[56vh] overflow-hidden">
        <DotGrid />
      </div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mx-auto flex max-w-[1680px] translate-y-[2.5vh] flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p className="text-[clamp(0.78rem,0.95vw,1rem)] font-semibold uppercase tracking-[0.38em] text-white/56">
          AI Crisis Intelligence System
        </p>
        <h1
          className="mt-10 max-w-[1680px] text-[clamp(3.85rem,5.45vw,6.45rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-white drop-shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
          id="sentra-landing-hero-title"
        >
          Real-time Crisis Intelligence
        </h1>
        <p className="mt-10 max-w-3xl text-[clamp(1.12rem,1.45vw,1.55rem)] font-medium leading-8 text-white/68">
          Monitor, predict, and respond to emergencies with precision.
        </p>
        <motion.button
          aria-label="Get started with Sentra"
          className="mt-10 inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-8 py-4 text-[1.25rem] font-semibold text-white shadow-[0_0_44px_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:bg-white/[0.13]"
          onClick={() => router.push("/login")}
          type="button"
          whileHover={{ scale: 1.035, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </section>
  );
}
