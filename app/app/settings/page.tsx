"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";
import { useTheme } from "@/hooks/use-theme";

function SettingsSection({
  children,
  description,
  open = false,
  title,
}: {
  children: React.ReactNode;
  description: string;
  open?: boolean;
  title: string;
}) {
  return (
    <details
      className="group rounded-[28px] border p-5 backdrop-blur-xl"
      open={open}
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <summary className="cursor-pointer list-none space-y-2 min-h-[44px] py-1 [&::-webkit-details-marker]:hidden">
        <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--sentra-text-soft)" }}>
          Section
        </p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text)]">{title}</h2>
            <p className="mt-2 text-sm leading-7" style={{ color: "var(--sentra-text-muted)" }}>
              {description}
            </p>
          </div>
          <span
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border text-sm transition-transform duration-200 ease-out group-open:rotate-45"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--sentra-surface)",
              color: "var(--text)",
            }}
          >
            +
          </span>
        </div>
      </summary>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </details>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [language, setLanguage] = useState("English");
  const [voice, setVoice] = useState("Sentra Core");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="settings-container px-6 pb-12 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6 py-2">
        <div className="space-y-3">
          <button
            className="inline-flex min-h-[44px] items-center gap-2 px-2 text-sm transition-all duration-200 ease-out hover:opacity-80 active:scale-[0.97]"
            onClick={() => router.back()}
            style={{ color: "var(--sentra-text-muted)" }}
            type="button"
          >
            <span aria-hidden="true">{"\u2190"}</span>
            <span>Back</span>
          </button>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--sentra-text-soft)" }}>
            Settings
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
            Platform settings
          </h1>
          <p className="max-w-2xl text-sm leading-7 md:text-base" style={{ color: "var(--sentra-text-muted)" }}>
            Refine your Sentra workspace, AI behavior, and session preferences from one stable control surface.
          </p>
        </div>

        <SettingsSection
          description="Choose how Sentra should render across every authenticated workspace."
          open
          title="Appearance"
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["light", "system"] as const).map((option) => (
                <button
                  className={`sentra-theme-choice ${theme === option ? "is-active" : ""}`}
                  key={option}
                  onClick={() => setTheme(option)}
                  type="button"
                >
                  <span>{option === "system" ? "Adaptive System" : "Enterprise Light"}</span>
                  <small>
                    {option === "system"
                      ? "Calibrated to device"
                      : "Standard porcelain interface"}
                  </small>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <label className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                Notifications
              </label>
              <button
                className="inline-flex h-14 w-full items-center justify-between rounded-2xl border px-4 text-sm font-medium transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.97]"
                onClick={() => setNotificationsEnabled((current) => !current)}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  boxShadow: "var(--sentra-shadow-floating)",
                }}
                type="button"
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex flex-col items-start">
                    <span>{notificationsEnabled ? "Enabled" : "Disabled"}</span>
                    <span className="text-xs" style={{ color: "var(--sentra-text-soft)" }}>
                      Activity alerts
                    </span>
                  </div>
                  <span
                    className="relative inline-flex h-6 w-[42px] items-center rounded-full transition-colors duration-200"
                    style={{
                      background: notificationsEnabled ? "var(--surface-strong)" : "var(--surface)",
                    }}
                  >
                    <span
                      className="absolute h-4.5 w-4.5 rounded-full transition-transform duration-200"
                      style={{
                        left: "0.25rem",
                        transform: notificationsEnabled ? "translateX(18px)" : "translateX(0)",
                        background: "var(--text)",
                      }}
                    />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          description="Monitor the environment and runtime metadata currently backing this session."
          title="System"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className="rounded-2xl border px-4 py-4"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--sentra-text-soft)" }}>
                Environment
              </p>
              <p className="mt-2 text-sm text-[var(--text)]">Production-ready mock environment</p>
            </div>
            <div
              className="rounded-2xl border px-4 py-4"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--sentra-text-soft)" }}>
                Version
              </p>
              <p className="mt-2 text-sm text-[var(--text)]">Sentra Console v2.2.3</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          description="Tune the assistant language and voice used across future AI interactions."
          title="Voice & AI"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm" htmlFor="language" style={{ color: "var(--sentra-text-muted)" }}>
                Language
              </label>
              <select
                className="h-11 w-full rounded-2xl border px-4 outline-none transition-all duration-200 ease-out focus:border-[var(--sentra-border-strong)]"
                id="language"
                onChange={(event) => setLanguage(event.target.value)}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--sentra-input-surface)",
                  color: "var(--text)",
                }}
                value={language}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm" htmlFor="voice" style={{ color: "var(--sentra-text-muted)" }}>
                Voice
              </label>
              <select
                className="h-11 w-full rounded-2xl border px-4 outline-none transition-all duration-200 ease-out focus:border-[var(--sentra-border-strong)]"
                id="voice"
                onChange={(event) => setVoice(event.target.value)}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--sentra-input-surface)",
                  color: "var(--text)",
                }}
                value={voice}
              >
                <option>Sentra Core</option>
                <option>Sentra Briefing</option>
                <option>Sentra Calm</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          description="Manage account access and securely end the current session."
          title="Security"
        >
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-200 ease-out hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
            type="button"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </SettingsSection>
      </div>
    </div>
  );
}
