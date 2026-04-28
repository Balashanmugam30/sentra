import { decideAction } from "@/lib/ai/decision-engine";
import { analyzeEvent } from "@/lib/ai/perception-engine";
import { handleEvent } from "../api/incident";
import { subscribeEvent } from "./event-bus";

declare global {
  interface Window {
    __SENTRA_PIPELINE_READY__?: boolean;
    __SENTRA_PIPELINE_UNSUB__?: (() => void) | null;
  }
}

export function initEventPipeline() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__SENTRA_PIPELINE_READY__) {
    return;
  }

  if (window.__SENTRA_PIPELINE_UNSUB__) {
    window.__SENTRA_PIPELINE_UNSUB__();
  }

  window.__SENTRA_PIPELINE_UNSUB__ = subscribeEvent("pipeline", async (event) => {
    if (event.type === "INCIDENT_CREATED") {
      const perception = analyzeEvent(event as any);
      const decision = decideAction(perception);
      const traceId =
        typeof event.payload === "object" &&
        event.payload !== null &&
        "trace_id" in event.payload
          ? (event.payload as { trace_id?: string }).trace_id
          : undefined;

      console.info(`[PIPELINE] handling trace_id=${traceId ?? "missing"}`);

      await handleEvent({
        ...event,
        payload: {
          ...perception,
          ...decision,
        },
      });

      return;
    }

    if (event.type === "INCIDENT_UPDATED") {
      await handleEvent(event);
    }
  });

  window.__SENTRA_PIPELINE_READY__ = true;
  console.info("[PIPELINE] initialized once");
}
