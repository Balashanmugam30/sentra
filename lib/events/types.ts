export type EventType = "INCIDENT_CREATED" | "INCIDENT_UPDATED" | "SIMULATION_TICK";

export type SystemEvent<T = unknown> = {
  id: string;
  type: EventType;
  source: "user" | "system" | "simulation";
  timestamp: number;
  payload: T;
};
