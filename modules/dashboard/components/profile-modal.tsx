"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type ProfileModalProps = {
  email?: string | null;
  name?: string | null;
  onNameChange: (value: string) => void;
  open: boolean;
  photoURL?: string | null;
  username?: string;
  onUsernameChange: (value: string) => void;
  onClose: () => void;
  onSave: (payload: { name: string; username: string }) => void;
};

export function ProfileModal({
  email,
  name,
  onNameChange,
  open,
  photoURL,
  username,
  onUsernameChange,
  onClose,
  onSave,
}: ProfileModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!dialogRef.current?.contains(event.target as Node)) {
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
  }, [name, onClose, open, username]);

  const avatarLabel = (name?.trim() || email?.trim() || "S").charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[10020] flex items-center justify-center px-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          style={{ background: "var(--sentra-overlay)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl rounded-[32px] border p-6 backdrop-blur-xl"
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            ref={dialogRef}
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              boxShadow: "var(--sentra-shadow-panel)",
            }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border text-lg font-semibold"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                {photoURL ? (
                  <Image
                    alt={name || email || "Sentra profile"}
                    className="object-cover"
                    fill
                    referrerPolicy="no-referrer"
                    sizes="64px"
                    src={photoURL}
                    unoptimized
                  />
                ) : (
                  avatarLabel
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--sentra-text-soft)" }}>
                  Profile
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Account details</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  Update the identity shown across the Sentra workspace.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="space-y-2">
                <label className="text-sm" htmlFor="profile-name" style={{ color: "var(--sentra-text-muted)" }}>
                  Name
                </label>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-150 ease-out focus:border-[var(--sentra-border-strong)] active:scale-[0.97]"
                  id="profile-name"
                  onChange={(event) => onNameChange(event.target.value)}
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--sentra-input-surface)",
                    color: "var(--text)",
                  }}
                  value={name ?? ""}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm" htmlFor="profile-username" style={{ color: "var(--sentra-text-muted)" }}>
                  Username
                </label>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-150 ease-out focus:border-[var(--sentra-border-strong)] active:scale-[0.97]"
                  id="profile-username"
                  onChange={(event) => onUsernameChange(event.target.value)}
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--sentra-input-surface)",
                    color: "var(--text)",
                  }}
                  value={username ?? ""}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm" htmlFor="profile-email" style={{ color: "var(--sentra-text-muted)" }}>
                  Email
                </label>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none transition-all duration-150 ease-out focus:border-[var(--sentra-border-strong)]"
                  id="profile-email"
                  readOnly
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--sentra-input-readonly)",
                    color: "var(--sentra-text-muted)",
                  }}
                  value={email ?? ""}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-150 ease-out hover:opacity-85 active:scale-[0.97]"
                onClick={onClose}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
                onClick={() => onSave({ name: name?.trim() ?? "", username: username?.trim() ?? "" })}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-strong)",
                  color: "var(--text)",
                }}
                type="button"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
