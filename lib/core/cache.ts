"use client";

type CacheKey = string;

type CacheEntry<T = unknown> = {
  data: T;
  updatedAt: number;
  stale: boolean;
  staleSince: number | null;
  lastError: string | null;
  failureCount: number;
};

type CacheSnapshot = {
  staleModules: string[];
  moduleStates: Record<
    string,
    {
      updatedAt: number | null;
      stale: boolean;
      lastError: string | null;
      failureCount: number;
    }
  >;
};

const CACHE_STORAGE_PREFIX = "sentra:last-good:";
const cacheStore = new Map<CacheKey, CacheEntry>();
const cacheListeners = new Set<() => void>();

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyCacheListeners() {
  for (const listener of cacheListeners) {
    listener();
  }
}

function storageKey(key: CacheKey) {
  return `${CACHE_STORAGE_PREFIX}${key}`;
}

function hydrateCacheEntry<T>(key: CacheKey): CacheEntry<T> | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(key));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    window.localStorage.removeItem(storageKey(key));
    return null;
  }
}

function persistCacheEntry<T>(key: CacheKey, entry: CacheEntry<T>) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    return;
  }
}

export function getCachedResource<T>(key: CacheKey): CacheEntry<T> | null {
  const inMemory = cacheStore.get(key);
  if (inMemory) {
    return inMemory as CacheEntry<T>;
  }

  const hydrated = hydrateCacheEntry<T>(key);
  if (hydrated) {
    cacheStore.set(key, hydrated as CacheEntry);
    return hydrated;
  }

  return null;
}

export function setCachedResource<T>(key: CacheKey, data: T) {
  const nextEntry: CacheEntry<T> = {
    data,
    updatedAt: Date.now(),
    stale: false,
    staleSince: null,
    lastError: null,
    failureCount: 0,
  };
  cacheStore.set(key, nextEntry as CacheEntry);
  persistCacheEntry(key, nextEntry);
  notifyCacheListeners();
  return nextEntry;
}

export function markCachedResourceFailure(key: CacheKey, error: string) {
  const previous = getCachedResource(key);
  const nextEntry: CacheEntry = previous
    ? {
        ...previous,
        stale: true,
        staleSince: previous.staleSince ?? Date.now(),
        lastError: error,
        failureCount: previous.failureCount + 1,
      }
    : {
        data: null,
        updatedAt: 0,
        stale: true,
        staleSince: Date.now(),
        lastError: error,
        failureCount: 1,
      };
  cacheStore.set(key, nextEntry);
  persistCacheEntry(key, nextEntry);
  notifyCacheListeners();
  return nextEntry;
}

export function clearCachedResource(key: CacheKey) {
  cacheStore.delete(key);
  if (canUseStorage()) {
    window.localStorage.removeItem(storageKey(key));
  }
  notifyCacheListeners();
}

export function clearAllCachedResources() {
  cacheStore.clear();
  if (canUseStorage()) {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(CACHE_STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  }
  notifyCacheListeners();
}

export function markCachedResourceFresh(key: CacheKey) {
  const previous = getCachedResource(key);
  if (!previous) {
    return null;
  }

  const nextEntry: CacheEntry = {
    ...previous,
    stale: false,
    staleSince: null,
    lastError: null,
    failureCount: 0,
  };
  cacheStore.set(key, nextEntry);
  persistCacheEntry(key, nextEntry);
  notifyCacheListeners();
  return nextEntry;
}

export function subscribeCache(listener: () => void) {
  cacheListeners.add(listener);
  return () => {
    cacheListeners.delete(listener);
  };
}

export function getCacheSnapshot(): CacheSnapshot {
  const moduleStates: CacheSnapshot["moduleStates"] = {};
  const staleModules: string[] = [];

  for (const [key, entry] of cacheStore.entries()) {
    moduleStates[key] = {
      updatedAt: entry.updatedAt || null,
      stale: entry.stale,
      lastError: entry.lastError,
      failureCount: entry.failureCount,
    };
    if (entry.stale) {
      staleModules.push(key);
    }
  }

  return {
    staleModules,
    moduleStates,
  };
}
