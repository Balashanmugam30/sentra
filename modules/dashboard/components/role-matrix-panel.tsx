"use client";

import { useRbac } from "@/lib/rbac/use-rbac";

export function RoleMatrixPanel() {
  const { roles } = useRbac();

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />
      <div className="relative z-10">
        <div className="space-y-2">
          <p
            className="text-[0.7rem] uppercase tracking-[0.26em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            Role Matrix Panel
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Enterprise roles, permission depth, and accessible command modules
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${role.role}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-medium capitalize text-[var(--text)]">
                  {role.role.replaceAll("_", " ")}
                </div>
                <div
                  className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]"
                  style={{
                    borderColor: "rgba(96, 165, 250, 0.24)",
                    background: "rgba(30, 64, 175, 0.16)",
                    color: "#dbeafe",
                  }}
                >
                  {role.security_level.replace("_", " ")}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission, permissionIndex) => (
                  <span
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
                    key={`${role.role}-${permission}-${permissionIndex}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--sentra-text-muted)",
                    }}
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
