"use client";

import type {
  ScenarioOverrides,
  SimulationActor,
  SimulationFaultType,
  SimulationLevel,
  SimulationPayload,
  SimulationScenario,
  SimulationStep,
} from "./types/scenario";

const spreadSpeedFactor: Record<SimulationLevel, number> = {
  low: 1.15,
  medium: 1,
  high: 0.78,
};

const crowdProgressModifier: Record<SimulationLevel, number> = {
  low: 8,
  medium: 0,
  high: -12,
};

function resolveFaultList(fault?: SimulationFaultType | SimulationFaultType[]) {
  if (!fault) {
    return [];
  }

  return Array.isArray(fault) ? fault : [fault];
}

function applySeverityEscalation(
  severity: "low" | "medium" | "high" | "critical",
  fireIntensity: ScenarioOverrides["fireIntensity"],
) {
  if (fireIntensity === "medium") {
    return severity;
  }

  const levels = ["low", "medium", "high", "critical"] as const;
  const currentIndex = levels.indexOf(severity);
  const offset = fireIntensity === "high" ? 1 : -1;
  const nextIndex = Math.min(levels.length - 1, Math.max(0, currentIndex + offset));

  return levels[nextIndex];
}

function describeFault(fault: SimulationFaultType) {
  switch (fault) {
    case "sensor_failure":
      return "Sensor confidence degraded";
    case "delayed_alert":
      return "Alert dispatch delayed";
    case "route_blocked":
      return "Primary route blocked";
    case "communication_failure":
      return "Fallback communications engaged";
    default:
      return "Simulation fault applied";
  }
}

function applyOverrides(step: SimulationStep, overrides: ScenarioOverrides): SimulationStep {
  const speedFactor = spreadSpeedFactor[overrides.spreadSpeed];
  const baseTime = step.time === 0 ? 0 : Number((step.time * speedFactor).toFixed(1));
  const delayTime =
    step.event === "prediction.updated" || step.event === "route.updated" || step.event.startsWith("alert.")
      ? overrides.delayTimeSec
      : 0;

  if (step.event === "incident.created" || step.event === "incident.update") {
    const payload = { ...step.payload } as {
      severity: "low" | "medium" | "high" | "critical";
      summary: string;
      recommendation?: string;
    };

    return {
      ...step,
      time: baseTime,
      payload: {
        ...payload,
        severity: applySeverityEscalation(payload.severity, overrides.fireIntensity),
        summary:
          overrides.fireIntensity === "high"
            ? `${payload.summary} Thermal intensity is accelerating.`
            : overrides.fireIntensity === "low"
              ? `${payload.summary} Hazard intensity remains comparatively contained.`
              : payload.summary,
      } as SimulationPayload,
    };
  }

  if (step.event === "prediction.updated") {
    const payload = { ...step.payload } as { summary: string; recommendation: string };

    return {
      ...step,
      time: Number((baseTime + delayTime).toFixed(1)),
      payload: {
        ...payload,
        summary:
          overrides.spreadSpeed === "high"
            ? `${payload.summary} Spread velocity is above baseline.`
            : overrides.spreadSpeed === "low"
              ? `${payload.summary} Spread velocity is below baseline.`
              : payload.summary,
      } as SimulationPayload,
    };
  }

  if (step.event === "route.updated") {
    const payload = { ...step.payload } as {
      progress_percent: number;
      route_health: "clear" | "watch" | "constrained" | "rerouting";
      active_alerts: number;
    };

    return {
      ...step,
      time: Number((baseTime + delayTime).toFixed(1)),
      payload: {
        ...payload,
        progress_percent: Math.max(
          0,
          Math.min(100, payload.progress_percent + crowdProgressModifier[overrides.crowdDensity]),
        ),
        route_health:
          overrides.crowdDensity === "high" && payload.route_health === "clear"
            ? "watch"
            : overrides.crowdDensity === "high" && payload.route_health === "watch"
              ? "constrained"
              : payload.route_health,
      } as SimulationPayload,
    };
  }

  if (step.event === "alert.triggered" || step.event === "alert.notification") {
    return {
      ...step,
      time: Number((baseTime + delayTime).toFixed(1)),
    };
  }

  return {
    ...step,
    time: baseTime,
  };
}

function applyFaults(step: SimulationStep, selectedFaults: SimulationFaultType[], faultsEnabled: boolean) {
  const eligibleFaults = resolveFaultList(step.fault).filter((fault) =>
    faultsEnabled ? selectedFaults.includes(fault) : false,
  );

  if (eligibleFaults.length === 0) {
    return {
      step,
      appliedFaults: [] as SimulationFaultType[],
    };
  }

  let nextStep = { ...step };

  eligibleFaults.forEach((fault) => {
    if (fault === "delayed_alert" && nextStep.event.startsWith("alert.")) {
      nextStep = {
        ...nextStep,
        time: Number((nextStep.time + 6).toFixed(1)),
        label: `${nextStep.label} - ${describeFault(fault)}`,
      };
      return;
    }

    if (fault === "route_blocked" && nextStep.event === "route.updated") {
      const payload = { ...nextStep.payload } as {
        progress_percent: number;
        route_health: "clear" | "watch" | "constrained" | "rerouting";
        active_alerts: number;
      };

      nextStep = {
        ...nextStep,
        label: `${nextStep.label} - ${describeFault(fault)}`,
        payload: {
          ...payload,
          progress_percent: Math.max(0, payload.progress_percent - 14),
          route_health: "rerouting",
          active_alerts: payload.active_alerts + 1,
        } as SimulationPayload,
      };
      return;
    }

    if (fault === "communication_failure" && nextStep.event.startsWith("alert.")) {
      const payload = { ...nextStep.payload } as {
        state: "idle" | "queued" | "active";
        title?: string;
      };

      nextStep = {
        ...nextStep,
        label: `${nextStep.label} - ${describeFault(fault)}`,
        payload: {
          ...payload,
          state: "queued",
          title: payload.title ? `${payload.title} (fallback routing)` : "Fallback routing active",
        } as SimulationPayload,
      };
      return;
    }

    if (
      fault === "sensor_failure" &&
      (nextStep.event === "incident.created" || nextStep.event === "prediction.updated")
    ) {
      const payload = { ...nextStep.payload } as {
        summary: string;
        recommendation?: string;
        confidence?: number;
      };

      nextStep = {
        ...nextStep,
        label: `${nextStep.label} - ${describeFault(fault)}`,
        payload: {
          ...payload,
          summary: `${payload.summary} Sensor telemetry is partially degraded.`,
          recommendation: payload.recommendation
            ? `${payload.recommendation} Validate against redundant sources.`
            : "Validate against redundant sources.",
          confidence:
            typeof payload.confidence === "number" ? Math.max(0.35, payload.confidence - 0.18) : undefined,
        } as SimulationPayload,
      };
    }
  });

  return {
    step: nextStep,
    appliedFaults: eligibleFaults,
  };
}

export function prepareActorsForScenario(actors: SimulationActor[], overrides: ScenarioOverrides) {
  const baseActors = actors.map((actor) => ({ ...actor }));

  if (overrides.crowdDensity === "medium") {
    return baseActors;
  }

  const supplementalCount = overrides.crowdDensity === "high" ? 4 : 2;

  return [
    ...baseActors,
    ...Array.from({ length: supplementalCount }, (_, index) => ({
      id: `support-${overrides.crowdDensity}-${index + 1}`,
      role: "staff" as const,
      status: overrides.crowdDensity === "high" ? "staging overflow response" : "monitoring overflow edges",
    })),
  ];
}

export function prepareScenarioRuntime(
  scenario: SimulationScenario,
  options: {
    overrides: ScenarioOverrides;
    selectedFaults: SimulationFaultType[];
    faultsEnabled: boolean;
  },
) {
  const preparedSteps = scenario.steps.map((step) => {
    const overriddenStep = applyOverrides(step, options.overrides);
    return applyFaults(overriddenStep, options.selectedFaults, options.faultsEnabled);
  });

  const maxStepTime = preparedSteps.reduce((maxTime, result) => Math.max(maxTime, result.step.time), 0);

  return {
    scenario: {
      ...scenario,
      duration: Math.max(scenario.duration, Number(maxStepTime.toFixed(1))),
      actors: prepareActorsForScenario(scenario.actors, options.overrides),
      steps: preparedSteps.map((result) => result.step).sort((left, right) => left.time - right.time),
    },
    faultMap: preparedSteps.map((result) => result.appliedFaults),
  };
}
