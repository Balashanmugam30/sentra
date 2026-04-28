"use client";

import type { IotCalibrationProfile } from "@/lib/iot/types";

const fieldConfig: Array<{
  key: keyof Omit<IotCalibrationProfile, "preset" | "buzzer_policy">;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}> = [
  { key: "gas_warning_threshold", label: "Gas warning threshold", min: 200, max: 2500, step: 25, unit: "ADC" },
  { key: "gas_danger_threshold", label: "Gas danger threshold", min: 1000, max: 4095, step: 25, unit: "ADC" },
  { key: "temp_warning_threshold", label: "Temp warning threshold", min: 30, max: 85, step: 1, unit: "C" },
  { key: "temp_critical_threshold", label: "Temp critical threshold", min: 40, max: 110, step: 1, unit: "C" },
  { key: "flame_debounce_ms", label: "Flame debounce", min: 0, max: 2500, step: 50, unit: "ms" },
  { key: "ultrasonic_blocked_distance_cm", label: "Blocked distance", min: 15, max: 240, step: 5, unit: "cm" },
  { key: "panic_hold_duration_ms", label: "Panic hold duration", min: 0, max: 3000, step: 50, unit: "ms" },
];

const presetValues: Record<string, Partial<IotCalibrationProfile>> = {
  Hotel: {
    gas_warning_threshold: 1350,
    gas_danger_threshold: 2350,
    temp_warning_threshold: 48,
    temp_critical_threshold: 62,
    ultrasonic_blocked_distance_cm: 65,
  },
  Hospital: {
    gas_warning_threshold: 1150,
    gas_danger_threshold: 2100,
    temp_warning_threshold: 44,
    temp_critical_threshold: 58,
    panic_hold_duration_ms: 600,
  },
  School: {
    gas_warning_threshold: 1200,
    gas_danger_threshold: 2200,
    temp_warning_threshold: 45,
    temp_critical_threshold: 60,
    ultrasonic_blocked_distance_cm: 80,
  },
  Mall: {
    gas_warning_threshold: 1450,
    gas_danger_threshold: 2450,
    temp_warning_threshold: 50,
    temp_critical_threshold: 65,
    ultrasonic_blocked_distance_cm: 90,
  },
  "Office Tower": {
    gas_warning_threshold: 1300,
    gas_danger_threshold: 2300,
    temp_warning_threshold: 47,
    temp_critical_threshold: 61,
    ultrasonic_blocked_distance_cm: 70,
  },
};

export function CalibrationPanel({
  profile,
  presets,
  saving,
  onChange,
  onSave,
}: {
  profile: IotCalibrationProfile;
  presets: string[];
  saving: boolean;
  onChange: (profile: IotCalibrationProfile) => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Calibration Center</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Sensor thresholds and policies</h2>
        </div>
        <button
          className="rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving}
          onClick={onSave}
          type="button"
        >
          {saving ? "Saving..." : "Save calibration"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-cyan-300/10 hover:text-cyan-100"
            key={preset}
            onClick={() => onChange({ ...profile, ...presetValues[preset], preset })}
            type="button"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {fieldConfig.map((field) => (
          <label className="rounded-3xl border border-white/10 bg-black/20 p-4" key={field.key}>
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{field.label}</span>
              <span className="text-sm text-cyan-100">
                {profile[field.key]} {field.unit}
              </span>
            </span>
            <input
              className="mt-4 w-full accent-cyan-300"
              max={field.max}
              min={field.min}
              onChange={(event) => onChange({ ...profile, [field.key]: Number(event.target.value) })}
              step={field.step}
              type="range"
              value={profile[field.key]}
            />
          </label>
        ))}
      </div>

      <label className="mt-5 block rounded-3xl border border-white/10 bg-black/20 p-4">
        <span className="text-sm font-semibold text-white">Buzzer policy</span>
        <select
          className="mt-3 w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none"
          onChange={(event) =>
            onChange({
              ...profile,
              buzzer_policy: event.target.value as IotCalibrationProfile["buzzer_policy"],
            })
          }
          value={profile.buzzer_policy}
        >
          <option value="off">Off</option>
          <option value="warning_only">Warning only</option>
          <option value="critical_only">Critical only</option>
          <option value="always">Always</option>
        </select>
      </label>
    </section>
  );
}
