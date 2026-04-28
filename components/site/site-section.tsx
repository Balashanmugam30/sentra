import type { ReactNode } from "react";

export function SiteSection({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/55">{eyebrow}</p>}
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{title}</h2>
        {subtitle && <p className="max-w-xl text-sm leading-6 text-white/52">{subtitle}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
