"use client";

import type { SecurityRoleDefinition } from "@/lib/securitycenter/types";

export function RoleMatrix({ roles }: { roles: SecurityRoleDefinition[] }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">RBAC</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Least-privilege role matrix</h2>
        </div>
        <span className="rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          {roles.length} roles
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {roles.map((role) => (
          <article key={role.role_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{role.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{role.tier}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-sm text-white/70">{role.users} users</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <span key={permission} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                  {permission}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
