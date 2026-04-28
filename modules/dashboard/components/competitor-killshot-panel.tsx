"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import {
  CategoryActionButton,
  CategoryBar,
  CategoryPanelShell,
} from "@/modules/dashboard/components/category-panel-primitives";

export function CompetitorKillshotPanel() {
  const { busyAction, competitors, killshots, runCompetitiveAnalysis, winLoss } = useCategoryDomination();

  return (
    <CategoryPanelShell
      action={
        <CategoryActionButton busy={busyAction === "competitive-analysis"} onClick={() => void runCompetitiveAnalysis()}>
          {busyAction === "competitive-analysis" ? "Analyzing..." : "Run Competitive Analysis"}
        </CategoryActionButton>
      }
      description="Head-to-head competitive intelligence, rival weaknesses, win-loss proof, and replacement narratives."
      eyebrow="Competitor Killshot Panel"
      title={`${winLoss?.competitive_win_rate ?? 74}% competitive win rate against legacy command vendors`}
      tone="danger"
    >
      <div className="grid gap-3 lg:grid-cols-3">
        {killshots.map((killshot) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={killshot.theme}>
            <p className="text-base font-semibold text-white">{killshot.theme}</p>
            <p className="mt-3 text-sm leading-6 text-cyan-50/65">{killshot.sentra_advantage}</p>
            <p className="mt-3 text-sm leading-6 text-white/48">{killshot.competitor_gap}</p>
            <p className="mt-4 rounded-[18px] border border-amber-200/14 bg-amber-200/8 p-3 text-sm text-amber-50/76">
              {killshot.impact}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {competitors.map((competitor) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={competitor.competitor_id}>
            <p className="text-sm font-semibold text-white">{competitor.name}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">{competitor.weaknesses[0]}</p>
            <div className="mt-4">
              <CategoryBar label="Sentra win rate" value={competitor.sentra_win_rate} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

