"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotSettings, updateIotSettings } from "@/lib/iot/api";
import { buildMockSettings } from "@/lib/iot/mock";
import type { IotSettings } from "@/lib/iot/types";

type SettingNumberField = "polling_interval_ms" | "retention_days" | "simulation_speed" | "node_timeout_seconds";
type SettingBooleanField = "auto_refresh" | "sound_enabled" | "export_csv";
const booleanFields: Array<[SettingBooleanField, string]> = [
  ["auto_refresh", "Auto refresh"],
  ["sound_enabled", "Sound enabled"],
  ["export_csv", "CSV export enabled"],
];

export default function IotSettingsPage() {
  const [settings, setSettings] = useState<IotSettings>(buildMockSettings().settings);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
      try {
        const response = await getIotSettings();
        if (!cancelled) {
          setSettings(response.settings);
        }
      } catch (error) {
        if (!cancelled) {
          setNotice(error instanceof Error ? `${error.message}. Using local settings preview.` : "Using local settings preview.");
        }
      }
    }
    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateNumber = (field: SettingNumberField, value: number) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await updateIotSettings(settings);
      setSettings(response.settings);
      setNotice("IoT admin settings saved.");
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message}. Local settings preview retained.` : "Local settings preview retained.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_28%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">IoT Settings</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  Admin control for fleet intelligence.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Tune polling, retention, simulation speed, node timeout, notifications, sound, and export policy.
                </p>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/iot">
                Back to IoT
              </Link>
            </div>
          </header>

          {notice ? <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50/75">{notice}</div> : null}

          <section className="grid gap-4 md:grid-cols-2">
            {[
              ["polling_interval_ms", "Polling interval", 1000, 60000, 500, "ms"],
              ["retention_days", "Retention days", 1, 365, 1, "days"],
              ["simulation_speed", "Simulation speed", 0.25, 5, 0.25, "x"],
              ["node_timeout_seconds", "Node timeout", 15, 600, 5, "sec"],
            ].map(([field, label, min, max, step, unit]) => (
              <label className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5" key={field}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">{label}</span>
                  <span className="text-sm text-cyan-100">
                    {settings[field as SettingNumberField]} {unit}
                  </span>
                </span>
                <input
                  className="mt-4 w-full accent-cyan-300"
                  max={Number(max)}
                  min={Number(min)}
                  onChange={(event) => updateNumber(field as SettingNumberField, Number(event.target.value))}
                  step={Number(step)}
                  type="range"
                  value={settings[field as SettingNumberField]}
                />
              </label>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {booleanFields.map(([field, label]) => (
              <label className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/[0.045] p-5" key={field}>
                <span>
                  <span className="block font-semibold text-white">{label}</span>
                  <span className="mt-1 block text-sm text-white/45">Enterprise-safe default can be changed by admins.</span>
                </span>
                <input
                  checked={Boolean(settings[field as keyof IotSettings])}
                  className="h-5 w-5 accent-cyan-300"
                  onChange={(event) => setSettings((current) => ({ ...current, [field]: event.target.checked }))}
                  type="checkbox"
                />
              </label>
            ))}
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/40" htmlFor="iot-mode">
              Default mode
            </label>
            <select
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none"
              id="iot-mode"
              onChange={(event) => setSettings((current) => ({ ...current, mode: event.target.value as IotSettings["mode"] }))}
              value={settings.mode}
            >
              <option value="REAL">REAL</option>
              <option value="DEMO">DEMO</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </section>

          <button
            className="rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            onClick={() => {
              void save();
            }}
            type="button"
          >
            {saving ? "Saving settings..." : "Save IoT settings"}
          </button>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
