import type { TwinResource } from "@/lib/twin/types";

export function resourceLoad(resource: TwinResource) {
  const total = resource.deployed + resource.idle;
  return total === 0 ? 0 : Math.round((resource.deployed / total) * 100);
}

export function resourceTone(resource: TwinResource) {
  if (resource.overload >= 40) {
    return "critical";
  }
  if (resource.overload >= 25) {
    return "watch";
  }
  return "ready";
}
