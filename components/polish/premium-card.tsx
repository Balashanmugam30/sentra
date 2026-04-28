"use client";

import type { ReactNode } from "react";

export function PremiumCard({ title, eyebrow, children, accent = "cyan" }: { title: string; eyebrow?: string; children: ReactNode; accent?: "cyan" | "emerald" | "amber" | "rose" }) {
  const accentClass = {
    cyan: "from-cyan-300/14",
    emerald: "from-emerald-300/14",
    amber: "from-amber-300/14",
    rose: "from-rose-300/14",
  }[accent];

  return (
    <section className={`rounded-[30px] border border-white/10 bg-gradient-to-br ${accentClass} to-white/[0.04] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/18`}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

