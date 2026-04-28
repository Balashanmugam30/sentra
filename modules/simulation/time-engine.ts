"use client";

import type { SimulationScenario } from "./types/scenario";

export function getUpcomingStep(scenario: SimulationScenario | null, timelinePosition: number) {
  if (!scenario) {
    return null;
  }

  return scenario.steps.find((step) => step.time > timelinePosition) ?? null;
}

export function getTimeToImpact(scenario: SimulationScenario | null, timelinePosition: number) {
  const nextStep = getUpcomingStep(scenario, timelinePosition);

  if (!nextStep) {
    return null;
  }

  return {
    label: nextStep.phase ?? nextStep.label,
    remainingSec: Math.max(0, Number((nextStep.time - timelinePosition).toFixed(1))),
  };
}

export function getEvacuationEta(scenario: SimulationScenario | null, timelinePosition: number) {
  if (!scenario) {
    return null;
  }

  return Math.max(0, Number((scenario.duration - timelinePosition).toFixed(1)));
}
