import type { OpsDelegationOption } from "@/lib/ops/types";

export function getRecommendedDelegate(options: OpsDelegationOption[]) {
  return options.find((option) => option.status === "recommended") ?? options[0] ?? null;
}
