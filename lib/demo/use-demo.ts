"use client";

import { useEffect, useState } from "react";

import { advanceDemoScene, getDemoExport, getDemoJudge, getDemoScenes, getDemoSummary, resetDemo, runDemo, runDemoScenario } from "@/lib/demo/api";
import { fallbackDemoState } from "@/lib/demo/runtime";
import type { DemoViewState } from "@/lib/demo/types";

let sharedState = fallbackDemoState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: DemoViewState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshDemo() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, scenes, judge, exports] = await Promise.all([getDemoSummary(), getDemoScenes(), getDemoJudge(), getDemoExport()]);
      sharedState = {
        ...sharedState,
        summary: summary.data,
        scenes: scenes.data,
        judge: judge.data,
        exports: exports.data,
        activeIndex: Math.min(summary.data.state.active_scene_index, Math.max(0, scenes.data.scenes.length - 1)),
        playing: summary.data.state.playing,
        speed: summary.data.state.speed,
        fullscreen: summary.data.state.fullscreen,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Demo engine is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withDemoAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? label };
    notify();
    await refreshDemo();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Demo action failed",
    };
    notify();
  }
}

function setLocalIndex(index: number) {
  const maxIndex = Math.max(0, sharedState.scenes.scenes.length - 1);
  sharedState = { ...sharedState, activeIndex: Math.max(0, Math.min(maxIndex, index)) };
  notify();
}

export function useDemo() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshDemo();
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.code === "Space") {
        event.preventDefault();
        setLocalIndex(sharedState.activeIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLocalIndex(sharedState.activeIndex - 1);
      }
      if (event.key.toLowerCase() === "f") {
        sharedState = { ...sharedState, fullscreen: !sharedState.fullscreen };
        notify();
      }
      if (event.key.toLowerCase() === "d") {
        sharedState = { ...sharedState, playing: !sharedState.playing };
        notify();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      subscribers.delete(setState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return {
    ...state,
    activeScene: state.scenes.scenes[state.activeIndex] ?? state.scenes.scenes[0] ?? fallbackDemoState.scenes.scenes[0]!,
    refresh: refreshDemo,
    play: () => {
      sharedState = { ...sharedState, playing: true };
      notify();
    },
    pause: () => {
      sharedState = { ...sharedState, playing: false };
      notify();
    },
    next: () => withDemoAction("next-scene", () => advanceDemoScene(state.speed)),
    previous: () => setLocalIndex(state.activeIndex - 1),
    skipToClimax: () => setLocalIndex(Math.max(0, state.scenes.scenes.findIndex((scene) => scene.scene_id === "SCN-05-COUNCIL"))),
    setSpeed: (speed: number) => {
      sharedState = { ...sharedState, speed };
      notify();
    },
    toggleFullscreen: () => {
      sharedState = { ...sharedState, fullscreen: !sharedState.fullscreen };
      notify();
    },
    run: (scenario?: string) => withDemoAction(`run-${scenario ?? "fire"}`, () => runDemo("judge", scenario ?? "fire")),
    runScenario: (scenario: string) => withDemoAction(`inject-${scenario}`, () => runDemoScenario(scenario, "judge")),
    reset: () => withDemoAction("reset-demo", resetDemo),
  };
}
