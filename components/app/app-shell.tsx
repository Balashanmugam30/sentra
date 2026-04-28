"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";

import { bootstrapSentra } from "@/lib/bootstrap";
import { TopBar } from "@/modules/dashboard/components/top-bar";
import { SessionBanner } from "@/components/security/session-banner";
import { AppSidebar } from "@/components/app/app-sidebar";

const SIDEBAR_STORAGE_KEY = "sentra-shell-sidebar-collapsed";

function dispatchCommandPaletteOpen() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("sentra:open-command-palette"));
}

export const AppShell = memo(function AppShell({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    bootstrapSentra();

    const move = (event: MouseEvent) => {
      document.documentElement.style.setProperty("--x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--y", `${event.clientY}px`);

      const x = (event.clientX - window.innerWidth / 2) * 0.01;
      const y = (event.clientY - window.innerHeight / 2) * 0.01;

      if (gridRef.current) {
        gridRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const shellStyle = {
    "--sentra-sidebar-width": sidebarCollapsed ? "88px" : "280px",
  } as CSSProperties;

  return (
    <div
      className="app-container sentra-auth-shell relative isolate h-screen overflow-hidden text-[var(--text)]"
      data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}
      style={shellStyle}
    >
      <div className="grid-layer" ref={gridRef} />
      <div className="depth-glow" />
      <div className="cursor-glow" />

      <AppSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCollapsedChange={setSidebarCollapsed}
        onMobileOpenChange={setMobileNavOpen}
        onOpenCommand={dispatchCommandPaletteOpen}
      />

      <div className="sentra-shell-main relative z-10 flex h-full min-w-0 flex-col">
        <TopBar
          onOpenCommand={dispatchCommandPaletteOpen}
          onOpenNav={() => setMobileNavOpen(true)}
        />
        <SessionBanner />

        <main
          className="main-content sentra-shell-scroll relative flex flex-1 flex-col overflow-y-auto"
          data-lenis-prevent
        >
          {children}
        </main>
      </div>
    </div>
  );
});
