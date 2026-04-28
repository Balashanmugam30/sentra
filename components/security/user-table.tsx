"use client";

import { formatSecurityDate, riskTone, statusTone } from "@/lib/securitycenter/runtime";
import type { SecurityRoleDefinition, SecurityUser } from "@/lib/securitycenter/types";

type UserTableProps = {
  users: SecurityUser[];
  roles: SecurityRoleDefinition[];
  busyAction: string | null;
  onDisable: (userId: string) => void;
  onResetMfa: (userId: string) => void;
  onChangeRole: (userId: string, role: string) => void;
};

export function UserTable({ users, roles, busyAction, onDisable, onResetMfa, onChangeRole }: UserTableProps) {
  const roleNames = roles.map((role) => role.name);
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">User Lifecycle</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">All users</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 font-mono text-sm text-white/60">
          {users.length} identities
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[920px] border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.18em] text-white/40">
              <th className="px-4">User</th>
              <th className="px-4">Role</th>
              <th className="px-4">Status</th>
              <th className="px-4">MFA</th>
              <th className="px-4">Risk</th>
              <th className="px-4">Last Seen</th>
              <th className="px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="rounded-2xl bg-black/20 text-sm text-white/70">
                <td className="rounded-l-2xl px-4 py-4">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="mt-1 font-mono text-xs text-white/40">{user.email}</p>
                </td>
                <td className="px-4 py-4">
                  <label className="sr-only" htmlFor={`role-${user.id}`}>
                    Change role for {user.name}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none transition focus:border-cyan-200/50"
                    value={user.role}
                    onChange={(event) => onChangeRole(user.id, event.target.value)}
                  >
                    {roleNames.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusTone(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={user.mfa_enabled ? "text-emerald-200" : "text-amber-200"}>
                    {user.mfa_enabled ? "Enabled" : "Required"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-full border px-3 py-1 font-mono text-xs ${riskTone(user.risk_score)}`}>{user.risk_score}</span>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-white/45">{formatSecurityDate(user.last_seen)}</td>
                <td className="rounded-r-2xl px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-xl border border-amber-200/20 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50"
                      disabled={busyAction !== null || user.status === "disabled"}
                      onClick={() => onResetMfa(user.id)}
                      type="button"
                    >
                      Reset MFA
                    </button>
                    <button
                      className="rounded-xl border border-red-200/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/10 disabled:opacity-50"
                      disabled={busyAction !== null || user.status === "disabled"}
                      onClick={() => onDisable(user.id)}
                      type="button"
                    >
                      Disable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
