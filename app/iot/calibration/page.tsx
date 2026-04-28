"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CalibrationPanel } from "@/components/iot/calibration-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { calibrateIotNode, getIotFleet, getIotThresholds, updateIotThresholds } from "@/lib/iot/api";
import { buildMockIotSnapshot, buildMockThresholds } from "@/lib/iot/mock";
import type { IotCalibrationProfile, IotNode } from "@/lib/iot/types";

export default function IotCalibrationPage() {
  const [nodes, setNodes] = useState<IotNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState("utility_node_01");
  const [profile, setProfile] = useState<IotCalibrationProfile>(buildMockThresholds().thresholds);
  const [presets, setPresets] = useState<string[]>(buildMockThresholds().presets);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCalibration() {
      try {
        const [fleet, thresholds] = await Promise.all([getIotFleet(), getIotThresholds()]);
        if (cancelled) {
          return;
        }
        setNodes(fleet.nodes);
        setProfile(thresholds.thresholds);
        setPresets(thresholds.presets);
        setNotice(null);
      } catch (error) {
        const fallbackFleet = buildMockIotSnapshot().fleet;
        const fallbackThresholds = buildMockThresholds();
        if (cancelled) {
          return;
        }
        setNodes(fallbackFleet.nodes);
        setProfile(fallbackThresholds.thresholds);
        setPresets(fallbackThresholds.presets);
        setNotice(error instanceof Error ? `${error.message}. Using calibration demo mode.` : "Using calibration demo mode.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadCalibration();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveCalibration = async () => {
    setSaving(true);
    try {
      await updateIotThresholds(profile);
      await calibrateIotNode(selectedNodeId, profile);
      setNotice(`Calibration saved for ${selectedNodeId}.`);
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message}. Local calibration preview retained.` : "Local calibration preview retained.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.11),transparent_28%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">IoT Calibration</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  Tune sensor intelligence without touching firmware.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Per-node calibration profiles, building presets, and risk-threshold controls for real and simulated smart-node fleets.
                </p>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/iot">
                Back to IoT
              </Link>
            </div>
          </header>

          {notice ? <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50/75">{notice}</div> : null}

          <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45" htmlFor="iot-calibration-node">
              Target node
            </label>
            <select
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40"
              disabled={loading}
              id="iot-calibration-node"
              onChange={(event) => setSelectedNodeId(event.target.value)}
              value={selectedNodeId}
            >
              {nodes.map((node) => (
                <option key={node.node_id} value={node.node_id}>
                  {node.label} - {node.zone}
                </option>
              ))}
            </select>
          </section>

          <CalibrationPanel
            onChange={setProfile}
            onSave={() => {
              void saveCalibration();
            }}
            presets={presets}
            profile={profile}
            saving={saving}
          />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
