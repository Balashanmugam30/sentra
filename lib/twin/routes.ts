import type { TwinOptimizedRoute } from "@/lib/twin/types";

export function routeEfficiency(route: TwinOptimizedRoute) {
  return Math.round((route.score + route.safety + route.hazard_avoidance + route.reserve_capacity - route.congestion) / 4);
}

export function routePressure(route: TwinOptimizedRoute) {
  return Math.max(0, 100 - route.congestion);
}
