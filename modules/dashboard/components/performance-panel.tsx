"use client";

import { useEffect, useRef, useState } from "react";

import { clearAllCachedResources, getCacheSnapshot, subscribeCache } from "@/lib/core/cache";
import { getDataCacheStats, invalidateDataCache, subscribeDataCache } from "@/lib/core/data-cache";
import { apiClient, getApiPerformanceSnapshot } from "@/lib/core/api-client";
import { pollingManager } from "@/lib/core/polling-manager";
import { requestOrchestrator } from "@/lib/core/request-orchestrator";
import { liveSyncEngine } from "@/services/realtime/live-sync-engine";

type PerformanceState = {
  requestsPerMinute: number;
  averageLatencyMs: number;
  failedRequests: number;
  activeRequests: number;
  queuedRequests: number;
  authRefreshCount: number;
  p95LatencyMs: number;
  cacheHitRatio: number;
  duplicateRequestsPrevented: number;
  backendMode: "healthy" | "watch" | "degraded";
  activePolls: number;
  registeredPolls: number;
  activeSockets: number;
  socketHealthScore: number;
  staleModules: string[];
  memoryUsage: number | null;
  fpsEstimate: number;
  hiddenPollingPrevented: number;
  realtimeSuppressions: number;
  status: "excellent" | "healthy" | "watch" | "degraded" | "critical";
};

function computeStatus(input: {
  activeRequests: number;
  activePolls: number;
  failedRequests: number;
  p95LatencyMs: number;
  socketHealthScore: number;
}) {
  if (input.failedRequests >= 8 || input.activeRequests >= 16 || input.p95LatencyMs >= 8_000) {
    return "critical";
  }
  if (input.failedRequests >= 4 || input.activeRequests >= 12 || input.p95LatencyMs >= 4_000) {
    return "degraded";
  }
  if (input.activePolls >= 4 || input.p95LatencyMs >= 2_000 || input.socketHealthScore < 50) {
    return "watch";
  }
  if (input.activeRequests <= 4 && input.activePolls <= 2 && input.p95LatencyMs <= 900) {
    return "excellent";
  }
  return "healthy";
}

function readPerformanceState(): PerformanceState {
  const apiSnapshot = getApiPerformanceSnapshot();
  const pollingSnapshot = pollingManager.getSnapshot();
  const cacheSnapshot = getCacheSnapshot();
  const dataCacheStats = getDataCacheStats();
  const syncSnapshot = liveSyncEngine.getSnapshot();
  const browserPerformance = performance as Performance & {
    memory?: {
      usedJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
  };
  const memoryUsage =
    typeof performance !== "undefined" &&
    browserPerformance.memory &&
    typeof browserPerformance.memory.usedJSHeapSize === "number" &&
    typeof browserPerformance.memory.jsHeapSizeLimit === "number"
      ? Math.round(
          (Number(browserPerformance.memory.usedJSHeapSize) /
            Number(browserPerformance.memory.jsHeapSizeLimit)) *
            100,
        )
      : null;

  const activeRequests = apiSnapshot.activeRequests;
  const activePolls = pollingSnapshot.activePolls;
  const p95LatencyMs = apiSnapshot.p95LatencyMs;
  const status = computeStatus({
    activeRequests,
    activePolls,
    failedRequests: apiSnapshot.failedRequests,
    p95LatencyMs,
    socketHealthScore: syncSnapshot.socketHealthScore,
  });

  return {
    ...apiSnapshot,
    activePolls,
    registeredPolls: pollingSnapshot.registeredTaskIds.length,
    queuedRequests: apiSnapshot.queuedRequests,
    p95LatencyMs,
    cacheHitRatio: dataCacheStats.hitRatio,
    duplicateRequestsPrevented: apiSnapshot.duplicateRequestsPrevented,
    activeSockets: syncSnapshot.activeSockets,
    socketHealthScore: syncSnapshot.socketHealthScore,
    staleModules: cacheSnapshot.staleModules,
    memoryUsage,
    fpsEstimate: 60,
    hiddenPollingPrevented: pollingSnapshot.hiddenPollingPrevented,
    realtimeSuppressions: pollingSnapshot.realtimeSuppressions,
    status,
  };
}

function areStatesEqual(left: PerformanceState, right: PerformanceState) {
  return (
    left.requestsPerMinute === right.requestsPerMinute &&
    left.averageLatencyMs === right.averageLatencyMs &&
    left.failedRequests === right.failedRequests &&
    left.activeRequests === right.activeRequests &&
    left.queuedRequests === right.queuedRequests &&
    left.authRefreshCount === right.authRefreshCount &&
    left.p95LatencyMs === right.p95LatencyMs &&
    left.cacheHitRatio === right.cacheHitRatio &&
    left.duplicateRequestsPrevented === right.duplicateRequestsPrevented &&
    left.backendMode === right.backendMode &&
    left.activePolls === right.activePolls &&
    left.registeredPolls === right.registeredPolls &&
    left.activeSockets === right.activeSockets &&
    left.socketHealthScore === right.socketHealthScore &&
    left.memoryUsage === right.memoryUsage &&
    left.fpsEstimate === right.fpsEstimate &&
    left.hiddenPollingPrevented === right.hiddenPollingPrevented &&
    left.realtimeSuppressions === right.realtimeSuppressions &&
    left.status === right.status &&
    left.staleModules.length === right.staleModules.length &&
    left.staleModules.every((moduleKey, index) => moduleKey === right.staleModules[index])
  );
}

function usePerformanceState() {
  const [state, setState] = useState<PerformanceState>(() => readPerformanceState());
  const fpsRef = useRef(60);

  useEffect(() => {
    const sync = () => {
      const nextState = { ...readPerformanceState(), fpsEstimate: fpsRef.current };
      if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
        (window as Window & {
          __sentraDebug?: Record<string, unknown>;
        }).__sentraDebug = {
          requests: getApiPerformanceSnapshot(),
          cache: getDataCacheStats(),
          polling: pollingManager.getSnapshot(),
          sockets: liveSyncEngine.getSnapshot(),
        };
      }
      setState((current) => (areStatesEqual(current, nextState) ? current : nextState));
    };

    const unsubscribers = [
      apiClient.subscribePerformance(sync),
      pollingManager.subscribe(sync),
      subscribeCache(sync),
      subscribeDataCache(sync),
      requestOrchestrator.subscribe(sync),
      liveSyncEngine.subscribe(sync),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastSampleAt = performance.now();
    let animationFrame = 0;
    let cancelled = false;

    const sample = (timestamp: number) => {
      if (cancelled) {
        return;
      }
      frameCount += 1;
      if (timestamp - lastSampleAt >= 1000) {
        fpsRef.current = Math.round((frameCount * 1000) / Math.max(1, timestamp - lastSampleAt));
        frameCount = 0;
        lastSampleAt = timestamp;
        setState((current) =>
          current.fpsEstimate === fpsRef.current ? current : { ...current, fpsEstimate: fpsRef.current },
        );
      }
      animationFrame = window.requestAnimationFrame(sample);
    };

    animationFrame = window.requestAnimationFrame(sample);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return state;
}

export function PerformancePanel() {
  const state = usePerformanceState();
  const [optimizing, setOptimizing] = useState(false);
  const optimizeTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (optimizeTimerRef.current !== null) {
        window.clearTimeout(optimizeTimerRef.current);
      }
    },
    [],
  );

  function autoOptimize() {
    if (optimizing) {
      return;
    }

    setOptimizing(true);
    requestOrchestrator.cancel("");
    requestOrchestrator.resetPressureCounters();
    invalidateDataCache();
    clearAllCachedResources();
    pollingManager.optimizeNow();
    liveSyncEngine.restart();
    if (optimizeTimerRef.current !== null) {
      window.clearTimeout(optimizeTimerRef.current);
    }
    optimizeTimerRef.current = window.setTimeout(() => {
      setOptimizing(false);
      optimizeTimerRef.current = null;
    }, 1200);
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              System Performance Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Request stability, polling load, stale-state recovery, and auth refresh health
            </h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100">
            {state.status}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Performance Center 2.0</div>
            <div className="mt-1 text-xs text-white/50">
              Realtime health, cache behavior, hidden polling prevention, queue depth, and client FPS estimate.
            </div>
          </div>
          <button
            className="rounded-full border border-cyan-300/20 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={optimizing}
            onClick={autoOptimize}
            type="button"
          >
            {optimizing ? "Optimizing..." : "Auto Optimize"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
          {[
            ["Requests / Sec", (state.requestsPerMinute / 60).toFixed(1)],
            ["Avg Latency", `${state.averageLatencyMs} ms`],
            ["P95 Latency", `${state.p95LatencyMs} ms`],
            ["Failed Requests", String(state.failedRequests)],
            ["Active Polls", String(state.activePolls)],
            ["Active Requests", String(state.activeRequests)],
            ["Cache Hit", `${state.cacheHitRatio}%`],
            ["Dupes Prevented", String(state.duplicateRequestsPrevented)],
            ["Queued", String(state.queuedRequests)],
            ["FPS Estimate", String(state.fpsEstimate)],
            ["Active Sockets", String(state.activeSockets)],
            ["Socket Health", `${state.socketHealthScore}%`],
            ["Polling Tasks", String(state.registeredPolls)],
            ["Hidden Polls Saved", String(state.hiddenPollingPrevented)],
            ["Realtime Suppressed", String(state.realtimeSuppressions)],
            ["Stale Modules", String(state.staleModules.length)],
            ["Auth Refreshes", String(state.authRefreshCount)],
            ["Memory Warning", state.memoryUsage !== null ? `${state.memoryUsage}%` : "n/a"],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        {state.staleModules.length ? (
          <div className="flex flex-wrap gap-2">
            {state.staleModules.map((moduleKey, index) => (
              <span
                className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-amber-100"
                key={`${moduleKey}-${index}`}
              >
                {moduleKey} stale
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
