"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type ProfileDropdownProps = {
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onSettings: () => void;
};

export function ProfileDropdown({
  email,
  name,
  photoURL,
  open,
  onClose,
  onLogout,
  onProfile,
  onSettings,
}: ProfileDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const avatarLabel = (name?.trim() || email?.trim() || "S").charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  return (
    <div className="relative" ref={containerRef}>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="sentra-profile-menu fixed right-6 top-[72px] z-[10001] w-80 rounded-[18px] border p-4 md:right-8"
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              boxShadow: "var(--sentra-shadow-panel)",
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  {photoURL ? (
                    <Image
                      alt={name?.trim() || email?.trim() || "Sentra profile"}
                      className="object-cover"
                      fill
                      referrerPolicy="no-referrer"
                      sizes="48px"
                      src={photoURL}
                      unoptimized
                    />
                  ) : (
                    avatarLabel
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">
                    {name?.trim() || "Sentra User"}
                  </p>
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--sentra-text-muted)" }}>
                    {email?.trim() || "Signed in"}
                  </p>
                </div>
              </div>
            </div>
            <div className="my-3 h-px" style={{ background: "var(--border)" }} />
            <button
              className="sentra-profile-menu-item"
              style={{ background: "transparent", color: "var(--text)" }}
              onClick={onProfile}
              type="button"
            >
              My Profile
            </button>
            <button
              className="sentra-profile-menu-item"
              style={{ background: "transparent", color: "var(--text)" }}
              onClick={onSettings}
              type="button"
            >
              Settings
            </button>
            <button
              className="sentra-profile-menu-item"
              style={{ background: "transparent", color: "var(--text)" }}
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
