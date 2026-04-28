"use client";

import { useState } from "react";

import type { SecurityOrg, SecurityRoleDefinition } from "@/lib/securitycenter/types";

type InvitePanelProps = {
  orgs: SecurityOrg[];
  roles: SecurityRoleDefinition[];
  busyAction: string | null;
  onInvite: (email: string, name: string, role: string, orgId: string) => void;
};

export function InvitePanel({ orgs, roles, busyAction, onInvite }: InvitePanelProps) {
  const [email, setEmail] = useState("phase26.invite@sentra.demo");
  const [name, setName] = useState("Enterprise Invite");
  const [role, setRole] = useState("Viewer");
  const [orgId, setOrgId] = useState(orgs[0]?.org_id ?? "ORG-GRAND-MERIDIAN");

  return (
    <section className="rounded-[30px] border border-cyan-200/15 bg-cyan-200/[0.05] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Onboarding</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Invite user</h2>
      <p className="mt-2 text-sm leading-6 text-white/55">
        Invites are tenant-scoped, audited, and ready for email OTP, magic link, or organization SSO handoff.
      </p>
      <form
        className="mt-5 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onInvite(email, name, role, orgId);
        }}
      >
        <label className="grid gap-2 text-sm text-white/60">
          Name
          <input
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label className="grid gap-2 text-sm text-white/60">
          Email
          <input
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-white outline-none transition focus:border-cyan-200/50"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/60">
            Role
            <select
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50"
              onChange={(event) => setRole(event.target.value)}
              value={role}
            >
              {roles.map((item) => (
                <option key={item.role_id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-white/60">
            Organization
            <select
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50"
              onChange={(event) => setOrgId(event.target.value)}
              value={orgId}
            >
              {orgs.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.org_name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="mt-2 rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60"
          disabled={busyAction !== null}
          type="submit"
        >
          Send Secure Invite
        </button>
      </form>
    </section>
  );
}
