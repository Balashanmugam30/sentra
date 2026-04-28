import type { SiteAuthority } from "@/lib/site/types";

export function AuthorityMeters({ authority }: { authority: SiteAuthority }) {
  const meters = [
    ["Market leadership", authority.market_leadership_score],
    ["Innovation", authority.innovation_score],
    ["Trust readiness", authority.trust_readiness],
    ["Product depth", authority.product_depth],
    ["ROI proof", authority.roi_proof],
  ] as const;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[32px] border border-cyan-200/15 bg-cyan-200/[0.055] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Category rank</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">{authority.category_rank}</h2>
        <p className="mt-6 font-mono text-6xl text-cyan-100">{authority.market_leadership_score}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {meters.map(([label, value]) => (
          <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5" key={label}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="font-mono text-cyan-100">{value}/100</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-emerald-200" style={{ width: `${value}%` }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
