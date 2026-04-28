import type { PlatformSummary } from "@/lib/platform/types";

export type DevelopersSummary = PlatformSummary & {
  public_api_readiness?: number;
};

export type DevelopersEnvelope = {
  generated_at: string;
  data: DevelopersSummary;
};
