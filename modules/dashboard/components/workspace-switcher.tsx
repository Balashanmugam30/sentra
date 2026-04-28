"use client";

import { useTenant } from "@/lib/tenant/use-tenant";

type WorkspaceSwitcherProps = {
  activeIncidents?: number;
  modeLabel?: string;
  onOpenCommand?: () => void;
  onJumpToOperations?: () => void;
};

export function WorkspaceSwitcher({
  activeIncidents = 0,
  modeLabel = "Command",
  onOpenCommand,
  onJumpToOperations,
}: WorkspaceSwitcherProps) {
  const { busyAction, org, switchWorkspace } = useTenant();
  const active = org?.tenant_id;
  const threatLevel = activeIncidents > 2 ? "Elevated" : activeIncidents > 0 ? "Watch" : "Stable";
  const threatTone =
    activeIncidents > 2
      ? "border-rose-300/22 bg-rose-400/10 text-rose-100"
      : activeIncidents > 0
      ? "border-amber-300/22 bg-amber-400/10 text-amber-100"
      : "border-emerald-300/22 bg-emerald-400/10 text-emerald-100";

  return (
    <section className="glass-panel relative overflow-hidden rounded-[34px] p-5 md:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.45),transparent)]" />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 text-xl font-semibold text-white shadow-[0_16px_44px_rgba(0,0,0,0.28)]"
            style={{ background: org?.branding?.primary_color ?? "rgba(103,232,249,0.14)" }}
          >
            {(org?.organization_name ?? "S").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.26em] text-cyan-100/54">
              {modeLabel} workspace
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.045em] text-white md:text-3xl">
              {org?.organization_name ?? "Sentra Workspace"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
              Premium command posture with live status, workspace switching, and quick response actions in one calm surface.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <div className={`rounded-2xl border px-4 py-3 ${threatTone}`}>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] opacity-70">Threat</p>
            <p className="mt-1 text-lg font-semibold">{threatLevel}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-400/10 px-4 py-3 text-cyan-100">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] opacity-70">Live</p>
            <p className="mt-1 text-lg font-semibold">{activeIncidents} Active</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white/78">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] opacity-70">Mode</p>
            <p className="mt-1 text-lg font-semibold">{modeLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-white/8 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(org?.workspaces ?? []).map((workspace) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                workspace.id === active
                  ? "border-cyan-200/30 bg-cyan-200/14 text-cyan-50"
                  : "border-white/10 bg-white/[0.045] text-white/62 hover:bg-white/[0.08]"
              }`}
              disabled={busyAction === `switch-${workspace.id}` || workspace.id === active}
              key={workspace.id}
              onClick={() => {
                void switchWorkspace(workspace.id);
              }}
              type="button"
            >
              {busyAction === `switch-${workspace.id}` ? "Switching..." : workspace.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={onOpenCommand} type="button">
            Command search
          </button>
          <button className="btn-primary" onClick={onJumpToOperations} type="button">
            Open operations
          </button>
        </div>
      </div>
    </section>
  );
}
