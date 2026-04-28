import { create } from "zustand";

import type {
  EventTraceEntry,
  ScenarioOverrides,
  SimulationActor,
  SimulationFaultType,
  SimulationOutcome,
  SimulationRunSummary,
  SimulationScenario,
  SimulationSpeed,
  SimulationStatus,
} from "@/modules/simulation/types/scenario";

const defaultOverrides: ScenarioOverrides = {
  fireIntensity: "medium",
  delayTimeSec: 0,
  crowdDensity: "medium",
  spreadSpeed: "medium",
};

interface DemoState {
  isDemoMode: boolean;
  activeScenario: SimulationScenario | null;
  lastScenario: SimulationScenario | null;
  simulationStatus: SimulationStatus;
  timelinePosition: number;
  timelineDuration: number;
  speed: SimulationSpeed;
  currentPhase: string | null;
  currentStepLabel: string | null;
  eventTrace: EventTraceEntry[];
  activeActors: SimulationActor[];
  faultsEnabled: boolean;
  selectedFaults: SimulationFaultType[];
  overrides: ScenarioOverrides;
  storyModeEnabled: boolean;
  storyAutoAdvance: boolean;
  storyBeatIndex: number;
  lastSummary: SimulationRunSummary | null;
  alertsTriggered: number;
  firstIncidentTimeline: number | null;
  firstResponseTimeline: number | null;
  startScenario: (scenario: SimulationScenario, speed?: SimulationSpeed) => void;
  pauseScenario: () => void;
  resumeScenario: () => void;
  stopScenario: (options?: { preserveReplay?: boolean }) => void;
  completeScenario: (summary: SimulationRunSummary) => void;
  replayLastScenario: () => SimulationScenario | null;
  setTimelinePosition: (value: number) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  setCurrentPhase: (phase: string | null, stepLabel?: string | null) => void;
  appendTrace: (entry: EventTraceEntry) => void;
  setActiveActors: (actors: SimulationActor[]) => void;
  setFaultsEnabled: (value: boolean) => void;
  toggleFaultSelection: (fault: SimulationFaultType) => void;
  setOverride: <TKey extends keyof ScenarioOverrides>(key: TKey, value: ScenarioOverrides[TKey]) => void;
  setStoryModeEnabled: (value: boolean) => void;
  setStoryAutoAdvance: (value: boolean) => void;
  nextStoryBeat: () => void;
  resetStoryBeat: () => void;
  setStoryBeatIndex: (value: number) => void;
  clearSummary: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isDemoMode: false,
  activeScenario: null,
  lastScenario: null,
  simulationStatus: "idle",
  timelinePosition: 0,
  timelineDuration: 0,
  speed: 1,
  currentPhase: null,
  currentStepLabel: null,
  eventTrace: [],
  activeActors: [],
  faultsEnabled: false,
  selectedFaults: [],
  overrides: defaultOverrides,
  storyModeEnabled: true,
  storyAutoAdvance: true,
  storyBeatIndex: 0,
  lastSummary: null,
  alertsTriggered: 0,
  firstIncidentTimeline: null,
  firstResponseTimeline: null,
  startScenario: (scenario, speed = get().speed) =>
    set({
      isDemoMode: true,
      activeScenario: scenario,
      lastScenario: scenario,
      simulationStatus: "running",
      timelinePosition: 0,
      timelineDuration: scenario.duration,
      speed,
      currentPhase: null,
      currentStepLabel: null,
      eventTrace: [],
      activeActors: scenario.actors,
      storyBeatIndex: 0,
      lastSummary: null,
      alertsTriggered: 0,
      firstIncidentTimeline: null,
      firstResponseTimeline: null,
    }),
  pauseScenario: () =>
    set((state) =>
      state.activeScenario
        ? {
            simulationStatus: "paused",
          }
        : state,
    ),
  resumeScenario: () =>
    set((state) =>
      state.activeScenario
        ? {
            simulationStatus: "running",
          }
        : state,
    ),
  stopScenario: (options) =>
    set((state) => ({
      isDemoMode: false,
      activeScenario: null,
      lastScenario: options?.preserveReplay === false ? null : state.lastScenario,
      simulationStatus: "idle",
      timelinePosition: 0,
      timelineDuration: 0,
      currentPhase: null,
      currentStepLabel: null,
      eventTrace: [],
      activeActors: [],
      storyBeatIndex: 0,
      alertsTriggered: 0,
      firstIncidentTimeline: null,
      firstResponseTimeline: null,
    })),
  completeScenario: (summary) =>
    set((state) => ({
      isDemoMode: true,
      activeScenario: state.activeScenario,
      lastScenario: state.activeScenario ?? state.lastScenario,
      simulationStatus: "completed",
      timelinePosition: state.timelineDuration,
      lastSummary: summary,
    })),
  replayLastScenario: () => get().lastScenario,
  setTimelinePosition: (timelinePosition) =>
    set((state) => ({
      timelinePosition: Math.min(Math.max(timelinePosition, 0), state.timelineDuration || timelinePosition),
    })),
  setSpeed: (speed) =>
    set({
      speed,
    }),
  setCurrentPhase: (currentPhase, currentStepLabel = null) =>
    set({
      currentPhase,
      currentStepLabel,
    }),
  appendTrace: (entry) =>
    set((state) => {
      const isAlert = entry.type === "alert.triggered" || entry.type === "alert.notification";
      const isResponse =
        entry.type === "prediction.updated" || entry.type === "route.updated" || isAlert;

      return {
        eventTrace: [...state.eventTrace.slice(-79), entry],
        alertsTriggered: isAlert ? state.alertsTriggered + 1 : state.alertsTriggered,
        firstIncidentTimeline:
          state.firstIncidentTimeline === null && entry.type === "incident.created"
            ? entry.timelineTime ?? 0
            : state.firstIncidentTimeline,
        firstResponseTimeline:
          state.firstResponseTimeline === null && isResponse && entry.timelineTime !== undefined
            ? entry.timelineTime
            : state.firstResponseTimeline,
      };
    }),
  setActiveActors: (activeActors) =>
    set({
      activeActors,
    }),
  setFaultsEnabled: (faultsEnabled) =>
    set({
      faultsEnabled,
    }),
  toggleFaultSelection: (fault) =>
    set((state) => ({
      selectedFaults: state.selectedFaults.includes(fault)
        ? state.selectedFaults.filter((item) => item !== fault)
        : [...state.selectedFaults, fault],
    })),
  setOverride: (key, value) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [key]: value,
      },
    })),
  setStoryModeEnabled: (storyModeEnabled) =>
    set({
      storyModeEnabled,
    }),
  setStoryAutoAdvance: (storyAutoAdvance) =>
    set({
      storyAutoAdvance,
    }),
  nextStoryBeat: () =>
    set((state) => ({
      storyBeatIndex: state.storyBeatIndex + 1,
    })),
  resetStoryBeat: () =>
    set({
      storyBeatIndex: 0,
    }),
  setStoryBeatIndex: (storyBeatIndex) =>
    set({
      storyBeatIndex,
    }),
  clearSummary: () =>
    set({
      lastSummary: null,
    }),
}));
