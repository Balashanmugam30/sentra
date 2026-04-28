"use client";

import { useTenant } from "@/lib/tenant/use-tenant";

export function OrgAdminPanel() {
  const { org, settings } = useTenant();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(5,12,26,0.84),rgba(103,232,249,0.06))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/56">
        Organization Command Console
      </p>
      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.055em] text-white">
            {org?.organization_name ?? "Tenant Command Center"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            Tenant context is resolved from the secure auth session and propagated into cache namespaces, audit trails, reports, and command channels.
          </p>
        </div>
        <div className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50">
          {org?.plan?.plan_name ?? "Plan"} / {org?.org_role ?? "role"}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          ["Industry", org?.organization?.industry ?? "--"],
          ["Region", org?.organization?.country ?? "--"],
          ["Timezone", org?.organization?.timezone ?? "--"],
          ["Cache", org?.cache_namespace ?? "tenant:*"],
        ].map(([label, value]) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[22px] border border-white/10 bg-black/18 p-4">
        <p className="text-sm font-semibold text-white">Security policies</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(settings?.security_policies ?? {}).map(([key, value]) => (
            <span className="rounded-full border border-cyan-200/14 bg-cyan-200/8 px-3 py-1 text-xs text-cyan-50/78" key={key}>
              {key.replaceAll("_", " ")}: {String(value)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
