"use client";

import type { SimulationScenario, StoryBeat } from "./types/scenario";

export function buildStoryBeats(scenario: SimulationScenario): StoryBeat[] {
  if (scenario.storyBeats?.length) {
    return scenario.storyBeats;
  }

  const seen = new Set<string>();

  return scenario.steps
    .filter((step) => step.phase || step.narrative)
    .map((step, index) => ({
      id: `${scenario.id}-beat-${index}`,
      title: step.phase ?? step.label,
      description: step.narrative ?? step.label,
      triggerTime: step.time,
    }))
    .filter((beat) => {
      const key = `${beat.title}:${beat.triggerTime}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function resolveAutoStoryBeatIndex(scenario: SimulationScenario, timelinePosition: number) {
  const beats = buildStoryBeats(scenario);
  if (beats.length === 0) {
    return 0;
  }

  let activeIndex = 0;

  beats.forEach((beat, index) => {
    if (timelinePosition >= beat.triggerTime) {
      activeIndex = index;
    }
  });

  return activeIndex;
}

export function getStoryBeatAtIndex(scenario: SimulationScenario, index: number) {
  const beats = buildStoryBeats(scenario);
  if (beats.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(index, 0), beats.length - 1);
  return beats[safeIndex] ?? null;
}
