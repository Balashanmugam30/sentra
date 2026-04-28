"use client";

import { useState } from "react";

import type { IotRoiData, IotRoiInputs } from "@/lib/iot/types";

const fields: Array<[keyof IotRoiInputs, string]> = [
  ["rooms", "Rooms"],
  ["floors", "Floors"],
  ["staff_count", "Staff count"],
  ["incidents_per_year", "Incidents/year"],
  ["avg_loss_per_incident", "Avg loss per incident"],
];

export function RoiCalculator({
  initial,
  onCalculate,
}: {
  initial: IotRoiData;
  onCalculate: (inputs: IotRoiInputs) => Promise<IotRoiData>;
}) {
  const [inputs, setInputs] = useState<IotRoiInputs>(initial.inputs);
  const [result, setResult] = useState<IotRoiData>(initial);
  const [busy, setBusy] = useState(false);

  const calculate = async () => {
    setBusy(true);
    try {
      setResult(await onCalculate(inputs));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <form
        className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)]"
        onSubmit={(event) => {
          event.preventDefault();
          void calculate();
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">ROI Calculator</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Convert safety into budget impact</h2>
        <div className="mt-6 grid gap-4">
          {fields.map(([field, label]) => (
            <label key={field}>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{label}</span>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
                min={0}
                onChange={(event) => setInputs((current) => ({ ...current, [field]: Number(event.target.value) }))}
                type="number"
                value={inputs[field]}
              />
            </label>
          ))}
        </div>
        <button className="mt-5 w-full rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white disabled:opacity-50" disabled={busy} type="submit">
          {busy ? "Calculating..." : "Calculate ROI"}
        </button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Annual Value", result.annual_value],
          ["Prevented Losses", result.prevented_losses],
          ["Response Savings", result.faster_response_savings],
          ["Insurance Reduction", result.insurance_reduction_estimate],
          ["Staff Efficiency", result.staffing_efficiency],
          ["Year One Cost", result.estimated_year_one_cost],
          ["ROI", `${result.roi_percent}%`],
          ["Payback", `${result.payback_months} months`],
        ].map(([label, value]) => (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5" key={label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              {typeof value === "number" ? `$${value.toLocaleString()}` : value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
