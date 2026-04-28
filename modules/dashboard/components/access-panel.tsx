"use client";

import { useRbac } from "@/lib/rbac/use-rbac";

function formatSecurityLevel(level: string | undefined) {
  return (level ?? "tier_4").replace("_", " ").toUpperCase();
}

export function AccessPanel() {
  const { accessibleModules, currentUser, permissionCount } = useRbac();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Access Intelligence Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            {currentUser?.name ?? "Sentra User"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Role", currentUser?.role ?? "viewer"],
            ["Permission Count", String(permissionCount)],
            ["Security Level", formatSecurityLevel(currentUser?.security_level)],
            ["Command Zones", String(accessibleModules.length)],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                {label}
              </div>
              <div className="mt-2 text-sm font-medium capitalize text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {accessibleModules.map((moduleName, index) => (
            <span
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-100"
              key={`${moduleName}-${index}`}
            >
              {moduleName.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
