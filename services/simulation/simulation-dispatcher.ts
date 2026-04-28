"use client";

import { captureError, captureEvent } from "@/lib/telemetry";
import { generateTraceId } from "@/lib/trace";
import type { SimulationScenario, SimulationStep } from "@/modules/simulation/types/scenario";
import { mapRealtimeEventToState } from "@/services/realtime/event-mapper";
import type { RealtimeEnvelope } from "@/services/realtime/types";
import { useIncidentStore } from "@/store/incident-store";
import { useUiStore } from "@/store/ui-store";

class SimulationDispatcher {
  dispatchScenarioStep(step: SimulationStep, scenario: SimulationScenario) {
    try {
      const faultLabel = Array.isArray(step.fault) ? step.fault.join(",") : step.fault ?? null;
      const message: RealtimeEnvelope = {
        type: step.event,
        message_id: `sim-${generateTraceId()}`,
        sent_at: new Date().toISOString(),
        tenant_id: "demo-tenant",
        building_id: "demo-building",
        payload: step.payload,
        metadata: {
          source: "simulation",
          simulation_phase: step.phase,
          simulation_label: step.label,
          timeline_time: step.time,
          scenario_id: scenario.id,
          fault: faultLabel,
        },
      };

      useUiStore.getState().setRealtimeConnection("simulated");
      mapRealtimeEventToState(message);
      captureEvent("Simulation step dispatched", {
        component: "SimulationDispatcher",
        metadata: {
          scenario_id: scenario.id,
          scenario_name: scenario.name,
          step_event: step.event,
          step_label: step.label,
          step_time: step.time,
        },
      });
    } catch (error) {
      captureError("Simulation event dispatch failed", error, {
        component: "SimulationDispatcher",
        metadata: {
          scenario_id: scenario.id,
          step_event: step.event,
          step_label: step.label,
        },
      });
      throw error;
    }
  }

  resetSimulationState() {
    useIncidentStore.getState().resetIncidentState();
    useUiStore.getState().resetRuntimeState();
  }
}

export const simulationDispatcher = new SimulationDispatcher();
