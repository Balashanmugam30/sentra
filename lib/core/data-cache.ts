"use client";

export type DataCacheState = "fresh" | "stale" | "miss";

export type DataCacheEntry<T = unknown> = {
  key: string;
  value: T;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  staleUntil: number;
  hits: number;
  lastAccessedAt: number;
};

export type DataCacheRead<T = unknown> = {
  state: DataCacheState;
  entry: DataCacheEntry<T> | null;
};

export type DataCacheStats = {
  size: number;
  hits: number;
  misses: number;
  staleHits: number;
  writes: number;
  evictions: number;
  hitRatio: number;
};

type SetOptions = {
  ttlMs: number;
  staleWhileRevalidateMs?: number;
};

const MAX_CACHE_ENTRIES = 180;
const cache = new Map<string, DataCacheEntry>();
const listeners = new Set<() => void>();

const stats = {
  hits: 0,
  misses: 0,
  staleHits: 0,
  writes: 0,
  evictions: 0,
};

function now() {
  return Date.now();
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function evictIfNeeded() {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = [...cache.values()].sort((left, right) => left.lastAccessedAt - right.lastAccessedAt)[0];
    if (!oldest) {
      return;
    }
    cache.delete(oldest.key);
    stats.evictions += 1;
  }
}

export function readDataCache<T>(key: string): DataCacheRead<T> {
  const entry = cache.get(key) as DataCacheEntry<T> | undefined;
  if (!entry) {
    stats.misses += 1;
    return { state: "miss", entry: null };
  }

  const currentTime = now();
  entry.hits += 1;
  entry.lastAccessedAt = currentTime;

  if (entry.expiresAt > currentTime) {
    stats.hits += 1;
    return { state: "fresh", entry };
  }

  if (entry.staleUntil > currentTime) {
    stats.staleHits += 1;
    return { state: "stale", entry };
  }

  cache.delete(key);
  stats.misses += 1;
  return { state: "miss", entry: null };
}

export function writeDataCache<T>(key: string, value: T, options: SetOptions): DataCacheEntry<T> {
  const currentTime = now();
  const ttlMs = Math.max(0, options.ttlMs);
  const staleWhileRevalidateMs = Math.max(ttlMs, options.staleWhileRevalidateMs ?? ttlMs);
  const previous = cache.get(key);
  const entry: DataCacheEntry<T> = {
    key,
    value,
    createdAt: previous?.createdAt ?? currentTime,
    updatedAt: currentTime,
    expiresAt: currentTime + ttlMs,
    staleUntil: currentTime + staleWhileRevalidateMs,
    hits: previous?.hits ?? 0,
    lastAccessedAt: currentTime,
  };

  cache.set(key, entry as DataCacheEntry);
  stats.writes += 1;
  evictIfNeeded();
  notify();
  return entry;
}

export function invalidateDataCache(keyOrPrefix?: string) {
  if (!keyOrPrefix) {
    cache.clear();
    notify();
    return;
  }

  for (const key of cache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      cache.delete(key);
    }
  }
  notify();
}

export function peekDataCache<T>(key: string): DataCacheEntry<T> | null {
  return (cache.get(key) as DataCacheEntry<T> | undefined) ?? null;
}

export function subscribeDataCache(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDataCacheStats(): DataCacheStats {
  const reads = stats.hits + stats.staleHits + stats.misses;
  const usefulHits = stats.hits + stats.staleHits;
  return {
    size: cache.size,
    hits: stats.hits,
    misses: stats.misses,
    staleHits: stats.staleHits,
    writes: stats.writes,
    evictions: stats.evictions,
    hitRatio: reads > 0 ? Math.round((usefulHits / reads) * 100) : 0,
  };
}
