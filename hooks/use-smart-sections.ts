"use client";

import { useCallback, useState } from "react";

import {
  readSectionPreferences,
  writeSectionPreferences,
  type DashboardSectionPreferenceId,
  type DashboardSectionPreferences,
} from "@/lib/dashboard/section-preferences";

export function useSmartSections<TMode extends string>({
  mode,
  defaultsByMode,
}: {
  mode: TMode;
  defaultsByMode: Record<TMode, DashboardSectionPreferences>;
}) {
  const [openSections, setOpenSections] = useState<DashboardSectionPreferences>(
    defaultsByMode[mode],
  );

  const hydrateModeSections = useCallback(
    (nextMode: TMode) => {
      setOpenSections(readSectionPreferences(nextMode, defaultsByMode[nextMode]));
    },
    [defaultsByMode],
  );

  const toggleSection = useCallback(
    (sectionId: DashboardSectionPreferenceId) => {
      setOpenSections((current) => {
        const next = { ...current, [sectionId]: !current[sectionId] };
        writeSectionPreferences(mode, next);
        return next;
      });
    },
    [mode],
  );

  return {
    hydrateModeSections,
    openSections,
    setOpenSections,
    toggleSection,
  };
}
