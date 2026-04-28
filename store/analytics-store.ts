import { create } from "zustand";

import type { ApiError } from "@/types/api";

interface EndpointMetric {
  count: number;
  lastCalledAt: string;
}

interface AnalyticsState {
  endpointUsage: Record<string, EndpointMetric>;
  rateLimitHitCount: number;
  lastRateLimitedEndpoint: string | null;
  lastRateLimitDetail: ApiError | null;
  trackRequest: (endpoint: string) => void;
  trackRateLimit: (endpoint: string, detail: ApiError) => void;
  trackResponseHeaders: (endpoint: string, headers: Headers) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  endpointUsage: {},
  rateLimitHitCount: 0,
  lastRateLimitedEndpoint: null,
  lastRateLimitDetail: null,
  trackRequest: (endpoint) => {
    const current = get().endpointUsage[endpoint];

    set({
      endpointUsage: {
        ...get().endpointUsage,
        [endpoint]: {
          count: (current?.count ?? 0) + 1,
          lastCalledAt: new Date().toISOString(),
        },
      },
    });
  },
  trackRateLimit: (endpoint, detail) => {
    set({
      rateLimitHitCount: get().rateLimitHitCount + 1,
      lastRateLimitedEndpoint: endpoint,
      lastRateLimitDetail: detail,
    });
  },
  trackResponseHeaders: (_endpoint, _headers) => {
    return;
  },
}));
