"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { FirmwareRollout } from "@/components/iot/firmware-rollout";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotFirmware, releaseIotFirmware, rollbackIotFirmware } from "@/lib/iot/firmware";
import type { IotFirmwareData } from "@/lib/iot/types";

const fallbackFirmware: IotFirmwareData = {
  current_versions: { "edge-1.5.0": 4, "cam-1.2.4": 2, "hybrid-0.9.6": 1 },
  available_releases: [
    { version: "edge-1.6.0", target: "esp32", notes: "Wi-Fi reconnect hardening and telemetry buffering.", compatible_devices: ["utility_risk_node"], status: "canary_ready" },
    { version: "cam-1.3.0", target: "esp32_cam", notes: "Stable QVGA stream and snapshot recovery.", compatible_devices: ["corridor_camera"], status: "stable" },
  ],
  rollout: { active_version: "edge-1.6.0", rollout_percentage: 18, canary_devices: ["utility_node_01"], paused: false, rollback_available: "edge-1.5.0" },
  failed_upgrades: [{ node_id: "stair_cam_02", reason: "offline during rollout window", retry_window: "Tonight 02:00" }],
};

export default function IotFirmwarePage() {
  const [data, setData] = useState<IotFirmwareData>(fallbackFirmware);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadFirmware() {
      try {
        const response = await getIotFirmware();
        if (!cancelled) {
          setData(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setNotice(error instanceof Error ? `${error.message}. Showing firmware demo mode.` : "Showing firmware demo mode.");
        }
      }
    }
    void loadFirmware();
    return () => {
      cancelled = true;
    };
  }, []);

  const release = async (version: string, target: string) => {
    setBusy(true);
    try {
      setData((await releaseIotFirmware(version, 10, target)).data);
      setNotice(`${version} canary rollout started.`);
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    setBusy(true);
    try {
      setData((await rollbackIotFirmware()).data);
      setNotice("Rollback command accepted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">OTA Firmware</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">ESP32 rollout control center.</h1>
              </div>
              <Link className="h-fit rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back</Link>
            </div>
          </header>
          {notice ? <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50/75">{notice}</div> : null}
          <FirmwareRollout busy={busy} data={data} onRelease={(version, target) => { void release(version, target); }} onRollback={() => { void rollback(); }} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
