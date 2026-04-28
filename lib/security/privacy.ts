"use client";

export type PrivacySettings = {
  minimizePersonalData: boolean;
  anonymizeOccupantCounts: boolean;
  hideSensitiveNames: boolean;
  exportConsentBanner: boolean;
  dataMaskingMode: "standard" | "strict" | "executive";
};

const PRIVACY_SETTINGS_KEY = "sentra-privacy-controls";

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  minimizePersonalData: true,
  anonymizeOccupantCounts: true,
  hideSensitiveNames: true,
  exportConsentBanner: true,
  dataMaskingMode: "standard",
};

export function loadPrivacySettings(): PrivacySettings {
  if (typeof window === "undefined") {
    return DEFAULT_PRIVACY_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(PRIVACY_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_PRIVACY_SETTINGS;
    }
    return { ...DEFAULT_PRIVACY_SETTINGS, ...(JSON.parse(raw) as Partial<PrivacySettings>) };
  } catch {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

export function savePrivacySettings(settings: PrivacySettings) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
}

export function privacyScore(settings: PrivacySettings) {
  const enabled = [
    settings.minimizePersonalData,
    settings.anonymizeOccupantCounts,
    settings.hideSensitiveNames,
    settings.exportConsentBanner,
    settings.dataMaskingMode !== "standard",
  ].filter(Boolean).length;

  return Math.min(100, 68 + enabled * 6);
}
