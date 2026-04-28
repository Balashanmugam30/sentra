"use client";

import { useState } from "react";

import { useTenant } from "@/lib/tenant/use-tenant";

export function TenantBrandingPanel() {
  const { busyAction, org, updateBranding } = useTenant();
  const [color, setColor] = useState("#67e8f9");
  const [organizationName, setOrganizationName] = useState("");

  const appliedName = organizationName.trim() || org?.organization_name || undefined;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        White-Label Branding
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Tenant-owned visual identity for reports, email, and dashboard
      </h2>
      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl border border-white/10" style={{ background: org?.branding?.primary_color ?? color }} />
          <div>
            <p className="text-sm font-semibold text-white">{org?.branding?.pdf_report_header ?? "Sentra Command Report"}</p>
            <p className="mt-1 text-xs text-white/48">{org?.branding?.email_template_signature ?? "Sentra workspace signature"}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          aria-label="Tenant organization name"
          className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-cyan-200/40"
          onChange={(event) => setOrganizationName(event.target.value)}
          placeholder={org?.organization_name ?? "Organization name"}
          value={organizationName}
        />
        <input
          aria-label="Tenant accent color"
          className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-cyan-200/40"
          onChange={(event) => setColor(event.target.value)}
          value={color}
        />
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
          disabled={busyAction === "update-branding"}
          onClick={() => {
            void updateBranding({ organization_name: appliedName, primary_color: color });
          }}
          type="button"
        >
          {busyAction === "update-branding" ? "Updating..." : "Apply Branding"}
        </button>
      </div>
    </section>
  );
}
