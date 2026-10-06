"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { subscribeNetworkState } from "@/lib/mobile/offline";
import { registerSentraServiceWorker } from "@/lib/mobile/pwa";
import { cn } from "@/lib/mobile/helpers";
import { useMobileStore } from "@/store/useMobileStore";
import { BottomNav } from "./bottom-nav";
import { NetworkRecoveryBanner } from "./network-recovery-banner";
import { TopStatusBar } from "./top-status-bar";

type MobileShellProps = {
  children: ReactNode;
};

export function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const highContrast = useMobileStore((state) => state.highContrast);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const syncQueue = useMobileStore((state) => state.syncQueue);
  const reduceMotion = useReducedMotion();
  const reducedMotion = useMobileStore((state) => state.reducedMotion);
  const flushSyncQueue = useMobileStore((state) => state.flushSyncQueue);
  const setNetwork = useMobileStore((state) => state.setNetwork);

  useEffect(() => {
    registerSentraServiceWorker();
    return subscribeNetworkState(setNetwork, flushSyncQueue);
  }, [flushSyncQueue, setNetwork]);

  return (
    <div className={cn("min-h-dvh bg-[#030712] text-white", highContrast && "contrast-125 saturate-150")}>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#030712,#07111f_55%,#020617)]" />
      <TopStatusBar />
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md space-y-4 px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-5"
        initial={reduceMotion || reducedMotion ? false : { opacity: 0, y: 10 }}
        key={pathname}
        transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
      >
        <NetworkRecoveryBanner networkOnline={networkOnline} queuedCount={syncQueue.length} />
        {children}
      </motion.main>
      <BottomNav />
    </div>
  );
}
