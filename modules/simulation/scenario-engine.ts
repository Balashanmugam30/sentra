import { prepareScenarioRuntime } from "./fault-engine";
import { buildStoryBeats } from "./story-mode";
import type { ScenarioOverrides, SimulationFaultType, SimulationScenario } from "./types/scenario";

export const simulationScenarios: SimulationScenario[] = [
  {
    id: "fire-floor-2",
    name: "Fire On Floor 2",
    description: "Smoke escalation on level 2 with progressive route rerouting and alert fan-out.",
    duration: 42,
    actors: [
      { id: "commander-1", role: "commander", status: "coordinating response" },
      { id: "staff-1", role: "staff", status: "monitoring west corridor" },
      { id: "staff-2", role: "staff", status: "guiding stairwell traffic" },
      { id: "responder-1", role: "responder", status: "moving to floor 2 west" },
    ],
    steps: [
      {
        time: 0,
        event: "incident.created",
        label: "Incident detected",
        phase: "Fire Detected",
        narrative: "Sentra identifies smoke in the west corridor and opens an incident immediately.",
        fault: "sensor_failure",
        payload: {
          incident_id: "demo-fire-floor-2",
          status: "investigating",
          severity: "medium",
          summary: "Smoke detected in the west corridor on floor 2.",
          recommendation: "Initiate verification and hold occupants in adjacent zones.",
        },
      },
      {
        time: 5,
        event: "prediction.updated",
        label: "AI risk forecast",
        phase: "AI Forecast Updated",
        narrative: "The prediction engine projects spread into the central lobby and prepares staged evacuation.",
        payload: {
          summary: "Thermal spread may reach the central lobby within six minutes.",
          recommendation: "Prepare staged evacuation for floor 2 west and central corridors.",
          confidence: 0.84,
        },
      },
      {
        time: 10,
        event: "route.updated",
        label: "Route staged",
        phase: "Route Optimization Active",
        narrative: "Routing opens the primary staircase and begins controlled movement away from the hot zone.",
        fault: "route_blocked",
        payload: {
          progress_percent: 18,
          route_health: "watch",
          active_alerts: 1,
        },
      },
      {
        time: 12,
        event: "alert.triggered",
        label: "Targeted alert sent",
        phase: "Evacuation Initiated",
        narrative: "Sentra stages localized instructions to move occupants before the corridor saturates.",
        fault: ["delayed_alert", "communication_failure"],
        payload: {
          alert_id: "demo-alert-fire-1",
          channel: "push",
          state: "queued",
          title: "Prepare to move",
        },
      },
      {
        time: 18,
        event: "incident.update",
        label: "Incident escalates",
        phase: "Emergency Escalation",
        narrative: "Smoke density increases and the operator surface shifts from monitoring to active evacuation.",
        payload: {
          incident_id: "demo-fire-floor-2",
          status: "evacuation_in_progress",
          severity: "high",
          summary: "Smoke density is increasing near the central corridor.",
          recommendation: "Evacuate floor 2 via Stair A. Hold lower levels in monitoring mode.",
        },
      },
      {
        time: 22,
        event: "alert.notification",
        label: "Alert active",
        phase: "Evacuation Initiated",
        narrative: "Public address and push channels are now broadcasting floor-specific evacuation guidance.",
        fault: "communication_failure",
        payload: {
          alert_id: "demo-alert-fire-1",
          channel: "pa",
          state: "active",
          title: "Evacuate floor 2 via Stair A",
        },
      },
      {
        time: 28,
        event: "route.updated",
        label: "Route rerouted",
        phase: "Route Optimization Active",
        narrative: "Routing recalibrates to preserve stair capacity and keep responder access clear.",
        fault: "route_blocked",
        payload: {
          progress_percent: 54,
          route_health: "rerouting",
          active_alerts: 2,
        },
      },
      {
        time: 36,
        event: "prediction.updated",
        label: "Stabilization detected",
        phase: "Containment Improving",
        narrative: "Containment actions begin to reduce spread risk and narrow the active evacuation footprint.",
        payload: {
          summary: "HVAC isolation is slowing spread and lowering risk to unaffected zones.",
          recommendation: "Maintain evacuation from impacted floor and preserve lobby circulation lanes.",
          confidence: 0.91,
        },
      },
      {
        time: 42,
        event: "route.updated",
        label: "Evacuation nearing completion",
        phase: "Recovery Approaching",
        narrative: "The final occupant groups are moving through cleared routes and the system approaches stabilization.",
        payload: {
          progress_percent: 92,
          route_health: "clear",
          active_alerts: 1,
        },
      },
    ],
  },
  {
    id: "crowd-surge-atrium",
    name: "Crowd Surge In Atrium",
    description: "A dense crowd movement event with controlled routing and occupancy stabilization.",
    duration: 36,
    actors: [
      { id: "commander-2", role: "commander", status: "overseeing atrium flow control" },
      { id: "staff-3", role: "staff", status: "holding upstream queue" },
      { id: "staff-4", role: "staff", status: "managing west concourse diversion" },
      { id: "responder-2", role: "responder", status: "standing by at mezzanine entry" },
    ],
    steps: [
      {
        time: 0,
        event: "incident.created",
        label: "Density spike detected",
        phase: "Crowd Surge Detected",
        narrative: "Sentra detects compression in the atrium and opens a controlled crowd-management incident.",
        payload: {
          incident_id: "demo-crowd-atrium",
          status: "monitoring",
          severity: "low",
          summary: "Crowd density threshold crossed in the central atrium.",
          recommendation: "Monitor pressure points and prepare directional messaging.",
        },
      },
      {
        time: 4,
        event: "prediction.updated",
        label: "Flow forecast updated",
        phase: "AI Forecast Updated",
        narrative: "The system forecasts escalator saturation and prepares flow diversion before the choke point peaks.",
        payload: {
          summary: "North mezzanine escalator is likely to saturate within two minutes.",
          recommendation: "Divert east-bound flow to the west concourse and open alternate access.",
          confidence: 0.77,
        },
      },
      {
        time: 8,
        event: "route.updated",
        label: "Flow controls activated",
        phase: "Route Optimization Active",
        narrative: "Directional flow controls are activated to reduce atrium compression and protect access paths.",
        fault: "route_blocked",
        payload: {
          progress_percent: 22,
          route_health: "constrained",
          active_alerts: 1,
        },
      },
      {
        time: 10,
        event: "alert.notification",
        label: "Directional alert active",
        phase: "Directional Messaging",
        narrative: "Signage and public messaging begin redirecting guests to the safer west concourse.",
        fault: ["delayed_alert", "communication_failure"],
        payload: {
          alert_id: "demo-crowd-alert-1",
          channel: "signage",
          state: "active",
          title: "Proceed via west concourse",
        },
      },
      {
        time: 18,
        event: "incident.update",
        label: "Operational alert",
        phase: "Flow Control Active",
        narrative: "The crowd event is now operationally active and floor teams are holding upstream movement.",
        payload: {
          incident_id: "demo-crowd-atrium",
          status: "flow_control_active",
          severity: "medium",
          summary: "Crowd compression remains elevated near the north mezzanine entry.",
          recommendation: "Sustain directional controls and hold incoming flow at upstream checkpoints.",
        },
      },
      {
        time: 27,
        event: "prediction.updated",
        label: "Flow stabilizing",
        phase: "Stabilization Detected",
        narrative: "Predictive models show that density is beginning to normalize with the current diversion plan.",
        payload: {
          summary: "Density should normalize if current flow diversion is maintained.",
          recommendation: "Keep signage active until atrium density returns below target.",
          confidence: 0.88,
        },
      },
      {
        time: 36,
        event: "route.updated",
        label: "Recovery",
        phase: "Recovery Approaching",
        narrative: "The atrium is returning to safe operating density and temporary controls can stand down soon.",
        payload: {
          progress_percent: 100,
          route_health: "clear",
          active_alerts: 0,
        },
      },
    ],
  },
  {
    id: "compound-terminal-crisis",
    name: "Compound Terminal Crisis",
    description: "Fire, crowd surge, and alert coordination occur concurrently to stress orchestration.",
    duration: 50,
    actors: [
      { id: "commander-3", role: "commander", status: "coordinating compound response" },
      { id: "staff-5", role: "staff", status: "routing retail spine evacuees" },
      { id: "staff-6", role: "staff", status: "protecting responder lane" },
      { id: "responder-3", role: "responder", status: "moving through west access lane" },
      { id: "responder-4", role: "responder", status: "staging at Gate 14" },
      { id: "guest-1", role: "guest", status: "following wayfinding instructions" },
    ],
    steps: [
      {
        time: 0,
        event: "incident.created",
        label: "Compound incident opened",
        phase: "Fire Detected",
        narrative: "Sentra correlates smoke and crowd turbulence into a single compound terminal incident.",
        fault: "sensor_failure",
        payload: {
          incident_id: "demo-compound-terminal",
          status: "investigating",
          severity: "high",
          summary: "Smoke and crowd turbulence detected near Terminal B retail spine.",
          recommendation: "Initiate dual-track evacuation and flow control planning.",
        },
      },
      {
        time: 0,
        event: "alert.triggered",
        label: "Initial alert staged",
        phase: "Evacuation Initiated",
        narrative: "The communications engine begins staging a rapid first alert while predictions are still updating.",
        fault: "delayed_alert",
        payload: {
          alert_id: "demo-compound-alert-1",
          channel: "push",
          state: "queued",
          title: "Stand by for instructions",
        },
      },
      {
        time: 6,
        event: "prediction.updated",
        label: "Hazard and crowd forecast",
        phase: "AI Forecast Updated",
        narrative: "The AI layer forecasts both smoke spread and crowd compression around Gate 14.",
        payload: {
          summary: "Smoke may reduce corridor visibility while crowd compression builds near Gate 14.",
          recommendation: "Move Gate 14 occupants first and hold inbound passengers at upstream checkpoints.",
          confidence: 0.89,
        },
      },
      {
        time: 10,
        event: "route.updated",
        label: "Primary route load increases",
        phase: "Route Optimization Active",
        narrative: "Routing allocates a primary evacuation lane while preserving a separate responder corridor.",
        fault: "route_blocked",
        payload: {
          progress_percent: 16,
          route_health: "constrained",
          active_alerts: 2,
        },
      },
      {
        time: 10,
        event: "alert.notification",
        label: "Multi-channel alert active",
        phase: "Evacuation Initiated",
        narrative: "Push, PA, and signage align around a shared instruction set for passengers and staff.",
        fault: "communication_failure",
        payload: {
          alert_id: "demo-compound-alert-1",
          channel: "pa",
          state: "active",
          title: "Gate 14 and retail spine evacuate now",
        },
      },
      {
        time: 18,
        event: "incident.update",
        label: "Emergency declared",
        phase: "Emergency Escalation",
        narrative: "The terminal transitions to an emergency response posture with dedicated responder access.",
        payload: {
          incident_id: "demo-compound-terminal",
          status: "emergency_response_active",
          severity: "critical",
          summary: "Crowd turbulence and smoke spread now require emergency routing and responder access lanes.",
          recommendation: "Lock secondary retail access, route evacuees east, reserve west lane for responders.",
        },
      },
      {
        time: 24,
        event: "route.updated",
        label: "Responder lane reserved",
        phase: "Route Optimization Active",
        narrative: "The decision engine reserves the west lane for emergency ingress and reroutes public traffic east.",
        fault: "route_blocked",
        payload: {
          progress_percent: 44,
          route_health: "rerouting",
          active_alerts: 3,
        },
      },
      {
        time: 30,
        event: "prediction.updated",
        label: "Crowd dispersal improving",
        phase: "Containment Improving",
        narrative: "Passenger flow begins to normalize as the reroute and alert strategy take effect.",
        payload: {
          summary: "Occupant flow is redistributing successfully, but the retail spine remains a hot zone.",
          recommendation: "Continue eastward routing and keep responders isolated from the public corridor.",
          confidence: 0.93,
        },
      },
      {
        time: 40,
        event: "alert.notification",
        label: "Final guidance update",
        phase: "Final Guidance",
        narrative: "Late-stage signage reinforces the final assembly route to keep evacuees moving calmly.",
        fault: ["delayed_alert", "communication_failure"],
        payload: {
          alert_id: "demo-compound-alert-2",
          channel: "signage",
          state: "active",
          title: "Continue east to Assembly Point Delta",
        },
      },
      {
        time: 50,
        event: "route.updated",
        label: "Terminal flow stabilized",
        phase: "Recovery Approaching",
        narrative: "The terminal has stabilized and the command surface is moving back toward monitoring mode.",
        payload: {
          progress_percent: 96,
          route_health: "watch",
          active_alerts: 1,
        },
      },
    ],
  },
];

export function getScenarioById(scenarioId: string) {
  return simulationScenarios.find((scenario) => scenario.id === scenarioId) ?? null;
}

export function getDefaultScenario() {
  return simulationScenarios[0];
}

export function prepareScenarioForRun(
  scenario: SimulationScenario,
  options: {
    overrides: ScenarioOverrides;
    selectedFaults: SimulationFaultType[];
    faultsEnabled: boolean;
  },
) {
  const prepared = prepareScenarioRuntime(scenario, options);

  return {
    ...prepared,
    scenario: {
      ...prepared.scenario,
      storyBeats: buildStoryBeats(prepared.scenario),
    },
  };
}
