"use client";

import { memo } from "react";

import { useTheme } from "@/hooks/use-theme";
import type { AppTheme } from "@/types/env";

const themes: { value: AppTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export const ThemeSwitcher = memo(function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border p-1"
      style={{
        borderColor: "var(--sentra-border-subtle)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-floating)",
      }}
    >
      {themes.map((option) => {
        const isActive = option.value === theme;

        return (
          <button
            key={option.value}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-out"
            onClick={() => setTheme(option.value)}
            style={
              isActive
                ? {
                    background: "var(--surface-strong)",
                    color: "var(--text)",
                  }
                : {
                    background: "transparent",
                    color: "var(--sentra-text-muted)",
                  }
            }
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
