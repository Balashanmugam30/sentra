import { fallbackSummary } from "@/lib/platform/runtime";
import type { DevelopersSummary } from "@/lib/developers/types";

export const fallbackDevelopersSummary: DevelopersSummary = {
  ...fallbackSummary,
  public_api_readiness: 94,
};
