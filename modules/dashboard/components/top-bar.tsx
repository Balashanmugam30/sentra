"use client";

import Image from "next/image";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { RoleBadge } from "@/components/security/role-badge";
import { liveSyncEngine, type LiveSyncSnapshot } from "@/services/realtime/live-sync-engine";
import { useWorkspace } from "@/lib/workspace/useWorkspace";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";

import { ProfileDropdown } from "@/modules/dashboard/components/profile-dropdown";
import { ProfileModal } from "@/modules/dashboard/components/profile-modal";

const PROFILE_STORAGE_KEY = "sentra-profile-preferences";

const workspaceModeLabels = {
  command: "Command",
  crisis: "Crisis",
  demo: "Demo",
  executive: "Executive",
};

const topBarModes = [
  { label: "Command", mode: "command" },
  { label: "Executive", mode: "executive" },
  { label: "Demo", mode: "demo" },
  { label: "Crisis", mode: "crisis" },
] as const;

type TopBarProps = {
  onOpenCommand?: () => void;
  onOpenNav?: () => void;
};

function getBreadcrumb(pathname: string) {
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    );

  if (segments.length === 0) {
    return ["Sentra"];
  }

  if (segments[0] === "App") {
    return ["Command", segments[1] ?? "Dashboard"];
  }

  return segments.slice(0, 3);
}

export function TopBar({ onOpenCommand, onOpenNav }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  useLiveDataEngine();
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const workspaceMode = useWorkspace((state) => state.mode);
  const setWorkspaceMode = useWorkspace((state) => state.setMode);
  const notifications = useLiveDataStore((state) => state.notifications);
  const markNotificationsRead = useLiveDataStore((state) => state.markNotificationsRead);
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) {
      return "";
    }

    try {
      const parsed = JSON.parse(stored) as { name?: string };
      return parsed.name?.trim() || "";
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return "";
    }
  });
  const [profileUsername, setProfileUsername] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) {
      return "";
    }

    try {
      const parsed = JSON.parse(stored) as { username?: string };
      return parsed.username?.trim() || "";
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return "";
    }
  });
  const [draftName, setDraftName] = useState("");
  const [draftUsername, setDraftUsername] = useState("");
  const [liveSnapshot, setLiveSnapshot] = useState<LiveSyncSnapshot | null>(() =>
    liveSyncEngine.getSnapshot(),
  );

  const resolvedName = profileName.trim() || user?.displayName || "Sentra User";
  const resolvedUsername = profileUsername.trim() || user?.username || user?.email?.split("@")[0] || "sentra-user";
  const breadcrumb = useMemo(() => getBreadcrumb(pathname), [pathname]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const avatarLabel = useMemo(() => {
    const base =
      resolvedName ||
      user?.email?.trim() ||
      user?.phoneNumber?.trim() ||
      "S";

    return base
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);
  }, [resolvedName, user?.email, user?.phoneNumber]);

  useEffect(() => {
    const unsubscribe = liveSyncEngine.subscribe(() => {
      setLiveSnapshot(liveSyncEngine.getSnapshot());
    });
    liveSyncEngine.start();
    return unsubscribe;
  }, []);

  const realtimeBadge = useMemo(() => {
    const snapshot = liveSnapshot;
    if (!snapshot || !snapshot.online || snapshot.status === "offline") {
      return {
        label: "Offline",
        tone: "offline",
      };
    }
    if (snapshot.status === "connected" && snapshot.socketHealthScore >= 75) {
      return {
        label: "System Live",
        tone: "live",
      };
    }
    return {
      label: "Syncing",
      tone: "syncing",
    };
  }, [liveSnapshot]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <>
      <header className="sentra-topbar sticky top-0 z-50 px-4 py-4 md:px-6 lg:px-8">
        <div className="sentra-topbar-inner glass-panel mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-4 rounded-[30px] px-4 py-3 md:px-5">
          <div className="sentra-topbar-breadcrumb flex min-w-0 items-center gap-3">
            <button
              aria-label="Open navigation"
              className="sentra-mobile-menu-button inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/78 transition hover:border-cyan-200/24 hover:bg-white/10 lg:hidden"
              onClick={onOpenNav}
              type="button"
            >
              <span className="h-4 w-4 border-y-2 border-current before:mt-[5px] before:block before:border-t-2 before:border-current" />
            </button>
            <div className="min-w-0">
              <p className="sentra-ui-label text-[0.62rem] font-bold uppercase tracking-[0.26em] text-white/48">
                Current workspace
              </p>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                <span className="sentra-topbar-mode-chip rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/78">
                  {workspaceModeLabels[workspaceMode]}
                </span>
                <nav
                  aria-label="Breadcrumb"
                  className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white"
                >
                  {breadcrumb.map((crumb, index) => (
                    <span className="flex min-w-0 items-center gap-2" key={`${crumb}-${index}`}>
                      {index > 0 ? <span className="text-white/22">/</span> : null}
                      <span className={index === breadcrumb.length - 1 ? "truncate" : "text-white/48"}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <button className="sentra-command-search" onClick={onOpenCommand} type="button">
            <span className="sentra-search-icon" aria-hidden="true">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </span>
            <span className="sentra-command-search-placeholder">
              Search commands, routes, incidents...
            </span>
            <kbd>Ctrl K</kbd>
          </button>

          <div className="sentra-topbar-right relative flex shrink-0 items-center gap-2 md:gap-3">
              <div
                aria-label="Quick mode switch"
                className="sentra-topbar-mode-switcher hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl xl:flex"
                role="tablist"
              >
                {topBarModes.map((item) => {
                  const selected = item.mode === workspaceMode;

                  return (
                    <button
                      aria-selected={selected}
                      className={`sentra-topbar-mode-pill ${selected ? "is-active" : ""}`}
                      key={item.mode}
                      onClick={() => {
                        setWorkspaceMode(item.mode);
                        router.push(`/dashboard?mode=${item.mode}` as Route);
                      }}
                      role="tab"
                      type="button"
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <span
                aria-label={`Realtime status ${realtimeBadge.label}`}
                className={`sentra-system-status-chip is-${realtimeBadge.tone}`}
              >
                <span className="sentra-system-status-dot" />
                {realtimeBadge.label}
              </span>
              <RoleBadge compact role={user?.role} />
              <div className="relative hidden sm:block">
              <button
                aria-label="View notifications"
                aria-expanded={notificationsOpen}
                className="sentra-notification-button"
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  markNotificationsRead();
                }}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 17H9" />
                  <path d="M18 10a6 6 0 1 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 ? <span className="sentra-notification-count">{unreadCount}</span> : null}
              </button>
              {notificationsOpen ? (
                <div className="sentra-notification-panel">
                  <div className="sentra-notification-panel-header">
                    <p className="sentra-notification-eyebrow">
                      Notification center
                    </p>
                    <p>Live command events and AI updates.</p>
                  </div>
                  <div className="sentra-notification-list">
                    {notifications.slice(0, 7).map((notification) => (
                      <article
                        className="sentra-notification-card"
                        key={notification.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="sentra-notification-title">{notification.title}</p>
                          <span className={`sentra-notification-severity is-${notification.severity}`}>
                            {notification.severity}
                          </span>
                        </div>
                        <p className="sentra-notification-body">{notification.message}</p>
                        <time className="sentra-notification-time" dateTime={notification.timestamp}>
                          {new Date(notification.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
              <button
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border text-sm font-medium text-foreground backdrop-blur-xl transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]"
                onClick={() => setMenuOpen((current) => !current)}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  boxShadow: "var(--sentra-shadow-floating)",
                }}
                type="button"
              >
                {user?.photoURL ? (
                  <Image
                    alt={profileName || user?.displayName || user?.email || "Sentra profile"}
                    className="object-cover"
                    fill
                    referrerPolicy="no-referrer"
                    sizes="44px"
                    src={user.photoURL}
                    unoptimized
                  />
                ) : (
                  avatarLabel || "S"
                )}
              </button>

            <ProfileDropdown
              email={user?.email}
              name={profileName || user?.displayName}
              photoURL={user?.photoURL}
              onClose={() => setMenuOpen(false)}
              onLogout={() => void handleLogout()}
              onProfile={() => {
                setMenuOpen(false);
                setDraftName(resolvedName);
                setDraftUsername(resolvedUsername);
                setProfileOpen(true);
              }}
              onSettings={() => {
                setMenuOpen(false);
                router.push("/app/settings");
              }}
              open={menuOpen}
            />
          </div>
        </div>
      </header>

      <ProfileModal
        email={user?.email}
        name={draftName}
        onNameChange={setDraftName}
        onClose={() => {
          setDraftName(resolvedName);
          setDraftUsername(resolvedUsername);
          setProfileOpen(false);
        }}
        onSave={({ name, username }) => {
          const nextName = name || user?.displayName || "Sentra User";
          const nextUsername = username || user?.username || user?.email?.split("@")[0] || "sentra-user";
          setProfileName(nextName);
          setProfileUsername(nextUsername);
          updateUserProfile({ displayName: nextName, username: nextUsername });
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              PROFILE_STORAGE_KEY,
              JSON.stringify({ name: nextName, username: nextUsername }),
            );
          }
          setProfileOpen(false);
        }}
        open={profileOpen}
        photoURL={user?.photoURL}
        username={draftUsername}
        onUsernameChange={setDraftUsername}
      />
    </>
  );
}
