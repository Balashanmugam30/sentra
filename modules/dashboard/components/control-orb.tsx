"use client";

import { AnimatePresence, motion } from "framer-motion";

type ControlItem = {
  id: "ai" | "incidents" | "controls" | "analytics";
  label: string;
  angle: number;
  distance: number;
};

const items: ControlItem[] = [
  { id: "ai", label: "AI Insights", angle: -105, distance: 108 },
  { id: "incidents", label: "Incidents", angle: -68, distance: 124 },
  { id: "controls", label: "Controls", angle: -22, distance: 118 },
  { id: "analytics", label: "Analytics", angle: 24, distance: 102 },
];

type ControlOrbProps = {
  open: boolean;
  onToggle: () => void;
  onSelect: (id: ControlItem["id"]) => void;
};

export function ControlOrb({ open, onToggle, onSelect }: ControlOrbProps) {
  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {open
          ? items.map((item, index) => {
              const radians = (item.angle * Math.PI) / 180;
              const x = Math.cos(radians) * item.distance;
              const y = Math.sin(radians) * item.distance;

              return (
                <motion.button
                  key={`${item.id}-${index}`}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  className="absolute inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(17,24,39,0.76)] px-4 text-xs font-medium text-foreground shadow-[var(--shadow-floating)] backdrop-blur-xl transition-colors duration-200 ease-out hover:bg-[rgba(22,31,45,0.9)]"
                  exit={{ opacity: 0, scale: 0.82, x: 0, y: 0 }}
                  initial={{ opacity: 0, scale: 0.82, x: 0, y: 0 }}
                  onClick={() => onSelect(item.id)}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  type="button"
                >
                  {item.label}
                </motion.button>
              );
            })
          : null}
      </AnimatePresence>

      <motion.button
        animate={{ rotate: open ? 45 : 0 }}
        className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(17,24,39,0.72)] text-2xl font-light text-foreground shadow-[0_0_32px_rgba(108,84,193,0.18)] backdrop-blur-xl transition-colors duration-200 ease-out hover:bg-[rgba(22,31,45,0.9)]"
        onClick={onToggle}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        type="button"
      >
        <span aria-hidden="true">+</span>
      </motion.button>
    </div>
  );
}
