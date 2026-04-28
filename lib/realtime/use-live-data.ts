"use client";

import { useEffect } from "react";

import { useLiveDataStore } from "@/lib/realtime/live-data-store";

export function useLiveDataEngine() {
  const start = useLiveDataStore((state) => state.start);

  useEffect(() => {
    start();
  }, [start]);

  return useLiveDataStore;
}
