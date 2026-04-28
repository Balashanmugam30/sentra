"use client";

import { captureError, captureEvent } from "@/lib/telemetry";
import {
  getDefaultScenario,
  getScenarioById,
  prepareScenarioForRun,
} from "@/modules/simulation/scenario-engine";
import { resolveAutoStoryBeatIndex } from "@/modules/simulation/story-mode";
import type {
  SimulationOutcome,
  SimulationRunSummary,
  SimulationScenario,
  SimulationSpeed,
} from "@/modules/simulation/types/scenario";
import { simulationDispatcher } from "@/services/simulation/simulation-dispatcher";
import { useDemoStore } from "@/store/demo-store";

class TimelineEngine {
  private activeScenario: SimulationScenario | null = null;
  private rafId: number | null = null;
  private startedAt: number | null = null;
  private pausedElapsed = 0;
  private nextStepIndex = 0;
  private speed: SimulationSpeed = 1;

  startScenario(baseScenario: SimulationScenario, speed: SimulationSpeed = useDemoStore.getState().speed) {
    this.stopScenario({ preserveReplay: true, suppressTelemetry: true });

    const { overrides, selectedFaults, faultsEnabled } = useDemoStore.getState();
    const prepared = prepareScenarioForRun(baseScenario, {
      overrides,
      selectedFaults,
      faultsEnabled,
    });

    this.activeScenario = prepared.scenario;
    this.startedAt = null;
    this.pausedElapsed = 0;
    this.nextStepIndex = 0;
    this.speed = speed;

    simulationDispatcher.resetSimulationState();
    useDemoStore.getState().startScenario(prepared.scenario, speed);
    useDemoStore.getState().setActiveActors(prepared.scenario.actors);
    useDemoStore.getState().setTimelinePosition(0);
    useDemoStore.getState().setCurrentPhase(null, null);
    useDemoStore.getState().resetStoryBeat();
    captureEvent("Simulation started", {
      component: "TimelineEngine",
      metadata: {
        scenario_id: prepared.scenario.id,
        speed,
        faults_enabled: faultsEnabled,
        selected_faults: selectedFaults,
        overrides,
      },
    });

    this.rafId = window.requestAnimationFrame(this.tick);
  }

  pauseScenario() {
    if (!this.activeScenario || useDemoStore.getState().simulationStatus !== "running") {
      return;
    }

    this.pausedElapsed = this.getElapsedSeconds();
    this.cancelFrame();
    useDemoStore.getState().pauseScenario();
    captureEvent("Simulation paused", {
      component: "TimelineEngine",
      metadata: {
        scenario_id: this.activeScenario.id,
        timeline_position: this.pausedElapsed,
      },
    });
  }

  resumeScenario() {
    if (!this.activeScenario || useDemoStore.getState().simulationStatus !== "paused") {
      return;
    }

    this.startedAt = null;
    useDemoStore.getState().resumeScenario();
    captureEvent("Simulation resumed", {
      component: "TimelineEngine",
      metadata: {
        scenario_id: this.activeScenario.id,
        timeline_position: this.pausedElapsed,
      },
    });
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  stopScenario(options?: { preserveReplay?: boolean; suppressTelemetry?: boolean }) {
    this.cancelFrame();
    this.activeScenario = null;
    this.startedAt = null;
    this.pausedElapsed = 0;
    this.nextStepIndex = 0;

    simulationDispatcher.resetSimulationState();
    useDemoStore.getState().stopScenario({
      preserveReplay: options?.preserveReplay ?? true,
    });

    if (!options?.suppressTelemetry) {
      captureEvent("Simulation stopped", {
        component: "TimelineEngine",
        metadata: {
          scenario_id: useDemoStore.getState().lastScenario?.id ?? null,
        },
      });
    }
  }

  replayLastScenario() {
    const replayScenario = useDemoStore.getState().replayLastScenario() ?? getDefaultScenario();

    if (!replayScenario) {
      return;
    }

    this.startScenario(replayScenario, useDemoStore.getState().speed);
  }

  setSpeed(speed: SimulationSpeed) {
    this.speed = speed;
    useDemoStore.getState().setSpeed(speed);
    captureEvent("Simulation speed changed", {
      component: "TimelineEngine",
      metadata: {
        speed,
        scenario_id: this.activeScenario?.id ?? null,
      },
    });
  }

  startScenarioById(scenarioId: string) {
    const scenario = getScenarioById(scenarioId) ?? getDefaultScenario();
    if (!scenario) {
      return;
    }

    this.startScenario(scenario, useDemoStore.getState().speed);
  }

  private readonly tick = (timestamp: number) => {
    const scenario = this.activeScenario;

    if (!scenario) {
      return;
    }

    if (this.startedAt === null) {
      this.startedAt = timestamp;
    }

    try {
      const elapsedSeconds = this.getElapsedSeconds(timestamp);
      const store = useDemoStore.getState();

      store.setTimelinePosition(elapsedSeconds);

      if (store.storyModeEnabled && store.storyAutoAdvance) {
        store.setStoryBeatIndex(resolveAutoStoryBeatIndex(scenario, elapsedSeconds));
      }

      while (this.nextStepIndex < scenario.steps.length) {
        const nextStep = scenario.steps[this.nextStepIndex];

        if (!nextStep || elapsedSeconds < nextStep.time) {
          break;
        }

        simulationDispatcher.dispatchScenarioStep(nextStep, scenario);
        this.nextStepIndex += 1;
      }

      if (elapsedSeconds >= scenario.duration && this.nextStepIndex >= scenario.steps.length) {
        const summary = this.buildRunSummary(scenario, "success", scenario.duration);
        useDemoStore.getState().completeScenario(summary);
        captureEvent("Simulation completed", {
          component: "TimelineEngine",
          metadata: {
            scenario_id: scenario.id,
            duration: scenario.duration,
            time_to_impact_accuracy_sec: Number(Math.abs(summary.totalEvacuationTimeSec - scenario.duration).toFixed(1)),
            summary,
          },
        });
        this.cancelFrame();
        this.activeScenario = null;
        this.startedAt = null;
        this.pausedElapsed = 0;
        this.nextStepIndex = 0;
        return;
      }

      this.rafId = window.requestAnimationFrame(this.tick);
    } catch (error) {
      captureError("Simulation timeline failed", error, {
        component: "TimelineEngine",
        metadata: {
          scenario_id: scenario.id,
          step_index: this.nextStepIndex,
        },
      });
      useDemoStore.getState().completeScenario(this.buildRunSummary(scenario, "failure", useDemoStore.getState().timelinePosition));
      this.stopScenario({ preserveReplay: true, suppressTelemetry: true });
    }
  };

  private buildRunSummary(
    scenario: SimulationScenario,
    outcome: SimulationOutcome,
    totalEvacuationTimeSec: number,
  ): SimulationRunSummary {
    const store = useDemoStore.getState();
    const latencyMs =
      store.firstIncidentTimeline !== null && store.firstResponseTimeline !== null
        ? Math.max(0, Math.round((store.firstResponseTimeline - store.firstIncidentTimeline) * 1000))
        : null;

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      totalEvacuationTimeSec: Number(totalEvacuationTimeSec.toFixed(1)),
      alertsTriggered: store.alertsTriggered,
      systemResponseLatencyMs: latencyMs,
      outcome,
      faultCount: store.faultsEnabled ? store.selectedFaults.length : 0,
      actorCount: store.activeActors.length,
      completedAt: new Date().toISOString(),
    };
  }

  private getElapsedSeconds(timestamp = performance.now()) {
    if (this.startedAt === null) {
      return this.pausedElapsed;
    }

    const elapsed = (timestamp - this.startedAt) / 1000;
    return Math.min(this.activeScenario?.duration ?? elapsed, this.pausedElapsed + elapsed * this.speed);
  }

  private cancelFrame() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const timelineEngine = new TimelineEngine();
