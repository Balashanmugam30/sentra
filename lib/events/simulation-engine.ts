import { emitEvent } from "./event-bus";

declare global {
  interface Window {
    __SENTRA_SIM_INTERVAL__?: number | null;
  }
}

export function startSimulation() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__SENTRA_SIM_INTERVAL__) {
    return;
  }

  window.__SENTRA_SIM_INTERVAL__ = window.setInterval(() => {
    const traceId = crypto.randomUUID();

    console.info(`[SIM] tick trace_id=${traceId}`);

    emitEvent({
      id: crypto.randomUUID(),
      type: "INCIDENT_CREATED",
      source: "simulation",
      timestamp: Date.now(),
      payload: {
        trace_id: traceId,
        type: "simulated",
        severity: Math.ceil(Math.random() * 3),
        location: `Zone ${Math.ceil(Math.random() * 5)}`,
      },
    });
  }, 5000);

  console.info("[SIM] Started");
}

export function stopSimulation() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__SENTRA_SIM_INTERVAL__) {
    window.clearInterval(window.__SENTRA_SIM_INTERVAL__);
    window.__SENTRA_SIM_INTERVAL__ = null;
  }

  console.info("[SIM] Stopped");
}
