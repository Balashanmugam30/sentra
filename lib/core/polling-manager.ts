"use client";

import { getApiPerformanceSnapshot } from "@/lib/core/api-client";
import { DEFAULT_REFRESH_MS, HEAVY_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import { liveSyncEngine } from "@/services/realtime/live-sync-engine";

export type PollingTier =
  | "critical"
  | "operational"
  | "intelligence"
  | "heavy"
  | "low"
  | "manual";

type PollingTask = {
  id: string;
  tier: PollingTier;
  run: () => Promise<void>;
  enabled: () => boolean;
  sectionId: string | null;
  realtimePreferred: boolean;
  nextRunAt: number;
  running: boolean;
  failureCount: number;
  lastRunAt: number | null;
  suppressedBySocket: boolean;
};

export type PollingSnapshot = {
  activePolls: number;
  activeTaskIds: string[];
  registeredTaskIds: string[];
  paused: boolean;
  backendMode: "healthy" | "watch" | "degraded";
  visibleSections: string[];
  socketHealthy: boolean;
  hiddenPollingPrevented: number;
  realtimeSuppressions: number;
};

const TIER_INTERVALS: Record<PollingTier, number> = {
  critical: Math.max(15_000, Math.floor(DEFAULT_REFRESH_MS / 2)),
  operational: DEFAULT_REFRESH_MS,
  intelligence: DEFAULT_REFRESH_MS,
  heavy: HEAVY_REFRESH_MS,
  low: Math.max(90_000, HEAVY_REFRESH_MS),
  manual: Number.POSITIVE_INFINITY,
};
const MAX_POLLS_PER_TICK = 3;

class PollingManager {
  private readonly tasks = new Map<string, PollingTask>();
  private readonly listeners = new Set<() => void>();
  private readonly visibleSections = new Map<string, boolean>();
  private activePolls = 0;
  private timerId: number | null = null;
  private pausedForVisibility = false;
  private lastUserActivityAt = Date.now();
  private hiddenPollingPrevented = 0;
  private realtimeSuppressions = 0;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("focus", this.handleWindowFocus);
      window.addEventListener("mousemove", this.handleUserActivity, { passive: true });
      window.addEventListener("keydown", this.handleUserActivity);
      window.addEventListener("scroll", this.handleUserActivity, { passive: true });
    }
    this.ensureLoop();
  }

  private ensureLoop() {
    if (typeof window === "undefined" || this.timerId !== null) {
      return;
    }

    this.timerId = window.setInterval(() => {
      void this.tick();
    }, 1_000);
  }

  private readonly handleVisibilityChange = () => {
    this.pausedForVisibility = document.visibilityState === "hidden";
    this.notify();
    if (!this.pausedForVisibility) {
      void this.tick(true);
    }
  };

  private readonly handleWindowFocus = () => {
    this.lastUserActivityAt = Date.now();
    void this.tick(true);
  };

  private readonly handleUserActivity = () => {
    this.lastUserActivityAt = Date.now();
  };

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private getTaskInterval(task: PollingTask) {
    const base = TIER_INTERVALS[task.tier];
    if (!Number.isFinite(base)) {
      return base;
    }

    const backendMode = getApiPerformanceSnapshot().backendMode;
    const inactiveForMs = Date.now() - this.lastUserActivityAt;
    const backoffMultiplier =
      backendMode === "degraded"
        ? 3
        : backendMode === "watch"
        ? 2
        : inactiveForMs > 180_000
        ? 3
        : Math.min(4, 1 + task.failureCount);

    return base * backoffMultiplier;
  }

  private isTaskVisible(task: PollingTask) {
    if (!task.sectionId) {
      return true;
    }
    return this.visibleSections.get(task.sectionId) ?? false;
  }

  private shouldSuppressForRealtime(task: PollingTask, force: boolean) {
    if (force || !task.realtimePreferred || task.tier === "critical") {
      task.suppressedBySocket = false;
      return false;
    }

    const socketHealthy = liveSyncEngine.isRealtimeHealthy();
    const recentlyChecked = task.lastRunAt !== null && Date.now() - task.lastRunAt < 60_000;
    const shouldSuppress = socketHealthy && recentlyChecked;
    task.suppressedBySocket = shouldSuppress;
    if (shouldSuppress) {
      this.realtimeSuppressions += 1;
    }
    return shouldSuppress;
  }

  private async executeTask(task: PollingTask) {
    if (task.running || !task.enabled() || !this.isTaskVisible(task)) {
      return;
    }

    task.running = true;
    task.lastRunAt = Date.now();
    this.activePolls += 1;
    this.notify();

    try {
      await task.run();
      task.failureCount = 0;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.name === "SentraRecoverableApiError" ||
          error.message.toLowerCase().includes("aborted"))
      ) {
        return;
      }
      task.failureCount += 1;
    } finally {
      task.running = false;
      task.nextRunAt = Date.now() + this.getTaskInterval(task);
      this.activePolls = Math.max(0, this.activePolls - 1);
      this.notify();
    }
  }

  private async tick(force = false) {
    if (!LIVE_POLLING_ENABLED || this.pausedForVisibility) {
      return;
    }

    const now = Date.now();
    const dueTasks = [...this.tasks.values()].filter((task) => {
      if (!task.enabled()) {
        return false;
      }
      if (!this.isTaskVisible(task)) {
        this.hiddenPollingPrevented += 1;
        return false;
      }
      if (this.shouldSuppressForRealtime(task, force)) {
        return false;
      }
      if (task.tier === "manual" && !force) {
        return false;
      }
      return force || task.nextRunAt <= now;
    });

    const runnableTasks = dueTasks
      .sort((left, right) => {
        if (left.tier !== right.tier) {
          return TIER_INTERVALS[left.tier] - TIER_INTERVALS[right.tier];
        }
        return left.nextRunAt - right.nextRunAt;
      })
      .slice(0, MAX_POLLS_PER_TICK);

    dueTasks.slice(MAX_POLLS_PER_TICK).forEach((task, index) => {
      task.nextRunAt = now + 1_250 + index * 250;
    });

    await Promise.all(runnableTasks.map((task) => this.executeTask(task)));
  }

  registerTask(config: {
    id: string;
    tier: PollingTier;
    run: () => Promise<void>;
    enabled?: () => boolean;
    sectionId?: string;
    realtimePreferred?: boolean;
    immediate?: boolean;
  }) {
    const existingTask = this.tasks.get(config.id);
    if (existingTask) {
      existingTask.tier = config.tier;
      existingTask.run = config.run;
      existingTask.enabled = config.enabled ?? (() => true);
      existingTask.sectionId = config.sectionId ?? null;
      existingTask.realtimePreferred = config.realtimePreferred ?? true;
      if (config.immediate) {
        existingTask.nextRunAt = Date.now();
        void this.tick(true);
      }
      this.notify();
      return () => {
        const currentTask = this.tasks.get(config.id);
        if (currentTask === existingTask) {
          this.tasks.delete(config.id);
          this.notify();
        }
      };
    }

    const task: PollingTask = {
      id: config.id,
      tier: config.tier,
      run: config.run,
      enabled: config.enabled ?? (() => true),
      sectionId: config.sectionId ?? null,
      realtimePreferred: config.realtimePreferred ?? true,
      nextRunAt: config.immediate ? Date.now() : Date.now() + TIER_INTERVALS[config.tier],
      running: false,
      failureCount: 0,
      lastRunAt: null,
      suppressedBySocket: false,
    };

    this.tasks.set(config.id, task);
    this.notify();

    if (config.immediate) {
      void this.tick(true);
    }

    return () => {
      const currentTask = this.tasks.get(config.id);
      if (currentTask === task) {
        this.tasks.delete(config.id);
        this.notify();
      }
    };
  }

  touchTask(id: string, immediate = true) {
    const task = this.tasks.get(id);
    if (!task) {
      return;
    }

    task.nextRunAt = immediate ? Date.now() : Date.now() + this.getTaskInterval(task);
    if (immediate) {
      void this.tick(true);
    }
    this.notify();
  }

  optimizeNow() {
    for (const task of this.tasks.values()) {
      task.failureCount = 0;
      task.running = false;
      task.suppressedBySocket = false;
      task.nextRunAt = Date.now() + this.getTaskInterval(task);
    }
    this.hiddenPollingPrevented = 0;
    this.realtimeSuppressions = 0;
    void this.tick(true);
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setSectionVisibility(sectionId: string, visible: boolean) {
    const previous = this.visibleSections.get(sectionId);
    if (previous === visible) {
      return;
    }
    this.visibleSections.set(sectionId, visible);
    if (visible) {
      void this.tick(true);
    }
    this.notify();
  }

  getSnapshot(): PollingSnapshot {
    return {
      activePolls: this.activePolls,
      activeTaskIds: [...this.tasks.values()]
        .filter((task) => task.running)
        .map((task) => task.id),
      registeredTaskIds: [...this.tasks.keys()],
      paused: this.pausedForVisibility,
      backendMode: getApiPerformanceSnapshot().backendMode,
      visibleSections: [...this.visibleSections.entries()]
        .filter(([, visible]) => visible)
        .map(([sectionId]) => sectionId),
      socketHealthy: liveSyncEngine.isRealtimeHealthy(),
      hiddenPollingPrevented: this.hiddenPollingPrevented,
      realtimeSuppressions: this.realtimeSuppressions,
    };
  }
}

export const pollingManager = new PollingManager();
