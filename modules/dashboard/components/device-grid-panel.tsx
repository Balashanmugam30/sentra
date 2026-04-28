"use client";

import { useHardware } from "@/lib/hardware/use-hardware";
import type { HardwareCommand } from "@/lib/hardware/types";

const quickCommands: Array<{ label: string; command: HardwareCommand }> = [
  { label: "Siren On", command: "siren_on" },
  { label: "Flash Beacon", command: "flash_beacon" },
  { label: "Restart", command: "restart_device" },
];

function formatSensors(sensors: string[]) {
  return sensors.join(" ");
}

export function DeviceGridPanel() {
  const { devices, commandDevice } = useHardware();

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />
      <div className="relative z-10">
        <div className="space-y-2">
          <p
            className="text-[0.7rem] uppercase tracking-[0.26em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            Registered Device Grid
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Edge nodes, sensor payloads, and live actuator controls across the building network
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(devices?.devices ?? []).map((device, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${device.device_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-medium text-[var(--text)]">{device.device_id}</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {device.zone} | {device.type.replaceAll("_", " ")}
                  </div>
                </div>
                <div
                  className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                  style={{
                    borderColor: device.online
                      ? "rgba(74, 222, 128, 0.22)"
                      : "rgba(248, 113, 113, 0.28)",
                    background: device.online
                      ? "rgba(20, 83, 45, 0.2)"
                      : "rgba(127, 29, 29, 0.2)",
                    color: device.online ? "#bbf7d0" : "#fecaca",
                  }}
                >
                  {device.online ? "Online" : "Offline"}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                <div>Battery {device.battery}%</div>
                <div>RSSI {device.rssi}</div>
                <div>Firmware {device.firmware}</div>
                <div>Mode {device.mode}</div>
                <div>Sensors: {formatSensors(device.sensors)}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickCommands.map((entry, index) => (
                  <button
                    className="rounded-full border px-3 py-2 text-xs font-medium"
                    key={`${device.device_id}-${entry.command}-${index}`}
                    onClick={() => {
                      void commandDevice(device.device_id, entry.command);
                    }}
                    style={{
                      borderColor: "rgba(148, 163, 184, 0.18)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text)",
                    }}
                    type="button"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
