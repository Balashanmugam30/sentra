import type {
  AlertRealtimePayload,
  IncidentRealtimePayload,
  PredictionRealtimePayload,
  RealtimeEventType,
  RouteRealtimePayload,
} from "@/services/realtime/types";

export type SimulationStatus = "idle" | "running" | "paused" | "completed";
export type SimulationSpeed = 1 | 2 | 5;
export type SimulationLevel = "low" | "medium" | "high";
export type SimulationFaultType =
  | "sensor_failure"
  | "delayed_alert"
  | "route_blocked"
  | "communication_failure";
export type SimulationOutcome = "success" | "failure" | "interrupted";

export type SimulationPayload =
  | IncidentRealtimePayload
  | PredictionRealtimePayload
  | RouteRealtimePayload
  | AlertRealtimePayload
  | Record<string, never>;

export interface ScenarioOverrides {
  fireIntensity: SimulationLevel;
  delayTimeSec: number;
  crowdDensity: SimulationLevel;
  spreadSpeed: SimulationLevel;
}

export interface SimulationActor {
  id: string;
  role: "staff" | "responder" | "commander" | "guest";
  status: string;
}

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  triggerTime: number;
}

export interface SimulationStep {
  time: number;
  event: RealtimeEventType;
  label: string;
  phase?: string;
  narrative?: string;
  payload: SimulationPayload;
  fault?: SimulationFaultType | SimulationFaultType[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number;
  actors: SimulationActor[];
  steps: SimulationStep[];
  storyBeats?: StoryBeat[];
}

export interface EventTraceEntry {
  id: string;
  timestamp: string;
  timelineTime?: number;
  type: RealtimeEventType;
  label: string;
  source: "realtime" | "simulation";
  phase?: string | null;
  fault?: SimulationFaultType | null;
}

export interface SimulationRunSummary {
  scenarioId: string;
  scenarioName: string;
  totalEvacuationTimeSec: number;
  alertsTriggered: number;
  systemResponseLatencyMs: number | null;
  outcome: SimulationOutcome;
  faultCount: number;
  actorCount: number;
  completedAt: string;
}
