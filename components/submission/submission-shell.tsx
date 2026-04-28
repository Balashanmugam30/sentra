"use client";

import type { ReactNode } from "react";

const navItems = [
  { href: "/submission", label: "Command" },
  { href: "/submission/deck", label: "Deck" },
  { href: "/submission/judges", label: "Judges" },
  { href: "/submission/docs", label: "Docs" },
  { href: "/submission/impact", label: "Impact" },
  { href: "/submission/architecture", label: "Architecture" },
  { href: "/submission/demo-script", label: "Demo Script" },
  { href: "/submission/team", label: "Team" },
  { href: "/submission/score", label: "Score" },
] as const;

export function SubmissionShell({
  eyebrow,
  title,
  subtitle,
  loading,
  error,
  lastAction,
  onRefresh,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
  onRefresh: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_52%_100%,rgba(245,158,11,0.08),transparent_35%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[34px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/65">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/56">{subtitle}</p>
            </div>
            <button className="w-fit rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">
              {loading ? "Refreshing" : "Refresh submission"}
            </button>
          </div>
          <nav aria-label="Submission engine navigation" className="mt-6 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <a className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-200/60" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          {(error || lastAction) && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">
              {error ? `Resilient mode: ${error}` : lastAction}
            </div>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}
