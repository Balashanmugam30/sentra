"use client";

import { motion } from "framer-motion";

type RerouteBannerProps = {
  reason: string | null;
};

export function RerouteBanner({ reason }: RerouteBannerProps) {
  if (!reason) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-amber-300/25 bg-amber-400/14 p-4 text-amber-50 shadow-[0_0_36px_rgba(245,158,11,0.14)]"
      initial={{ opacity: 0, y: -8 }}
      role="status"
    >
      <p className="text-sm font-bold">{reason}</p>
      <p className="mt-1 text-xs leading-5 text-amber-100/75">Sentra recomputed the safest path and updated ETA automatically.</p>
    </motion.div>
  );
}
