"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { MOBILE_NAV_ITEMS } from "@/lib/mobile/constants";
import { cn } from "@/lib/mobile/helpers";

export function BottomNav() {
  const pathname = usePathname();
  const basePrefix = pathname.startsWith("/mobile") ? "/mobile" : "";

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#030712]/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 backdrop-blur-2xl"
    >
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const itemHref = `${basePrefix}${item.href}`;
          const active =
            pathname === itemHref ||
            (pathname === "/mobile" && item.href === "/home") ||
            (pathname === "/" && item.href === "/home");
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 text-[0.65rem] font-semibold transition",
                active
                  ? "bg-blue-400/16 text-blue-100 shadow-[0_0_26px_rgba(59,130,246,0.16)]"
                  : "text-slate-400 hover:bg-white/8 hover:text-white",
              )}
              href={itemHref as Route}
              key={item.href}
            >
              <span className="mb-1 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {item.shortLabel}
            </Link>
          );
        })}
        <Link
          className="flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 text-[0.65rem] font-semibold text-cyan-300 transition hover:bg-white/10"
          href="/dashboard"
          title="Switch to Desktop Command OS"
        >
          <span className="mb-1 text-[0.7rem]">🖥️</span>
          <span>Command</span>
        </Link>
      </div>
    </nav>
  );
}
