"use client";

import { initEventPipeline } from "@/lib/events/pipeline";

declare global {
  interface Window {
    __SENTRA_BOOTSTRAPPED__?: boolean;
  }
}

export function bootstrapSentra() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__SENTRA_BOOTSTRAPPED__) {
    return;
  }

  window.__SENTRA_BOOTSTRAPPED__ = true;

  initEventPipeline();

  console.info("[SIM] Client incident simulator disabled; server-side perception pipeline owns incident creation");
}
