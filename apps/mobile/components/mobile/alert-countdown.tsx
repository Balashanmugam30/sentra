"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { formatEta } from "../../lib/mobile/helpers";

type AlertCountdownProps = {
  initialSeconds: number;
};

export function AlertCountdown({ initialSeconds }: AlertCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [initialSeconds]);

  return (
    <div className="rounded-[28px] border border-red-300/25 bg-red-500/12 p-5 text-center shadow-[0_0_50px_rgba(239,68,68,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Move within</p>
      <motion.p
        animate={reduceMotion ? undefined : { scale: seconds <= 30 ? [1, 1.04, 1] : 1 }}
        className="mt-2 font-mono text-5xl font-black tracking-[-0.08em] text-white"
        transition={{ duration: 1.2, repeat: seconds <= 30 ? Infinity : 0 }}
      >
        {formatEta(seconds)}
      </motion.p>
      <p className="mt-2 text-sm text-red-100/80">Follow the active route unless staff redirects you.</p>
    </div>
  );
}
