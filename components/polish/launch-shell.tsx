"use client";

import type { ReactNode } from "react";

export function LaunchShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02030a] px-5 py-8 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_48%_100%,rgba(245,158,11,0.09),transparent_30%),linear-gradient(180deg,#02030a_0%,#050816_100%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[38px] border border-white/10 bg-white/[0.055] p-7 shadow-[0_26px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/65">{eyebrow}</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-[-0.055em] text-white md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-white/55">{subtitle}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

