import type { ReactNode } from "react";

const navItems = [
  { href: "/site", label: "Home" },
  { href: "/site/authority", label: "Authority" },
  { href: "/site/global", label: "Global" },
  { href: "/site/request-demo", label: "Request Demo" },
  { href: "/site/investors", label: "Investors" },
  { href: "/site/media", label: "Media" },
  { href: "/site/status", label: "Status" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sentra",
    description: "Autonomous crisis intelligence operating system for enterprise and public-sector resilience.",
    url: "https://sentra.example",
    sameAs: ["/site", "/site/investors", "/site/media"],
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.1),transparent_36%),linear-gradient(180deg,#02040a_0%,#030712_55%,#02040a_100%)]" />
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <a className="group flex items-center gap-3" href="/site" aria-label="Sentra public site home">
          <span className="grid size-10 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 text-sm font-black text-cyan-100 shadow-lg shadow-cyan-950/20">S</span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.32em] text-white">SENTRA</span>
            <span className="text-xs text-white/45">Crisis intelligence OS</span>
          </span>
        </a>
        <nav className="hidden flex-wrap justify-end gap-2 lg:flex" aria-label="Public site navigation">
          {navItems.map((item) => (
            <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62 transition hover:border-cyan-200/30 hover:bg-cyan-200/10 hover:text-white" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white" href="/site/request-demo">
          Request demo
        </a>
      </header>
      <div className="relative z-10">{children}</div>
    </main>
  );
}
