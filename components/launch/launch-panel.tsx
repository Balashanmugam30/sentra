import type { ReactNode } from "react";

export function LaunchPanel({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/55">{eyebrow}</p>}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        {subtitle && <p className="max-w-xl text-sm leading-6 text-white/50">{subtitle}</p>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
