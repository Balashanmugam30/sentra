"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { create } from "zustand";

export type WorkspaceMode = "command" | "executive" | "demo" | "crisis";

export const workspaceModes: WorkspaceMode[] = ["command", "executive", "demo", "crisis"];

const WORKSPACE_MODE_KEY = "sentra-workspace-mode";

type WorkspaceState = {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  restoreMode: () => void;
};

export function isWorkspaceMode(value: string | null | undefined): value is WorkspaceMode {
  return workspaceModes.includes(value as WorkspaceMode);
}

function readStoredWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") {
    return "command";
  }

  const queryMode = new URLSearchParams(window.location.search).get("mode");
  if (isWorkspaceMode(queryMode)) {
    return queryMode;
  }

  const storedMode = window.localStorage.getItem(WORKSPACE_MODE_KEY);
  if (isWorkspaceMode(storedMode)) {
    return storedMode;
  }

  return "command";
}

function persistWorkspaceMode(mode: WorkspaceMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WORKSPACE_MODE_KEY, mode);
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  mode: readStoredWorkspaceMode(),
  restoreMode: () => {
    set({ mode: readStoredWorkspaceMode() });
  },
  setMode: (mode) => {
    persistWorkspaceMode(mode);
    set({ mode });
  },
}));

export function useWorkspaceController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = useWorkspace((state) => state.mode);
  const setStoreMode = useWorkspace((state) => state.setMode);

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (isWorkspaceMode(queryMode) && queryMode !== mode) {
      setStoreMode(queryMode);
      return;
    }

    if (!queryMode) {
      const storedMode = readStoredWorkspaceMode();
      if (storedMode !== mode) {
        setStoreMode(storedMode);
      }
    }
  }, [mode, searchParams, setStoreMode]);

  const setMode = useCallback(
    (nextMode: WorkspaceMode) => {
      setStoreMode(nextMode);
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", nextMode);
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams, setStoreMode],
  );

  return { mode, setMode };
}
