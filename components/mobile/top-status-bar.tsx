"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { BUILDING_NAME } from "@/lib/mobile/constants";
import { formatRole } from "@/lib/mobile/helpers";
import { useMobileStore } from "@/store/useMobileStore";
import { StatusChip } from "./status-chip";

export function TopStatusBar() {
  const pathname = usePathname();
  const basePrefix = pathname.startsWith("/mobile") ? "/mobile" : "";
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const systemStatus = useMobileStore((state) => state.systemStatus);
  const userRole = useMobileStore((state) => state.userRole);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#030712]/78 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <Link aria-label="Sentra Mobile home" className="flex min-h-11 items-center gap-3" href={`${basePrefix}/home` as Route}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#1d4ed8)] text-sm font-black text-white shadow-[0_0_30px_rgba(56,189,248,0.28)]">
            S
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[-0.03em] text-white">Sentra</span>
            <span className="block text-[0.68rem] text-slate-400">{BUILDING_NAME}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <StatusChip status={systemStatus} />
          <span className="sr-only">Role: {formatRole(userRole)}</span>
          <span
            aria-label={networkOnline ? "Network online" : "Network offline"}
            className={`h-3 w-3 rounded-full ${networkOnline ? "bg-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.75)]" : "bg-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.75)]"}`}
          />
        </div>
      </div>
    </header>
  );
}
