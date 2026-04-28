"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";
import { RoleBadge } from "@/components/security/role-badge";
import { useAuthStore } from "@/store/auth-store";

export function UserMenu() {
  const router = useRouter();
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{user.displayName ?? user.email}</p>
          <p className="truncate text-xs text-white/45">{user.email}</p>
        </div>
        <RoleBadge compact role={user.role} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
          onClick={() => router.push("/app/settings")}
          type="button"
        >
          Settings
        </button>
        <button
          className="rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/10"
          onClick={() => void logout().then(() => router.replace("/login"))}
          type="button"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
