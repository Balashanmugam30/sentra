"use client";

import { useEffect } from "react";

import { useUiStore } from "@/store/ui-store";
import type { AppTheme } from "@/types/env";

const STORAGE_KEY = "sentra-theme";

export function useTheme() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    if (saved) {
      setTheme(saved);
    }
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = theme;
    root.style.colorScheme = resolvedTheme;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolvedTheme = mediaQuery.matches ? "dark" : "light";
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.dataset.themeMode = "system";
      document.documentElement.style.colorScheme = resolvedTheme;
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [theme]);

  return { theme, setTheme };
}
