"use client";

import { useState } from "react";

import type { IotNode, IotProvisionDevice, IotProvisioningData, IotProvisionResponse } from "@/lib/iot/types";

const defaultDevice: IotProvisionDevice = {
  label: "New Corridor Safety Node",
  building: "Grand Meridian Hotel",
  floor: "3",
  zone: "North Corridor",
  node_type: "sensor",
  tenant: "TEN-GRAND-MERIDIAN",
  firmware_version: "edge-1.5.0",
};

export function ProvisionTable({
  data,
  provisioned,
  onProvision,
}: {
  data: IotProvisioningData;
  provisioned: IotProvisionResponse | null;
  onProvision: (device: IotProvisionDevice) => Promise<void>;
}) {
  const [device, setDevice] = useState<IotProvisionDevice>(defaultDevice);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onProvision(device);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Device Provisioning</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Add a field-ready node</h2>
        <div className="mt-6 grid gap-4">
          {(["label", "building", "floor", "zone", "tenant", "firmware_version"] as const).map((field) => (
            <label className="block" key={field}>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{field.replaceAll("_", " ")}</span>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                onChange={(event) => setDevice((current) => ({ ...current, [field]: event.target.value }))}
                value={device[field]}
              />
            </label>
          ))}
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">device type</span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none"
              onChange={(event) => setDevice((current) => ({ ...current, node_type: event.target.value as IotProvisionDevice["node_type"] }))}
              value={device.node_type}
            >
              <option value="sensor">Sensor</option>
              <option value="camera">Camera</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </label>
        </div>
        <button
          className="mt-5 w-full rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
          type="submit"
        >
          {busy ? "Generating secure token..." : "Provision device"}
        </button>
        {provisioned ? (
          <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/75">
            <strong className="text-white">{provisioned.device.node_id}</strong> created. QR payload:
            <span className="mt-2 block break-all rounded-2xl bg-black/30 p-3 font-mono text-xs text-cyan-100">
              {provisioned.qr_payload}
            </span>
          </div>
        ) : null}
      </form>

      <section className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Inventory</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Provisioned device registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-black/25 text-[11px] uppercase tracking-[0.2em] text-white/40">
              <tr>
                {["Device", "Building", "Floor", "Zone", "Firmware", "Status"].map((heading) => (
                  <th className="px-4 py-3" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.devices.map((node: IotNode) => (
                <tr className="border-t border-white/10 text-white/65" key={node.node_id}>
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-white">{node.label}</span>
                    <span className="text-xs text-cyan-100/55">{node.node_id}</span>
                  </td>
                  <td className="px-4 py-4">{node.building}</td>
                  <td className="px-4 py-4">{node.floor}</td>
                  <td className="px-4 py-4">{node.zone}</td>
                  <td className="px-4 py-4">{node.firmware_version}</td>
                  <td className="px-4 py-4">{node.status.replaceAll("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
