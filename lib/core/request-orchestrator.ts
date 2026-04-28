"use client";

import {
  readDataCache,
  writeDataCache,
  type DataCacheState,
} from "@/lib/core/data-cache";

export type RequestPriority = "critical" | "high" | "normal" | "low" | "background";

export type RequestOrchestratorOptions<T> = {
  key: string;
  priority?: RequestPriority;
  ttlMs?: number;
  staleWhileRevalidateMs?: number;
  background?: boolean;
  dedupe?: boolean;
  cacheable?: (value: T) => boolean;
  execute: () => Promise<T>;
};

export type RequestOrchestratorStats = {
  activeRequests: number;
  queuedRequests: number;
  duplicateRequestsPrevented: number;
  backgroundRefreshes: number;
  completedRequests: number;
  failedRequests: number;
};

type QueuedRequest<T = unknown> = {
  key: string;
  priority: RequestPriority;
  background: boolean;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const PRIORITY_WEIGHT: Record<RequestPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  background: 4,
};

const MAX_CONCURRENT_REQUESTS = 5;
const inflight = new Map<string, Promise<unknown>>();
const queuedPromises = new Map<string, Promise<unknown>>();
const queue: QueuedRequest[] = [];
const listeners = new Set<() => void>();

const stats = {
  activeRequests: 0,
  duplicateRequestsPrevented: 0,
  backgroundRefreshes: 0,
  completedRequests: 0,
  failedRequests: 0,
};

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function sortQueue() {
  queue.sort((left, right) => PRIORITY_WEIGHT[left.priority] - PRIORITY_WEIGHT[right.priority]);
}

function runQueuedRequest<T>(request: QueuedRequest<T>) {
  stats.activeRequests += 1;
  const deferred = queuedPromises.get(request.key);
  if (deferred) {
    inflight.set(request.key, deferred);
  }
  notify();

  void request
    .execute()
    .then((value) => {
      stats.completedRequests += 1;
      request.resolve(value);
      return value;
    })
    .catch((error: unknown) => {
      stats.failedRequests += 1;
      request.reject(error);
    })
    .finally(() => {
      inflight.delete(request.key);
      queuedPromises.delete(request.key);
      stats.activeRequests = Math.max(0, stats.activeRequests - 1);
      notify();
      pumpQueue();
    });
}

function pumpQueue() {
  if (stats.activeRequests >= MAX_CONCURRENT_REQUESTS || queue.length === 0) {
    return;
  }

  sortQueue();
  while (stats.activeRequests < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
    const next = queue.shift();
    if (!next) {
      break;
    }
    runQueuedRequest(next);
  }
  notify();
}

function enqueue<T>(request: QueuedRequest<T>) {
  const pending = new Promise<T>((resolve, reject) => {
    request.resolve = resolve;
    request.reject = reject;
  });
  queuedPromises.set(request.key, pending);
  queue.push(request as QueuedRequest);
  pumpQueue();
  return pending;
}

function revalidateInBackground<T>(options: RequestOrchestratorOptions<T>) {
  if (inflight.has(options.key) || queuedPromises.has(options.key)) {
    return;
  }

  stats.backgroundRefreshes += 1;
  void enqueue<T>({
    key: options.key,
    priority: options.priority ?? "low",
    background: true,
    execute: async () => {
      const value = await options.execute();
      if (options.ttlMs && (options.cacheable?.(value) ?? true)) {
        writeDataCache(options.key, value, {
          ttlMs: options.ttlMs,
          staleWhileRevalidateMs: options.staleWhileRevalidateMs,
        });
      }
      return value;
    },
    resolve: () => undefined,
    reject: () => undefined,
  }).catch(() => undefined);
}

export const requestOrchestrator = {
  async request<T>(options: RequestOrchestratorOptions<T>): Promise<T> {
    const shouldCache = Boolean(options.ttlMs && options.ttlMs > 0);

    if (shouldCache) {
      const cached = readDataCache<T>(options.key);
      if (cached.entry && cached.state === "fresh") {
        return cached.entry.value;
      }

      if (cached.entry && cached.state === "stale") {
        revalidateInBackground(options);
        return cached.entry.value;
      }
    }

    if (options.dedupe !== false) {
      const existing = inflight.get(options.key) ?? queuedPromises.get(options.key);
      if (existing) {
        stats.duplicateRequestsPrevented += 1;
        notify();
        return (await existing) as T;
      }
    }

    const run = async () => {
      const value = await options.execute();
      if (shouldCache && (options.cacheable?.(value) ?? true)) {
        writeDataCache(options.key, value, {
          ttlMs: options.ttlMs ?? 0,
          staleWhileRevalidateMs: options.staleWhileRevalidateMs,
        });
      }
      return value;
    };

    return enqueue<T>({
      key: options.key,
      priority: options.priority ?? "normal",
      background: Boolean(options.background),
      execute: run,
      resolve: () => undefined,
      reject: () => undefined,
    });
  },

  cancel(keyOrPrefix: string) {
    for (let index = queue.length - 1; index >= 0; index -= 1) {
      if (queue[index]?.key?.startsWith(keyOrPrefix)) {
        const request = queue[index];
        if (!request) {
          continue;
        }
        queuedPromises.delete(request.key);
        request.reject(new Error("Request cancelled because it became obsolete."));
        queue.splice(index, 1);
      }
    }
    notify();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getStats(): RequestOrchestratorStats {
    return {
      activeRequests: stats.activeRequests,
      queuedRequests: queue.length,
      duplicateRequestsPrevented: stats.duplicateRequestsPrevented,
      backgroundRefreshes: stats.backgroundRefreshes,
      completedRequests: stats.completedRequests,
      failedRequests: stats.failedRequests,
    };
  },

  getCacheState(key: string): DataCacheState {
    return readDataCache(key).state;
  },

  resetPressureCounters() {
    stats.duplicateRequestsPrevented = 0;
    stats.backgroundRefreshes = 0;
    stats.completedRequests = 0;
    stats.failedRequests = 0;
    notify();
  },
};
