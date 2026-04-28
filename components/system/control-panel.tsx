"use client";

import type { Route } from "next";
import { memo } from "react";
import { useRouter } from "next/navigation";

import { RequireRole } from "@/components/auth/RequireRole";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useAuth } from "@/lib/auth/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { captureError, captureEvent } from "@/lib/telemetry";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-[var(--shadow-soft)] transition hover:bg-[var(--color-surface-strong)] focus:outline-none focus:ring-2 focus:ring-brand"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ThemeIcon({ theme }: { theme: string }) {
  if (theme === "dark") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2.2M19.8 12H22M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </svg>
  );
}

export const ControlPanel = memo(function ControlPanel() {
  const loginRoute: Route = "/login";
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const mapZoom = useUiStore((state) => state.mapZoom);
  const setMapZoom = useUiStore((state) => state.setMapZoom);
  const setFeedbackMessage = useUiStore((state) => state.setFeedbackMessage);
  const experimentalSurface = useFeatureFlag("command_surface_experimental");

  const cycleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    setFeedbackMessage(`Theme set to ${nextTheme}.`);
    captureEvent("Control panel theme changed", {
      component: "ControlPanel",
      metadata: {
        theme: nextTheme,
      },
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setFeedbackMessage("Secure session ended.");
      captureEvent("Control panel logout completed", {
        component: "ControlPanel",
      });
      router.replace(loginRoute);
    } catch (error) {
      captureError("Logout interaction failed", error, {
        component: "ControlPanel",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-md",
        experimentalSurface ? "pr-3" : "",
      )}
    >
      <ControlButton label="Toggle theme" onClick={cycleTheme}>
        <ThemeIcon theme={theme} />
      </ControlButton>
      <ControlButton
        label="Zoom out"
        onClick={() => {
          const nextZoom = Math.max(0.75, mapZoom - 0.1);
          setMapZoom(nextZoom);
          setFeedbackMessage(`Map zoom set to ${nextZoom.toFixed(2)}x.`);
          captureEvent("Map zoom updated", {
            component: "ControlPanel",
            metadata: {
              zoom: nextZoom,
            },
          });
        }}
      >
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12h14" />
        </svg>
      </ControlButton>
      <ControlButton
        label="Zoom in"
        onClick={() => {
          const nextZoom = Math.min(1.5, mapZoom + 0.1);
          setMapZoom(nextZoom);
          setFeedbackMessage(`Map zoom set to ${nextZoom.toFixed(2)}x.`);
          captureEvent("Map zoom updated", {
            component: "ControlPanel",
            metadata: {
              zoom: nextZoom,
            },
          });
        }}
      >
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </ControlButton>
      <ControlButton label="Log out" onClick={() => void handleLogout()}>
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 4H6.8A1.8 1.8 0 0 0 5 5.8v12.4A1.8 1.8 0 0 0 6.8 20H9" />
          <path d="M16 16l4-4-4-4" />
          <path d="M20 12H9" />
        </svg>
      </ControlButton>
      <RequireRole roles={["super_admin", "admin", "security_manager", "operations_commander"]} fallback={null}>
        <ControlButton label="Settings">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.8a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0L4.2 18.7a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3.4a1 1 0 0 1-1-1v-1.8a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.8a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v1.8a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z" />
          </svg>
        </ControlButton>
      </RequireRole>
    </div>
  );
});
