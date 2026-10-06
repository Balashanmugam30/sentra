"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { memo } from "react";

import { QUICK_ACTIONS } from "@/lib/mobile/constants";
import { cn } from "@/lib/mobile/helpers";

import type { Route } from "next";
import { usePathname } from "next/navigation";

const actionToneClass = {
  accent: "border-blue-300/20 bg-blue-400/12 text-blue-50 shadow-[0_0_26px_rgba(59,130,246,0.11)]",
  critical: "border-red-300/25 bg-red-400/14 text-red-50 shadow-[0_0_26px_rgba(239,68,68,0.12)]",
  neutral: "border-white/10 bg-white/[0.055] text-slate-100",
  safe: "border-emerald-300/20 bg-emerald-400/12 text-emerald-50 shadow-[0_0_26px_rgba(16,185,129,0.1)]",
  warning: "border-amber-300/20 bg-amber-400/12 text-amber-50 shadow-[0_0_26px_rgba(245,158,11,0.11)]",
};

export const QuickActions = memo(function QuickActions() {
  const pathname = usePathname();
  const basePrefix = pathname.startsWith("/mobile") ? "/mobile" : "";

  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Operate</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white" id="quick-actions-title">
            Quick actions
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <motion.div key={`${action.href}-${action.label}`} whileTap={{ scale: 0.97 }}>
            <Link
              className={cn("block min-h-24 rounded-[24px] border p-4 transition hover:-translate-y-0.5", actionToneClass[action.tone])}
              href={`${basePrefix}${action.href}` as Route}
            >
              <span className="block text-base font-bold tracking-[-0.04em]">{action.label}</span>
              <span className="mt-2 block text-xs leading-4 text-slate-300">{action.description}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
});
