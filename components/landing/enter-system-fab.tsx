"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function EnterSystemFab() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex justify-center">
      <motion.div
        className="pointer-events-auto group relative flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.28, ease: "easeInOut", delay: 0.1 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <span
          className="rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-white/70 opacity-0 backdrop-blur-xl transition-all duration-200 ease-in-out group-hover:-translate-y-0.5 group-hover:opacity-100"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(10,14,22,0.56)",
          }}
        >
          Enter System
        </span>
        <motion.div
          animate={{ opacity: [0.16, 0.28, 0.16], scale: [0.96, 1.08, 0.96] }}
          className="pointer-events-none absolute bottom-0 h-24 w-24 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(132,98,255,0.18), rgba(84,138,255,0.12), transparent 72%)",
          }}
          transition={{ duration: 5.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
          <Link
            aria-label="Enter System"
            className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border text-[1.7rem] font-light text-white backdrop-blur-2xl transition-all duration-200 ease-out"
            href="/app"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(18,24,38,0.8), rgba(14,19,30,0.72))",
              boxShadow: "var(--sentra-shadow-fab)",
            }}
          >
            +
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
