"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { VisionPanel } from "@/components/iot/vision-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotVision } from "@/lib/iot/demo";
import type { IotVisionData } from "@/lib/iot/types";

const fallbackVision: IotVisionData = {
  privacy_rules: ["corridor_only", "lobby_only", "exit_only", "parking_only", "no_room_surveillance"],
  camera_zones: [
    { zone: "Floor 3 Corridor", camera_id: "corridor_cam_01", smoke_confidence: 12, crowd_density: 38, blocked_exit: false, slip_fall: false, queue_congestion: 24, visibility: 91 },
    { zone: "South Stairwell", camera_id: "stair_cam_02", smoke_confidence: 8, crowd_density: 14, blocked_exit: true, slip_fall: false, queue_congestion: 31, visibility: 74 },
  ],
  inference_pipeline: { mode: "privacy_safe_public_zone", face_recognition: false, room_surveillance: false, retention_hours: 24, edge_blur_enabled: true },
};

export default function IotVisionPage() {
  const [data, setData] = useState<IotVisionData>(fallbackVision);

  useEffect(() => {
    let cancelled = false;
    async function loadVision() {
      try {
        const response = await getIotVision();
        if (!cancelled) {
          setData(response.data);
        }
      } catch {
        if (!cancelled) {
          setData(fallbackVision);
        }
      }
    }
    void loadVision();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Vision Safety</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Privacy-safe camera intelligence.</h1>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>Back to IoT</Link>
            </div>
          </header>
          <VisionPanel data={data} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
