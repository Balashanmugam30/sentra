"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { RoleBadge } from "@/components/security/role-badge";
import { liveSyncEngine, type LiveSyncSnapshot } from "@/services/realtime/live-sync-engine";
import { useWorkspace } from "@/lib/workspace/useWorkspace";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import { SentraLogo } from "@/components/brand/sentra-logo";

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
  { label: "Executive", mode: "executive" },
  { label: "Command", mode: "command" },
  { label: "Demo", mode: "demo" },
  { label: "Crisis", mode: "crisis" },
] as const;

type TopBarProps = {
  onOpenCommand?: () => void;
  onOpenNav?: () => void;
};

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
    if (typeof window === "undefined") return "";
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return "";
    try {
      const parsed = JSON.parse(stored) as { name?: string };
      return parsed.name?.trim() || "";
    } catch {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      return "";
    }
  });

  const [profileUsername, setProfileUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return "";
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
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const avatarLabel = useMemo(() => {
    const base = resolvedName || user?.email?.trim() || user?.phoneNumber?.trim() || "S";
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
      return { label: "Offline", tone: "offline" };
    }
    if (snapshot.status === "connected" && snapshot.socketHealthScore >= 75) {
      return { label: "System Live", tone: "live" };
    }
    return { label: "Syncing", tone: "syncing" };
  }, [liveSnapshot]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full border-b border-[#E4E9E1] bg-white/95 backdrop-blur-md">
        <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Hamburger (mobile) + Mode Switcher Pills */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E9E1] bg-white text-[#1F2937] transition hover:bg-[#F1F5F0] lg:hidden"
              onClick={onOpenNav}
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="lg:hidden">
              <SentraLogo size="sm" href="/app" className="shrink-0" />
            </div>

            {/* Quick Mode Switcher Pills */}
            <div
              aria-label="Workspace Mode Switcher"
              className="inline-flex items-center gap-1 rounded-lg border border-[#E4E9E1] bg-[#F1F5F0] p-1"
              role="tablist"
            >
              {topBarModes.map((item) => {
                const selected = item.mode === workspaceMode;
                return (
                  <button
                    aria-selected={selected}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      selected
                        ? "bg-white text-[#1F2937] shadow-xs font-bold"
                        : "text-[#586579] hover:text-[#1F2937] hover:bg-white/50"
                    }`}
                    key={item.mode}
                    onClick={() => {
                      setWorkspaceMode(item.mode);
                      router.push(`/app?mode=${item.mode}` as Route);
                    }}
                    role="tab"
                    type="button"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Search + Telemetry + Notifications + Profile */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {/* Command Search Trigger */}
            <button
              aria-label="Search commands"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E4E9E1] bg-[#F1F5F0] px-3 py-1.5 text-xs text-[#586579] transition hover:border-[#D3DBD0] hover:bg-white hover:text-[#1F2937]"
              onClick={onOpenCommand}
              type="button"
            >
              <svg className="h-4 w-4 text-[#738096]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m16 16 4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[0.62rem] font-semibold bg-white border border-[#E4E9E1] rounded text-[#738096]">
                ⌘K
              </kbd>
            </button>

            {/* Realtime Telemetry Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                realtimeBadge.tone === "live"
                  ? "bg-[#F1F8E5] text-[#3F6212] border-[#D3DBD0]"
                  : "bg-[#F1F5F0] text-[#586579] border-[#E4E9E1]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
              <span>{realtimeBadge.label}</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E9E1] bg-white text-[#586579] transition hover:bg-[#F1F5F0] hover:text-[#1F2937]"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  markNotificationsRead();
                }}
                type="button"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[0.625rem] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E4E9E1] bg-white p-3 shadow-xl z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E9E1]">
                    <span className="text-xs font-bold text-[#1F2937]">Notification Center</span>
                    <span className="text-[0.65rem] text-[#738096]">{notifications.length} events</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.slice(0, 6).map((notif) => (
                      <div key={notif.id} className="p-2.5 rounded-lg bg-[#F1F5F0] border border-[#E4E9E1] text-xs">
                        <div className="flex items-center justify-between font-semibold text-[#1F2937]">
                          <span>{notif.title}</span>
                          <span className="text-[0.65rem] text-[#738096]">{notif.severity}</span>
                        </div>
                        <p className="text-[#586579] text-[0.7rem] mt-0.5">{notif.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-[#738096] text-center py-4">No active notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <RoleBadge compact role={user?.role} />

            {/* Profile Avatar */}
            <button
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E4E9E1] bg-[#F1F5F0] text-xs font-bold text-[#1F2937] shadow-xs transition hover:border-[#D3DBD0]"
              onClick={() => setMenuOpen((prev) => !prev)}
              type="button"
            >
              {user?.photoURL ? (
                <Image
                  alt={resolvedName}
                  className="object-cover"
                  fill
                  sizes="36px"
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
