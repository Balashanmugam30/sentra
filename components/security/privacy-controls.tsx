"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_PRIVACY_SETTINGS,
  loadPrivacySettings,
  privacyScore,
  savePrivacySettings,
  type PrivacySettings,
} from "@/lib/security/privacy";

type ToggleKey = Exclude<keyof PrivacySettings, "dataMaskingMode">;

const TOGGLES: Array<{ key: ToggleKey; label: string; helper: string }> = [
  {
    key: "minimizePersonalData",
    label: "Minimize personal data view",
    helper: "Suppresses nonessential PII in operational panels.",
  },
  {
    key: "anonymizeOccupantCounts",
    label: "Anonymized occupant counts",
    helper: "Rounds crowd counts where exact identity is unnecessary.",
  },
  {
    key: "hideSensitiveNames",
    label: "Hide sensitive names by role",
    helper: "Masks occupant and responder names for lower-privilege views.",
  },
  {
    key: "exportConsentBanner",
    label: "Export consent banner",
    helper: "Adds privacy notice to reports, CSV exports, and evidence packs.",
  },
];

export function PrivacyControls() {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettings(loadPrivacySettings());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = (next: PrivacySettings) => {
    setSettings(next);
    savePrivacySettings(next);
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Privacy Controls
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Data minimization posture</h2>
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
          {privacyScore(settings)}%
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {TOGGLES.map((item) => (
          <label
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            key={item.key}
          >
            <span>
              <span className="block text-sm font-semibold text-white">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/45">{item.helper}</span>
            </span>
            <input
              checked={settings[item.key]}
              className="h-5 w-5 accent-cyan-300"
              onChange={(event) => update({ ...settings, [item.key]: event.target.checked })}
              type="checkbox"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
          Data masking mode
        </label>
        <select
          className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none"
          onChange={(event) =>
            update({ ...settings, dataMaskingMode: event.target.value as PrivacySettings["dataMaskingMode"] })
          }
          value={settings.dataMaskingMode}
        >
          <option value="standard">Standard masking</option>
          <option value="strict">Strict incident privacy</option>
          <option value="executive">Executive redaction</option>
        </select>
      </div>
    </section>
  );
}
