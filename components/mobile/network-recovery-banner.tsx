"use client";

import { motion } from "framer-motion";
import { memo } from "react";

import { cn } from "@/lib/mobile/helpers";

type NetworkRecoveryBannerProps = {
  networkOnline: boolean;
  queuedCount: number;
};

export const NetworkRecoveryBanner = memo(function NetworkRecoveryBanner({ networkOnline, queuedCount }: NetworkRecoveryBannerProps) {
  if (networkOnline && queuedCount === 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[24px] border p-4 shadow-[0_0_34px_rgba(0,0,0,0.18)]",
        networkOnline ? "border-emerald-300/25 bg-emerald-400/12 text-emerald-50" : "border-amber-300/25 bg-amber-400/12 text-amber-50",
      )}
      initial={{ opacity: 0, y: -8 }}
      role="status"
    >
      <p className="text-sm font-black">{networkOnline ? "Network recovered" : "Offline continuity active"}</p>
      <p className="mt-1 text-xs leading-5 text-slate-200">
        {networkOnline ? `${queuedCount} queued actions are ready to sync.` : `${queuedCount} actions are protected locally until connection returns.`}
      </p>
    </motion.div>
  );
});
