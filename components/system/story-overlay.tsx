"use client";

import { memo } from "react";

import { Badge, Card } from "@/components/ui";
import { getStoryBeatAtIndex, resolveAutoStoryBeatIndex } from "@/modules/simulation/story-mode";
import { useDemoStore } from "@/store/demo-store";

export const StoryOverlay = memo(function StoryOverlay() {
  const activeScenario = useDemoStore((state) => state.activeScenario);
  const storyModeEnabled = useDemoStore((state) => state.storyModeEnabled);
  const storyAutoAdvance = useDemoStore((state) => state.storyAutoAdvance);
  const storyBeatIndex = useDemoStore((state) => state.storyBeatIndex);
  const timelinePosition = useDemoStore((state) => state.timelinePosition);
  const setStoryModeEnabled = useDemoStore((state) => state.setStoryModeEnabled);
  const nextStoryBeat = useDemoStore((state) => state.nextStoryBeat);

  if (!storyModeEnabled || !activeScenario) {
    return null;
  }

  const beat = getStoryBeatAtIndex(
    activeScenario,
    storyAutoAdvance ? resolveAutoStoryBeatIndex(activeScenario, timelinePosition) : storyBeatIndex,
  );

  if (!beat) {
    return null;
  }

  return (
    <Card className="w-[min(26rem,calc(100vw-2rem))] border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_95%,transparent)] p-4 backdrop-blur-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">Story Mode</p>
            <p className="text-sm font-semibold text-foreground">{beat.title}</p>
          </div>
          <Badge tone={storyAutoAdvance ? "primary" : "warning"}>
            {storyAutoAdvance ? "Auto" : "Manual"}
          </Badge>
        </div>

        <p className="text-sm leading-6 text-muted">{beat.description}</p>

        <div className="flex flex-wrap gap-2">
          {!storyAutoAdvance ? (
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-foreground transition hover:bg-[var(--color-surface-strong)] focus:outline-none focus:ring-2 focus:ring-brand"
              onClick={() => nextStoryBeat()}
              type="button"
            >
              Next step
            </button>
          ) : null}
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-foreground transition hover:bg-[var(--color-surface-strong)] focus:outline-none focus:ring-2 focus:ring-brand"
            onClick={() => setStoryModeEnabled(false)}
            type="button"
          >
            Hide guide
          </button>
        </div>
      </div>
    </Card>
  );
});
