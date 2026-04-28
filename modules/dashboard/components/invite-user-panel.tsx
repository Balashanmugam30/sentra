"use client";

import { useState } from "react";

import type { OrgRole } from "@/lib/tenant/types";
import { useTenant } from "@/lib/tenant/use-tenant";

export function InviteUserPanel() {
  const { busyAction, inviteUser, lastAction } = useTenant();
  const [email, setEmail] = useState("new.operator@sentra.local");
  const [name, setName] = useState("New Operator");
  const [role, setRole] = useState<OrgRole>("operator");

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Invite User
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Tenant-scoped invitations with role guardrails
      </h2>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
        <input
          aria-label="Invite name"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/40"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <input
          aria-label="Invite email"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/40"
          onChange={(event) => setEmail(event.target.value)}
          value={email}
        />
        <select
          aria-label="Invite role"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/40"
          onChange={(event) => setRole(event.target.value as OrgRole)}
          value={role}
        >
          {["org_admin", "security_admin", "ops_admin", "billing_admin", "executive", "operator", "analyst", "viewer"].map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
          disabled={busyAction === "invite-user"}
          onClick={() => {
            void inviteUser({ email, name, role, department: "Command" });
          }}
          type="button"
        >
          {busyAction === "invite-user" ? "Inviting..." : "Send Invite"}
        </button>
      </div>
      {lastAction === "invite-user" ? <p className="mt-3 text-xs text-cyan-50/70">Invite created in tenant directory.</p> : null}
    </section>
  );
}
