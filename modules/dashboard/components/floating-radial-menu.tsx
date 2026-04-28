"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { emitEvent } from "@/lib/events/event-bus";

const actions = [
  { id: "Incident", label: "Incidents", angle: 200 },
  { id: "Controls", label: "Controls", angle: 240 },
  { id: "AI Insights", label: "AI Insights", angle: 300 },
  { id: "Analytics", label: "Analytics", angle: 340 },
] as const;

const MENU_RADIUS = 190;

type FloatingRadialMenuProps = {
  activeItem: "Incident" | "Controls" | "AI Insights" | "Analytics" | "none";
  open: boolean;
  onClose: () => void;
  onSelect: (item: "AI Insights" | "Incident" | "Controls" | "Analytics") => void;
  onToggle: () => void;
};

export function FloatingRadialMenu({
  activeItem,
  open,
  onClose,
  onSelect,
  onToggle,
}: FloatingRadialMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    <div
      className="pointer-events-none fixed bottom-32 left-1/2 z-50 -translate-x-1/2"
      ref={containerRef}
    >
      <div className="relative h-0 w-0">
        <motion.div
          animate={{
            opacity: open ? 0.1 : 0.05,
            scale: open ? 1.08 : 0.96,
          }}
          className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, color-mix(in srgb, var(--text) 8%, transparent), transparent 72%)",
          }}
          transition={{ duration: 0.26, ease: "easeInOut" }}
        />

        <AnimatePresence>
          {open ? (
            <>
              {actions.map((action, index) => {
                const isActive = activeItem === action.id;
                const transform = `translate(-50%, -50%) rotate(${action.angle}deg) translate(${MENU_RADIUS}px) rotate(${-action.angle}deg)`;

                return (
                    <div
                      className="absolute left-1/2 top-1/2 translate-y-36"
                    key={`${action.id}-${index}`}
                    style={{
                      transform,
                      transformOrigin: "center",
                    }}
                  >
                    <motion.button
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="pointer-events-auto inline-flex h-12 min-w-[8rem] items-center justify-center whitespace-nowrap rounded-full border px-4 text-sm font-medium"
                      exit={{ opacity: 0, scale: 0.82, y: 6 }}
                      initial={{ opacity: 0, scale: 0.82, y: 6 }}
                      onClick={() => {
                        if (action.id === "Incident") {
                          emitEvent({
                            id: crypto.randomUUID(),
                            type: "INCIDENT_CREATED",
                            source: "user",
                            timestamp: Date.now(),
                            payload: {
                              type: "manual",
                              severity: 1,
                              location: "dashboard",
                            },
                          });
                        }

                        onSelect(action.id);
                      }}
                      style={{
                        borderColor: isActive ? "var(--sentra-border-strong)" : "var(--border)",
                        background: isActive ? "var(--surface-strong)" : "var(--surface)",
                        boxShadow: isActive ? "var(--sentra-shadow-glow)" : "var(--sentra-shadow-floating)",
                        color: "var(--text)",
                      }}
                      transition={{
                        duration: 0.24,
                        delay: index * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      type="button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {action.label}
                    </motion.button>
                  </div>
                );
              })}
            </>
          ) : null}
        </AnimatePresence>

        <motion.button
          animate={{ rotate: open ? 45 : 0, scale: open ? 1.03 : 1 }}
          className="pointer-events-auto absolute bottom-0 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border text-[1.7rem] font-light backdrop-blur-2xl"
          onClick={onToggle}
          style={{
            borderColor: "var(--sentra-border-strong)",
            background: "var(--surface)",
            boxShadow: "0 0 12px rgba(120, 94, 235, 0.25), 0 0 20px rgba(56, 189, 248, 0.15)",
            animation: "sentra-fab-breathe 5.8s ease-in-out infinite",
            color: "var(--text)",
          }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          type="button"
          whileHover={{
            scale: 1.05,
            y: -2,
            boxShadow: "0 0 18px rgba(120, 94, 235, 0.3), 0 0 26px rgba(56, 189, 248, 0.18)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className="pointer-events-none absolute inset-[1px] rounded-full"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface-soft)",
            }}
          />
          <span className="relative z-10">+</span>
        </motion.button>
      </div>
    </div>
  );
}
