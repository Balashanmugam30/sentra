"use client";

function parseRefreshMs(value: string | undefined, fallbackMs: number, minimumMs: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallbackMs;
  }
  return Math.max(minimumMs, parsed);
}

export const DEFAULT_REFRESH_MS = parseRefreshMs(
  process.env.NEXT_PUBLIC_REFRESH_MS,
  30_000,
  15_000,
);

export const HEAVY_REFRESH_MS = parseRefreshMs(
  process.env.NEXT_PUBLIC_HEAVY_REFRESH_MS,
  60_000,
  DEFAULT_REFRESH_MS,
);

export const LIVE_POLLING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LIVE_POLLING !== "false";

