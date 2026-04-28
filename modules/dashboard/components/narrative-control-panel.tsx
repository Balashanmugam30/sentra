"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryActionButton, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function NarrativeControlPanel() {
  const { busyAction, generateBoardStory, narrative } = useCategoryDomination();

  return (
    <CategoryPanelShell
      action={
        <CategoryActionButton busy={busyAction === "board-story"} onClick={() => void generateBoardStory()}>
          {busyAction === "board-story" ? "Generating..." : "Generate Board Story"}
        </CategoryActionButton>
      }
      description="Strategic narrative control for why now, why Sentra, why replace legacy vendors, and why platform beats point solutions."
      eyebrow="Narrative Control Engine"
      title={narrative?.investor_headline ?? "The operating system for high-stakes civilization-scale decisions"}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {(narrative?.narratives ?? []).map((item) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={item.title}>
            <p className="text-base font-semibold text-white">{item.title}</p>
            <p className="mt-3 text-sm leading-6 text-cyan-50/68">{item.message}</p>
            <p className="mt-3 text-xs leading-5 text-white/45">{item.proof}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <CategoryMetricCard label="Board story" value={narrative?.board_story ?? "Category leadership narrative ready"} />
        <CategoryMetricCard label="Procurement headline" value={narrative?.procurement_headline ?? "One platform to predict, command, audit, and recover."} />
      </div>
    </CategoryPanelShell>
  );
}

