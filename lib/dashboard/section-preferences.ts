"use client";

export const DASHBOARD_SECTION_IDS = [
  "security",
  "intelligence",
  "operations",
  "ai-systems",
  "infrastructure",
  "executive",
] as const;

export type DashboardSectionPreferenceId = (typeof DASHBOARD_SECTION_IDS)[number];

export type DashboardSectionPreferences = Record<DashboardSectionPreferenceId, boolean>;

export const DASHBOARD_SECTION_PREFERENCE_KEY = "sentra-dashboard-section-preferences-v2";
export const LEGACY_DASHBOARD_SECTION_PREFERENCE_KEY = "sentra-open-sections";

export const SMART_COMMAND_SECTIONS: DashboardSectionPreferences = {
  security: true,
  intelligence: true,
  operations: true,
  "ai-systems": false,
  infrastructure: false,
  executive: false,
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function sanitizePreferences(
  value: unknown,
  fallback: DashboardSectionPreferences,
): DashboardSectionPreferences {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const incoming = value as Partial<Record<DashboardSectionPreferenceId, unknown>>;
  return DASHBOARD_SECTION_IDS.reduce<DashboardSectionPreferences>((next, sectionId) => {
    next[sectionId] =
      typeof incoming[sectionId] === "boolean" ? Boolean(incoming[sectionId]) : fallback[sectionId];
    return next;
  }, { ...fallback });
}

export function readSectionPreferences(
  mode: string,
  fallback: DashboardSectionPreferences,
): DashboardSectionPreferences {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_SECTION_PREFERENCE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return sanitizePreferences(parsed[mode], fallback);
  } catch {
    window.localStorage.removeItem(DASHBOARD_SECTION_PREFERENCE_KEY);
    return fallback;
  }
}

export function writeSectionPreferences(
  mode: string,
  preferences: DashboardSectionPreferences,
) {
  if (!canUseStorage()) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_SECTION_PREFERENCE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    parsed[mode] = sanitizePreferences(preferences, preferences);
    window.localStorage.setItem(DASHBOARD_SECTION_PREFERENCE_KEY, JSON.stringify(parsed));
    window.localStorage.removeItem(LEGACY_DASHBOARD_SECTION_PREFERENCE_KEY);
  } catch {
    window.localStorage.removeItem(DASHBOARD_SECTION_PREFERENCE_KEY);
  }
}

