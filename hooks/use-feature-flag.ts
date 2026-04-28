"use client";

import { featureFlags } from "@/config/features";

export type FeatureFlagKey = keyof typeof featureFlags;

export function useFeatureFlag(flag: FeatureFlagKey) {
  return featureFlags[flag];
}
