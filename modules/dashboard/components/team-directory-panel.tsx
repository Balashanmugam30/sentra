"use client";

import type { OrgRole } from "@/lib/tenant/types";
import { useTenant } from "@/lib/tenant/use-tenant";

const editableRoles: OrgRole[] = [
  "owner",
  "org_admin",
  "security_admin",
  "ops_admin",
  "billing_admin",
  "executive",
  "operator",
  "analyst",
  "viewer",
];

export function TeamDirectoryPanel() {
  const { busyAction, deactivateUser, updateUserRole, users } = useTenant();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Team Members
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Tenant-scoped user directory
      </h2>
      <div className="mt-5 grid gap-3">
        {(users?.users ?? []).map((user) => (
          <div
            className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-4 md:grid-cols-[1fr_auto_auto_auto]"
            key={`${user.tenant_id}-${user.user_id}`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="mt-1 text-xs text-white/46">{user.email}</p>
            </div>
            <select
              aria-label={`Role for ${user.email}`}
              className="rounded-full border border-cyan-200/14 bg-black/30 px-3 py-1 text-xs font-semibold text-cyan-50 outline-none focus:border-cyan-200/40"
              disabled={!user.active || busyAction === `role-${user.user_id}`}
              onChange={(event) => {
                void updateUserRole({ user_id: user.user_id, role: event.target.value as OrgRole });
              }}
              value={user.role}
            >
              {editableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/62">
              {user.active ? "Active" : "Invited"}
            </span>
            <button
              className="rounded-full border border-red-200/16 bg-red-300/8 px-3 py-1 text-xs font-semibold text-red-50 transition hover:bg-red-300/14 disabled:opacity-45"
              disabled={!user.active || busyAction === `deactivate-${user.user_id}`}
              onClick={() => {
                void deactivateUser({ user_id: user.user_id });
              }}
              type="button"
            >
              {busyAction === `deactivate-${user.user_id}` ? "Deactivating" : "Deactivate"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
