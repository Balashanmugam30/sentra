"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import type { Incident } from "@/lib/api/incident";

type ControlSidePanelProps = {
  activePanel: "none" | "incidents" | "controls" | "ai" | "analytics";
  incidents: Incident[];
  onClose: () => void;
};

const panelContent = {
  incidents: {
    eyebrow: "Incident Feed",
    title: "No incidents yet",
    description: "Live crisis events will appear here once the command surface receives an active signal.",
  },
  controls: {
    eyebrow: "System Controls",
    title: "Control panel",
    description: "Response controls and automation triggers will be available here as the system comes online.",
  },
  ai: {
    eyebrow: "AI Insights",
    title: "Analyzing system...",
    description: "Sentra AI is standing by to interpret telemetry, summarize risk, and recommend next actions.",
  },
  analytics: {
    eyebrow: "Telemetry",
    title: "Processing telemetry...",
    description: "Operational metrics and predictive analytics will stream into this panel once connected.",
  },
} as const;

export function ControlSidePanel({ activePanel, incidents, onClose }: ControlSidePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const content =
    activePanel === "none"
      ? null
      : activePanel === "incidents"
        ? {
            eyebrow: "Incident Feed",
            title: incidents.length === 0 ? "No incidents yet" : `${incidents.length} active incidents`,
            description:
              incidents.length === 0
                ? "Live crisis events will appear here once the command surface receives an active signal."
                : "Live crisis events are streaming from the backend incident feed.",
          }
        : panelContent[activePanel];

  useEffect(() => {
    if (activePanel === "none") {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
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
  }, [activePanel, onClose]);

  return (
    <AnimatePresence>
      {content ? (
        <motion.aside
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          className="pointer-events-none fixed inset-y-0 right-0 z-[80] flex items-start justify-end px-6 pb-8 pt-24 md:px-8 md:pt-28"
          exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
          initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
        >
          <div
            className="pointer-events-auto h-full w-full max-w-80 rounded-[28px] border p-6 backdrop-blur-2xl"
            ref={panelRef}
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface)",
              boxShadow: "var(--sentra-shadow-panel)",
            }}
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="space-y-3">
                <p
                  className="text-[0.7rem] uppercase tracking-[0.26em]"
                  style={{ color: "var(--sentra-text-soft)" }}
                >
                  {content.eyebrow}
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                  {content.title}
                </h2>
                <p className="max-w-xs text-sm leading-7" style={{ color: "var(--sentra-text-muted)" }}>
                  {content.description}
                </p>
              </div>

              <div className="mt-8 flex-1 rounded-[22px] border p-4" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface-soft)" }}>
                {activePanel === "incidents" ? (
                  incidents.length === 0 ? (
                    <div className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      No incidents yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((item, index) => (
                        <div
                          className="rounded-[18px] border px-4 py-3 text-sm"
                          key={`${item.id}-${item.status}-${index}`}
                          style={{
                            borderColor: "var(--sentra-border-subtle)",
                            background: "var(--surface)",
                            color: "var(--text)",
                          }}
                        >
                          {item.type} - {item.status}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="h-2 w-24 rounded-full" style={{ background: "var(--surface-strong)" }} />
                    <div className="h-2 w-36 rounded-full" style={{ background: "var(--surface-strong)" }} />
                    <div className="h-24 rounded-[18px] border" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface)" }} />
                  </div>
                )}
              </div>

              <button
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition-all duration-200 ease-in-out hover:-translate-y-0.5"
                onClick={onClose}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                }}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
