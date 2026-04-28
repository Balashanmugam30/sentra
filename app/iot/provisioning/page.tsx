"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { ProvisionTable } from "@/components/iot/provision-table";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { getIotProvisioning, provisionIotDevice } from "@/lib/iot/provision";
import { buildMockIotSnapshot } from "@/lib/iot/mock";
import type { IotProvisionDevice, IotProvisioningData, IotProvisionResponse } from "@/lib/iot/types";

function fallbackProvisioning(): IotProvisioningData {
  const nodes = buildMockIotSnapshot().fleet.nodes;
  return {
    summary: {
      registered_devices: nodes.length,
      awaiting_install: 2,
      secure_tokens_issued: 18,
      bulk_import_ready: true,
    },
    devices: nodes,
    bulk_template_columns: ["label", "building", "floor", "zone", "node_type", "tenant", "firmware_version"],
  };
}

export default function IotProvisioningPage() {
  const [data, setData] = useState<IotProvisioningData>(fallbackProvisioning());
  const [provisioned, setProvisioned] = useState<IotProvisionResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProvisioning() {
      try {
        const response = await getIotProvisioning();
        if (!cancelled) {
          setData(response.data);
          setNotice(null);
        }
      } catch (error) {
        if (!cancelled) {
          setNotice(error instanceof Error ? `${error.message}. Showing provisioning demo mode.` : "Showing provisioning demo mode.");
        }
      }
    }
    void loadProvisioning();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProvision = async (device: IotProvisionDevice) => {
    try {
      const response = await provisionIotDevice(device);
      setProvisioned(response);
      setData((current) => ({
        ...current,
        summary: {
          ...current.summary,
          registered_devices: current.summary.registered_devices + 1,
          awaiting_install: current.summary.awaiting_install + 1,
          secure_tokens_issued: current.summary.secure_tokens_issued + 1,
        },
        devices: [response.device, ...current.devices],
      }));
      setNotice("Secure device provisioning package generated.");
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message}. Device form remains ready for retry.` : "Device form remains ready for retry.");
    }
  };

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#02040a,#020617)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Provisioning Center</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Enterprise device onboarding.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                  Generate secure IDs, tokens, QR cards, tenant assignments, and bulk import packages for installers.
                </p>
              </div>
              <Link className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10" href={"/iot" as Route}>
                Back to IoT
              </Link>
            </div>
          </header>
          {notice ? <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50/75">{notice}</div> : null}
          <section className="grid gap-3 md:grid-cols-4">
            {[
              ["Registered", data.summary.registered_devices],
              ["Awaiting Install", data.summary.awaiting_install],
              ["Tokens Issued", data.summary.secure_tokens_issued],
              ["Bulk Import", data.summary.bulk_import_ready ? "Ready" : "Disabled"],
            ].map(([label, value]) => (
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4" key={label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
              </div>
            ))}
          </section>
          <ProvisionTable data={data} onProvision={handleProvision} provisioned={provisioned} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
