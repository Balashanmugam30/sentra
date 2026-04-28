"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";

import { SystemHealth } from "@/components/system/system-health";
import { captureError, captureEvent } from "@/lib/telemetry";
import { logout } from "@/modules/auth/api/auth-client";
import { MapStage } from "@/modules/map/components/map-stage";
import { useAuthStore } from "@/store/auth-store";

import { ActionCard } from "./action-card";
import { AIInsightCard } from "./ai-insight-card";

function UserAvatar({
  name,
  photoURL,
}: {
  name: string | null;
  photoURL: string | null;
}) {
  if (photoURL) {
    return (
      <span
        aria-label={name ?? "User avatar"}
        className="h-9 w-9 rounded-full border border-[var(--color-border)] bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url(${photoURL})` }}
      />
    );
  }

  const label = (name ?? "S").trim().charAt(0).toUpperCase();

  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-foreground">
      {label}
    </span>
  );
}

export const CommandSurface = memo(function CommandSurface() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    const response = await logout();

    if (!response.success) {
      captureError("Dashboard logout failed", response.error, {
        component: "CommandSurface",
      });
      return;
    }

    clearSession();
    captureEvent("Dashboard logout completed", {
      component: "CommandSurface",
    });
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-canvas text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-5 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5">
          <div className="space-y-1">
            <div className="text-lg font-medium tracking-[-0.02em] text-foreground">Sentra</div>
            <p className="text-sm text-muted">Crisis Intelligence Platform</p>
          </div>

          <div className="flex items-center gap-3">
            <UserAvatar name={user?.displayName ?? user?.email ?? null} photoURL={user?.photoURL ?? null} />
            <button
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-foreground transition-all duration-150 ease-out hover:bg-[var(--color-surface-strong)] active:scale-[0.98]"
              onClick={() => void handleLogout()}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 py-6 lg:flex-row">
          <section className="flex min-h-[420px] flex-1 lg:min-h-0 lg:basis-[70%]">
            <MapStage />
          </section>

          <aside className="flex w-full flex-col gap-4 lg:max-w-[380px] lg:basis-[30%]">
            <SystemHealth />
            <ActionCard />
            <AIInsightCard />
          </aside>
        </div>
      </div>
    </main>
  );
});
