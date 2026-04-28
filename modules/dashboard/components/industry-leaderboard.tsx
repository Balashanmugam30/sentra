"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function IndustryLeaderboard() {
  const { leaderboard, sentraRank } = useCategoryDomination();

  return (
    <CategoryPanelShell
      description="Investor-grade industry leaderboard ranking category score, growth, trust, and AI depth."
      eyebrow="Industry Leaderboard"
      title={`Sentra ranked #${sentraRank || 1} in command intelligence`}
      tone="gold"
    >
      <div className="space-y-3">
        {leaderboard.map((row) => (
          <div
            className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[70px_1fr_1fr_1fr_1fr]"
            key={row.company}
          >
            <div className="text-2xl font-semibold text-white">#{row.rank}</div>
            <div>
              <p className="text-sm font-semibold text-white">{row.company}</p>
              <p className="mt-1 text-xs text-cyan-50/50">{row.label}</p>
            </div>
            <CategoryBar label="Category" value={row.category_score} />
            <CategoryBar label="Trust" value={row.trust} />
            <CategoryBar label="AI depth" value={row.ai_depth} />
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

