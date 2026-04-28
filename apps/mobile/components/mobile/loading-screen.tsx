"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#030712] px-6 text-white">
      <motion.div
        animate={{ opacity: [0.65, 1, 0.65], scale: [0.98, 1, 0.98] }}
        className="rounded-[32px] border border-white/10 bg-white/[0.07] p-7 text-center shadow-[0_24px_80px_rgba(37,99,235,0.18)] backdrop-blur-2xl"
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#1d4ed8)] shadow-[0_0_34px_rgba(56,189,248,0.4)]" />
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-blue-100/70">Sentra Mobile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Preparing command view</h1>
      </motion.div>
    </div>
  );
}
